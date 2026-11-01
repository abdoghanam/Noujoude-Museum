#!/bin/sh
# Noujoude — privilege-state assertion (ADR-019 verification).
# Run after harden-append-only.sh, on every deploy and in CI:
#
#   docker compose exec -T postgres sh /opt/ndm-db/verify-privileges.sh
#
# Prints one PASS/FAIL line per invariant and exits non-zero on the first violation
# found in the cluster (it evaluates all of them, so one run gives the full picture).
# This is the guard against the failure mode the specification cares about: a grant
# that was widened by an earlier bootstrap, by a hand-run GRANT, or by a migration
# that added a table to the append-only list without hardening it.
#
# Positive controls are included deliberately. A permission test that only asserts
# denials passes on an empty or misconfigured cluster, which is exactly the "a
# successful build is not proof" trap (Master Spec line 3941/G.13; Standard §12).

set -eu   # no `pipefail`: BusyBox ash in the alpine image is the target shell

DB="${NDM_DATABASE:?NDM_DATABASE missing}"
APP_SCHEMA="${NDM_APP_SCHEMA:-public}"
GUARD_SCHEMA="${NDM_GUARD_SCHEMA:-ndm_guard}"
APPEND_ONLY="${NDM_APPEND_ONLY_TABLES:-audit_event}"

fail=0

check() {
  # check "<label>" "<sql returning 't'/'f'>"
  # A missing relation makes has_table_privilege raise; that is a FAIL, not a crash,
  # because "the audit table does not exist yet" must not read as "immutability holds".
  #
  # A query error is reported as ERROR and never as 'f'. The original helper ended in
  # `2>/dev/null || echo f`, which made a broken assertion indistinguishable from a
  # genuine violation. Measured 1 Nov 2026 against postgres:18.6-alpine: the trigger
  # check below referenced tg.tginternal, a column that does not exist in pg_trigger
  # (the real name is tgisinternal). psql raised, the error was discarded, and the
  # script printed "FAIL audit_event: append-only guard trigger attached (got: f)" --
  # an authoritative-looking security finding produced by an assertion that had never
  # been evaluated, in a cluster where the trigger demonstrably existed. Three
  # outcomes, not two, is the same lesson the residual-risk probe in
  # run-privilege-tests.sh had to learn on the same day.
  label="$1"; sql="$2"
  rc=0
  got="$(psql -AtX -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${DB}" -c "$sql" 2>&1)" || rc=$?
  if [ "$rc" -ne 0 ]; then
    printf 'ERROR %s\n' "$label"
    printf '      the assertion could not be evaluated, so it proves nothing either way;\n'
    printf '      psql exited %s and said:\n' "$rc"
    printf '%s\n' "$got" | sed 's/^/      /'
    fail=1
  elif [ "$got" = "t" ]; then
    printf 'PASS  %s\n' "$label"
  else
    printf 'FAIL  %s   (got: %s)\n' "$label" "${got:-<empty>}"
    fail=1
  fi
}

for t in $APPEND_ONLY; do
  fq="${APP_SCHEMA}.${t}"
  check "${t}: ndm_runtime may SELECT" \
    "SELECT has_table_privilege('ndm_runtime','${fq}','SELECT')"
  check "${t}: ndm_runtime may INSERT" \
    "SELECT has_table_privilege('ndm_runtime','${fq}','INSERT')"
  check "${t}: ndm_runtime may NOT UPDATE" \
    "SELECT NOT has_table_privilege('ndm_runtime','${fq}','UPDATE')"
  check "${t}: ndm_runtime may NOT DELETE" \
    "SELECT NOT has_table_privilege('ndm_runtime','${fq}','DELETE')"
  check "${t}: ndm_runtime may NOT TRUNCATE" \
    "SELECT NOT has_table_privilege('ndm_runtime','${fq}','TRUNCATE')"
  check "${t}: ndm_reporting may NOT DELETE" \
    "SELECT NOT has_table_privilege('ndm_reporting','${fq}','DELETE')"
  # tgisinternal, not tginternal: the latter is not a column of pg_trigger, and the
  # error it produced was the defect recorded in check() above.
  #
  # The assertion is deliberately narrower than "a trigger of this name exists". It also
  # requires the trigger to be enabled and to point at ndm_guard.deny_trigger(), so
  # neither ALTER TABLE ... DISABLE TRIGGER nor a same-named trigger attached to some
  # other function satisfies it. All of it is expressed as joins rather than regproc
  # casts, so a cluster missing the guard function reports the honest FAIL instead of
  # raising inside the assertion.
  check "${t}: append-only guard trigger attached, enabled, and bound to the guard function" \
    "SELECT EXISTS (SELECT 1 FROM pg_trigger tg
       JOIN pg_class c ON c.oid = tg.tgrelid
       JOIN pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_proc p ON p.oid = tg.tgfoid
       JOIN pg_namespace pn ON pn.oid = p.pronamespace
       WHERE tg.tgname = 'ndm_append_only'
         AND NOT tg.tgisinternal
         AND tg.tgenabled <> 'D'
         AND n.nspname = '${APP_SCHEMA}' AND c.relname = '${t}'
         AND pn.nspname = '${GUARD_SCHEMA}' AND p.proname = 'deny_trigger')"
  check "${t}: row-level security is FORCED (covers the table owner too)" \
    "SELECT COALESCE((SELECT relforcerowsecurity FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = '${APP_SCHEMA}' AND c.relname = '${t}'), false)"
  # The four policies are asserted individually, because RLS is default-deny per command and the two
  # *allowing* policies are as much a security requirement as the two denying ones: without
  # ndm_allow_select the audit trail silently reads as empty, and without ndm_allow_insert the
  # append path is refused. A check that only asserted the denials would pass on a table whose audit
  # data had become unreadable, which is the positive-control trap this script exists to avoid.
  check "${t}: RLS allows the audit read path (ndm_allow_select)" \
    "SELECT EXISTS (SELECT 1 FROM pg_policies p
       WHERE p.schemaname = '${APP_SCHEMA}' AND p.tablename = '${t}'
         AND p.policyname = 'ndm_allow_select' AND p.cmd = 'SELECT')"
  check "${t}: RLS allows the append path (ndm_allow_insert)" \
    "SELECT EXISTS (SELECT 1 FROM pg_policies p
       WHERE p.schemaname = '${APP_SCHEMA}' AND p.tablename = '${t}'
         AND p.policyname = 'ndm_allow_insert' AND p.cmd = 'INSERT')"
  check "${t}: RLS denies UPDATE (ndm_deny_update)" \
    "SELECT EXISTS (SELECT 1 FROM pg_policies p
       WHERE p.schemaname = '${APP_SCHEMA}' AND p.tablename = '${t}'
         AND p.policyname = 'ndm_deny_update' AND p.cmd = 'UPDATE')"
  check "${t}: RLS denies DELETE (ndm_deny_delete)" \
    "SELECT EXISTS (SELECT 1 FROM pg_policies p
       WHERE p.schemaname = '${APP_SCHEMA}' AND p.tablename = '${t}'
         AND p.policyname = 'ndm_deny_delete' AND p.cmd = 'DELETE')"
done

check "runtime: not a superuser" \
  "SELECT NOT rolsuper FROM pg_roles WHERE rolname = 'ndm_runtime'"
check "runtime: no BYPASSRLS" \
  "SELECT NOT rolbypassrls FROM pg_roles WHERE rolname = 'ndm_runtime'"
check "runtime: cannot create tables (no CREATE on schema ${APP_SCHEMA})" \
  "SELECT NOT has_schema_privilege('ndm_runtime','${APP_SCHEMA}','CREATE')"
check "reporting: read-only on every relation it can see" \
  "SELECT NOT EXISTS (SELECT 1 FROM information_schema.table_privileges p
      WHERE p.grantee = 'ndm_reporting' AND p.table_schema = '${APP_SCHEMA}'
        AND p.privilege_type IN ('INSERT','UPDATE','DELETE','TRUNCATE'))"
check "guard function exists and is executable by runtime" \
  "SELECT has_function_privilege('ndm_runtime','${GUARD_SCHEMA}.deny(text)','EXECUTE')"
# The owner needs EXECUTE too, or ADR-019 layer 3 denies it through an incidental
# "permission denied for function" instead of the guard's own RAISE EXCEPTION. Both refuse the
# statement, but only the designed one is evidence that the deny policy is what protects the audit
# trail — measured 1 Nov 2026 as behavioural cases G and H.
check "guard function is executable by the table owner (deny is delivered by design)" \
  "SELECT has_function_privilege('ndm_migration','${GUARD_SCHEMA}.deny(text)','EXECUTE')"
check "guard trigger function exists, RETURNS trigger, and is executable by runtime" \
  "SELECT has_function_privilege('ndm_runtime','${GUARD_SCHEMA}.deny_trigger()','EXECUTE')
     AND EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
       WHERE n.nspname = '${GUARD_SCHEMA}' AND p.proname = 'deny_trigger'
         AND p.prorettype = 'trigger'::regtype)"

# Positive control: the runtime identity must still be able to write ordinary
# relations, or the audit denial proves nothing about a working application.
# Same three-way treatment as check(): a query error must not be allowed to read as
# the count 0, because "the positive control could not be evaluated" and "the cluster
# has nothing ordinary to write" are different findings with different remedies.
WRC=0
WRITABLE="$(psql -AtX -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${DB}" -c \
  "SELECT count(*) FROM information_schema.table_privileges
    WHERE grantee = 'ndm_runtime' AND privilege_type = 'UPDATE'
      AND table_schema = '${APP_SCHEMA}'" 2>&1)" || WRC=$?
if [ "$WRC" -ne 0 ]; then
  echo "ERROR the positive control could not be evaluated; psql exited $WRC and said:"
  printf '%s\n' "$WRITABLE" | sed 's/^/      /'
  fail=1
elif [ "${WRITABLE:-0}" -gt 0 ]; then
  echo "PASS  runtime retains UPDATE on at least one ordinary relation (positive control)"
else
  echo "FAIL  runtime holds UPDATE on no relation at all — the cluster has no ordinary"
  echo "      tables to write, so the denials above are not evidence of a working app"
  fail=1
fi

if [ "$fail" -eq 0 ]; then
  echo "[noujoude] privilege state matches ADR-019"
else
  echo "[noujoude] privilege state violates ADR-019 — run harden-append-only.sh" >&2
fi
exit "$fail"
