#!/bin/sh
# Noujoude — ADR-019 privilege evidence harness (run on the HOST, needs a working
# Docker engine).
#
#   sh scripts/db/run-privilege-tests.sh
#   pnpm db:privilege-evidence         # the transcript is stdout; redirect to docs/
#                                      # when you want it recorded as gate evidence
#
# Why this exists: audit immutability (Master Spec line 1356, line 2664, G.8 line 3822)
# is a database property. Reading a script cannot evidence it, and this project's own
# rule is that reviewed text is not demonstrated behaviour. The harness therefore
# starts one throwaway PostgreSQL container, runs the real bootstrap script inside it,
# creates the representative pair of relations the way the migration stream will,
# applies harden-append-only.sh, and then attempts each mutation AS THE RELEVANT ROLE
# and records whether the server refused.
#
# Boundaries this script honours:
#   - it creates no project credential: the passwords below are random, exist only in
#     this container's environment, and are never written to a file or to .env;
#   - it uses its own container and volume names (ndm-privtest-*), so it cannot attach
#     to, restart, or delete the pre-existing noujoude-postgres* containers;
#   - it removes only what it created, and does so at the end of the run.
#
# Image note: the mandated image is postgres:18.6-alpine (ADR-004) and it is what this harness now
# defaults to. It used to default to postgres:16-alpine merely because that was the only tag cached
# on this host, which forced every real run to carry an IMAGE= override and produced transcripts
# labelled "PG 16 semantics" that could not evidence 18.6 at all. 18.6-alpine was pulled and measured
# on 1 Nov 2026 (digest sha256:10a5c69a83035ab5239f5620d708520e8b28f5aa1f2b20143e6024532edadfb5).
# The default and the mount point below must move together: an 18 image refuses /var/lib/postgresql/data.

set -u

# Git Bash (MSYS2) rewrites any argument that looks like a POSIX absolute path into a Windows path
# before docker sees it, so `docker exec ... sh /opt/ndm-db/harden-append-only.sh` arrives inside the
# container as `sh 'C:/Program Files/Git/opt/ndm-db/harden-append-only.sh'` and the run silently
# degrades to "can't open". Measured 1 Nov 2026 on this host. Both variables are inert on a real
# POSIX shell, so setting them unconditionally keeps the harness runnable from either.
MSYS_NO_PATHCONV=1
MSYS2_ARG_CONV_EXCL='*'
export MSYS_NO_PATHCONV MSYS2_ARG_CONV_EXCL

IMAGE="${IMAGE:-postgres:18.6-alpine}"
NAME="ndm-privtest-$$"
VOL="ndm-privtest-data-$$"
DB=ndmprivtest
ROOT=ndmbootstrap
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && (pwd -W 2>/dev/null || pwd))"

# Cleanup on EVERY exit path, not just the happy one. The three FATAL exits below used to leave the
# throwaway container and its volume behind — measured 1 Nov 2026: a run that aborted at the readiness
# loop left `ndm-privtest-329` and `ndm-privtest-data-329` on the host and had to be cleaned by hand.
# The names are PID-scoped, so this can only ever remove what the current run created and can never
# reach the pre-existing noujoude-postgres* containers or the noujoude-pgdata volume.
cleanup() {
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker volume rm "$VOL" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

pw() { od -An -tx1 -N16 /dev/urandom | tr -d ' \n'; }
PW_ROOT="$(pw)"; PW_MIG="$(pw)"; PW_RT="$(pw)"; PW_REP="$(pw)"

FAILED=0
PRIVFAIL=0

# try_as "<id>" "<role>" "<password>" "<expect ok|denied>" "<sql>"
#
# A non-zero exit is NOT by itself a denial. "relation does not exist", "Connection refused" and
# "syntax error" all exit non-zero too, and crediting them as `denied` makes every negative control
# pass vacuously. Measured 1 Nov 2026: on a run where the tables had never been created, 8 of the 14
# cases printed PASS purely because the server could not find the relation they were aimed at. Those
# outcomes are now classified INVALID and counted as failures, so a negative control only passes when
# the server actually refused the operation it was asked to perform.
try_as() {
  id="$1"; role="$2"; pwv="$3"; expect="$4"; sql="$5"
  out="$(docker exec -i -e "PGPASSWORD=$pwv" "$NAME" psql -X -q -v ON_ERROR_STOP=1 \
    -U "$role" -h 127.0.0.1 -d "$DB" -c "$sql" 2>&1)"
  rc=$?
  if [ "$rc" -eq 0 ]; then actual=ok; else actual=denied; fi
  vacuous=''
  case "$out" in
    *"Connection refused"*|*"server closed the connection"*|*"could not connect"*) vacuous='no-connection' ;;
    *"does not exist"*)                                                           vacuous='missing-object' ;;
    *"syntax error"*)                                                             vacuous='syntax-error' ;;
    *"password authentication failed"*)                                           vacuous='bad-credential' ;;
  esac
  if [ "$actual" = "$expect" ] && [ -z "$vacuous" ]; then
    verdict=PASS
  elif [ "$actual" = "$expect" ]; then
    verdict=INVALID; FAILED=$((FAILED + 1))
  else
    verdict=FAIL; FAILED=$((FAILED + 1))
  fi
  printf '%-7s %-2s %-14s expect=%-6s actual=%-7s %s\n' "$verdict" "$id" "$role" "$expect" "$actual" "$sql"
  if [ -n "$vacuous" ]; then
    printf '        NOT EVIDENCE: matched expectation for a reason unrelated to authorization (%s)\n' "$vacuous"
  fi
  if [ -n "$out" ]; then printf '        server said: %s\n' "$(printf '%s' "$out" | tr '\n' ' ' | cut -c1-220)"; fi
}

echo "== Noujoude ADR-019 privilege evidence =="
echo "image: $IMAGE    throwaway container: $NAME"
echo

# Mount point: /var/lib/postgresql, NOT /var/lib/postgresql/data. The postgres:18+ images moved to
# major-version-specific data subdirectories so that `pg_upgrade --link` works across a mount
# boundary; an 18 image given a volume at the old .../data path refuses to initialise and exits 1
# with "there appears to be PostgreSQL data in: /var/lib/postgresql/data (unused mount/volume)".
# Measured 1 Nov 2026 against postgres:18.6-alpine (see docs/TEST_AND_RELEASE_REPORT.md §3). The
# old path is still correct for postgres:16-alpine, so an IMAGE= override to a pre-18 tag would now
# need this mount reverted — the mandated image is 18.6 (ADR-004), so 18 semantics is the default.
docker run -d --name "$NAME" --volume "$VOL:/var/lib/postgresql" \
  -e POSTGRES_DB="$DB" -e POSTGRES_USER="$ROOT" -e POSTGRES_PASSWORD="$PW_ROOT" \
  -e NDM_DATABASE="$DB" \
  -e NDM_MIGRATION_PASSWORD="$PW_MIG" -e NDM_RUNTIME_PASSWORD="$PW_RT" \
  -e NDM_REPORTING_PASSWORD="$PW_REP" -e NDM_BACKUP_PASSWORD="$(pw)" \
  -v "$REPO_ROOT/scripts/db/init-roles.sh:/docker-entrypoint-initdb.d/10-init-roles.sh:ro" \
  -v "$REPO_ROOT/scripts/db:/opt/ndm-db:ro" \
  "$IMAGE" >/dev/null
if [ $? -ne 0 ]; then echo "FATAL: the container could not be started (engine unavailable?)"; exit 1; fi

echo "-- waiting for the server, then checking the bootstrap script's own output"
# The wait MUST be for TCP, not for the local socket. During initialisation docker-entrypoint.sh
# starts a temporary server with listen_addresses='' to run /docker-entrypoint-initdb.d/*, so a
# socket-only `pg_isready -U ... -d ...` reports ready while the real server does not exist yet and
# nothing answers on 127.0.0.1:5432. Measured 1 Nov 2026 against postgres:18.6-alpine: the readiness
# loop passed inside that window, the CREATE TABLE step was refused with "Connection refused", and
# all fourteen behavioural cases then ran against a database with no tables in it. Every later
# statement in this harness connects over TCP, so TCP readiness is the condition that matters.
tries=0
until docker exec "$NAME" pg_isready -h 127.0.0.1 -p 5432 -U "$ROOT" -d "$DB" >/dev/null 2>&1; do
  tries=$((tries + 1))
  if [ "$tries" -gt 60 ]; then echo "FATAL: server never became ready"; docker logs "$NAME" 2>&1 | tail -30; exit 1; fi
  sleep 2
done
# Positive confirmation, because "pg_isready answered" is not the same as "a query works".
if ! docker exec -i -e "PGPASSWORD=$PW_ROOT" "$NAME" psql -X -q -tA -v ON_ERROR_STOP=1 \
     -U "$ROOT" -h 127.0.0.1 -p 5432 -d "$DB" -c "SELECT 1" >/dev/null 2>&1; then
  echo "FATAL: the server answered pg_isready but refused a trivial query"; docker logs "$NAME" 2>&1 | tail -30; exit 1
fi
docker logs "$NAME" 2>&1 | grep -i "init-roles\|roles initialised\|append-only\|error" | head -6
echo "   (10-init-roles.sh ran as an entrypoint script; its echo lines above are its own report)"

echo
echo "-- representative relations, created as ndm_migration the way a migration will"
docker exec -i -e "PGPASSWORD=$PW_MIG" "$NAME" psql -X -q -v ON_ERROR_STOP=1 \
  -U ndm_migration -h 127.0.0.1 -d "$DB" <<'EOSQL'
CREATE TABLE artifact (id bigserial PRIMARY KEY, title text);
CREATE TABLE audit_event (
  id bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor text NOT NULL,
  action text NOT NULL,
  target_record text,
  outcome text
);
INSERT INTO artifact (title) VALUES ('seed row written by the migration identity');
EOSQL
if [ $? -ne 0 ]; then
  echo "FATAL: the representative relations could not be created as ndm_migration."
  echo "       Every behavioural case below would then run against an empty database, where a"
  echo "       missing relation is indistinguishable from a refused operation. Stopping rather than"
  echo "       reporting fourteen meaningless verdicts."
  docker logs "$NAME" 2>&1 | tail -30
  docker rm -f "$NAME" >/dev/null 2>&1 || true
  docker volume rm "$VOL" >/dev/null 2>&1 || true
  exit 1
fi

echo "-- idempotency: re-running init-roles.sh must tighten an existing cluster, not skip it"
# Captured, not piped: in a pipeline the exit status is `tail`'s, so a failed re-run would print its
# own last two lines and still report success.
IDEM_OUT="$(docker exec "$NAME" sh /docker-entrypoint-initdb.d/10-init-roles.sh 2>&1)"
IDEM_RC=$?
printf '%s\n' "$IDEM_OUT" | tail -2
if [ "$IDEM_RC" -ne 0 ]; then echo "FATAL: re-running init-roles.sh against an initialised cluster failed (rc=$IDEM_RC)"; exit 1; fi

echo
echo "-- applying harden-append-only.sh"
docker exec "$NAME" sh /opt/ndm-db/harden-append-only.sh
if [ $? -ne 0 ]; then echo "harden script failed"; PRIVFAIL=1; fi

echo
echo "-- verify-privileges.sh: grant-state assertions"
docker exec "$NAME" sh /opt/ndm-db/verify-privileges.sh
VRC=$?
# 0 is a clean grant state and 1 is a completed run that found a violation; both are meaningful.
# Anything else means the verifier itself did not run to completion, and its PASS lines must not be
# read as evidence. Measured 1 Nov 2026: a shell defect made the script abort with 127 part-way
# through, so a transcript that looked like "18 PASS, 1 counted failure" had in fact evaluated
# nothing after the point of collapse.
if [ "$VRC" -eq 1 ]; then
  echo "        the verifier completed and reported at least one violated invariant (exit 1)."
  PRIVFAIL=1
elif [ "$VRC" -ne 0 ]; then
  echo "EVIDENCE-INTEGRITY  verify-privileges.sh exited $VRC, which is neither 0 (clean) nor 1"
  echo "        (a completed run holding a violation). It did not finish, so the PASS lines above"
  echo "        are not evidence. Fix the verifier before drawing any conclusion about the cluster."
  PRIVFAIL=1
fi

echo
echo "-- behavioural matrix: each statement attempted AS the role that would run it"
try_as A ndm_runtime  "$PW_RT"  ok      "INSERT INTO audit_event (actor, action, target_record, outcome) VALUES ('ndm_runtime','TEST','artifact/1','success')"
try_as B ndm_runtime  "$PW_RT"  denied  "UPDATE audit_event SET outcome = 'tampered' WHERE id = 1"
try_as C ndm_runtime  "$PW_RT"  denied  "DELETE FROM audit_event WHERE id = 1"
try_as D ndm_runtime  "$PW_RT"  denied  "TRUNCATE audit_event"
try_as E ndm_runtime  "$PW_RT"  ok      "UPDATE artifact SET title = 'ordinary write still works' WHERE id = 1"
try_as F ndm_runtime  "$PW_RT"  denied  "CREATE TABLE should_not_exist (id int)"
try_as G ndm_migration "$PW_MIG" denied "UPDATE audit_event SET outcome = 'tampered' WHERE id = 1"
try_as H ndm_migration "$PW_MIG" denied "DELETE FROM audit_event WHERE id = 1"
try_as I ndm_migration "$PW_MIG" ok     "INSERT INTO audit_event (actor, action, outcome) VALUES ('ndm_migration','DDL','success')"
try_as J ndm_reporting "$PW_REP" ok     "SELECT count(*) FROM audit_event"
try_as K ndm_reporting "$PW_REP" denied "INSERT INTO audit_event (actor, action) VALUES ('ndm_reporting','TEST')"
try_as L ndm_reporting "$PW_REP" denied "DELETE FROM artifact WHERE id = 1"
try_as M ndm_runtime  "$PW_RT"  denied  "DROP POLICY ndm_deny_delete ON audit_event"
try_as N ndm_runtime  "$PW_RT"  denied  "ALTER TABLE audit_event DISABLE ROW LEVEL SECURITY"

echo
echo "-- audit trail survived the attempts: rows that exist after the matrix"
SURVIVE_OUT="$(docker exec -i -e "PGPASSWORD=$PW_REP" "$NAME" psql -X -q -v ON_ERROR_STOP=1 \
  -U ndm_reporting -h 127.0.0.1 -d "$DB" -c "SELECT id, actor, action, outcome FROM audit_event ORDER BY id" 2>&1)"
SURVIVE_RC=$?
printf '%s\n' "$SURVIVE_OUT"
if [ "$SURVIVE_RC" -ne 0 ]; then
  echo "        the survival query itself failed, so audit-trail survival is NOT evidenced by this run"
  PRIVFAIL=1
fi

echo
echo "-- residual risk, measured rather than asserted"
# Three outcomes, not two. The original probe read any non-zero exit as PROTECTED, which is wrong: a
# missing relation, a missing trigger and a refused operation all exit non-zero as well, so a run in
# which the guard had never been installed still printed the reassuring answer. Measured 1 Nov 2026 —
# that is exactly what happened, and it is why this probe now has to name the refusal it observed
# instead of inferring one from an exit code.
mig() {
  docker exec -i -e "PGPASSWORD=$PW_MIG" "$NAME" psql -X -q -tA -v ON_ERROR_STOP=1 \
    -U ndm_migration -h 127.0.0.1 -d "$DB" -c "$1" 2>&1
}

DROP_OUT="$(mig "DROP TRIGGER ndm_append_only ON audit_event")"
DROP_RC=$?
POL_OUT="$(mig "DROP POLICY IF EXISTS ndm_deny_update ON audit_event; DROP POLICY IF EXISTS ndm_deny_delete ON audit_event")"
POL_RC=$?

if [ "$DROP_RC" -eq 0 ]; then
  echo "VULNERABLE  the table owner (ndm_migration) CAN drop the guard trigger and the RLS"
  echo "            policies. It is a governed CI/deploy-only identity (DATABASE_URI_MIGRATION,"
  echo "            .env.example line 36), never reachable from the app or the CMS."

  # How far the exposure reaches, measured rather than asserted: with layer 2 and the denying half of
  # layer 3 removed, can the owner actually rewrite audit history? Answering this from reasoning would
  # leave the risk register unverified, and the answer determines whether the compensating control has
  # to be a detection or a prevention.
  TAMPER_OUT="$(mig "UPDATE audit_event SET outcome = 'tampered' WHERE id = 1")"
  TAMPER_RC=$?
  if [ "$TAMPER_RC" -eq 0 ]; then
    echo "            AND CAN rewrite it: with the trigger and the deny policies dropped the"
    echo "            owner's UPDATE succeeded, so the exposure is real, not theoretical."
  else
    case "$TAMPER_OUT" in
      *"permission denied"*|*"not permitted"*)
        echo "            but could NOT rewrite it: $(printf '%s' "$TAMPER_OUT" | tr '\n' ' ' | cut -c1-120)" ;;
      *)
        echo "            UPDATE outcome INCONCLUSIVE: $(printf '%s' "$TAMPER_OUT" | tr '\n' ' ' | cut -c1-120)"
        PRIVFAIL=1 ;;
    esac
  fi

  # The compensating control, tested instead of trusted. An authored CI workflow is not a verified
  # mitigation, so the detection is exercised here: verify-privileges.sh must now FAIL. If it printed
  # a clean result against a deliberately dismantled guard, the whole ADR-019 posture would rest on a
  # verifier that cannot see the tampering it exists to see.
  #
  # "Fails" has to be qualified. The first run of this test measured DETECTED and it was wrong: the
  # verifier had a shell defect that made it abort with exit 127, so it "failed" for a reason that had
  # nothing to do with the tampering. That is the same vacuous-match class try_as already refuses, so
  # only exit 1 (a completed run holding a failed assertion) counts as detection, and the output has to
  # name the guard that was removed. Measured 1 Nov 2026.
  echo
  echo "-- compensating control: does the verifier detect the removed guard? (expect a real FAIL)"
  CMP_OUT="$(docker exec "$NAME" sh /opt/ndm-db/verify-privileges.sh 2>&1)"
  CMP_RC=$?
  if [ "$CMP_RC" -eq 0 ]; then
    echo "CRITICAL  verify-privileges.sh PASSED with the trigger and deny policies dropped."
    echo "          The compensating control does not work; nothing in CI would catch this tampering."
    PRIVFAIL=1
  elif [ "$CMP_RC" -ne 1 ]; then
    echo "INVALID   the verifier exited $CMP_RC, not its assertion-failure code 1."
    echo "          It did not run to completion, so it is not evidence of detection. It said:"
    printf '%s\n' "$CMP_OUT" | sed 's/^/          /'
    PRIVFAIL=1
  else
    case "$CMP_OUT" in
      *"guard trigger"*)
        echo "DETECTED  verify-privileges.sh failed, and failed on the removed guard:"
        printf '%s\n' "$CMP_OUT" | grep -i 'guard trigger' | sed 's/^/          /' ;;
      *)
        echo "UNSPECIFIED the verifier exited 1 but never named the removed guard, so the detection"
        echo "            may be incidental. Its output was:"
        printf '%s\n' "$CMP_OUT" | sed 's/^/          /'
        PRIVFAIL=1 ;;
    esac
  fi

  # And the documented remediation is exercised, not described: re-running the hardening script must
  # restore a state the verifier accepts and must restore the denial itself.
  echo
  echo "-- remediation: re-apply the guard and re-test the denial (expect a real PASS)"
  HR_OUT="$(docker exec "$NAME" sh /opt/ndm-db/harden-append-only.sh 2>&1)"
  HR_RC=$?
  if [ "$HR_RC" -ne 0 ]; then
    echo "FAILED    harden-append-only.sh exited $HR_RC while restoring the guard. It said:"
    printf '%s\n' "$HR_OUT" | sed 's/^/          /'
    PRIVFAIL=1
  fi
  RES_OUT="$(docker exec "$NAME" sh /opt/ndm-db/verify-privileges.sh 2>&1)"
  RES_RC=$?
  if [ "$RES_RC" -eq 0 ]; then
    echo "RESTORED  verify-privileges.sh passes again after harden-append-only.sh (exit 0)."
  elif [ "$RES_RC" -ne 1 ]; then
    echo "INVALID   the post-remediation verifier run exited $RES_RC instead of completing; it said:"
    printf '%s\n' "$RES_OUT" | sed 's/^/          /'
    PRIVFAIL=1
  else
    echo "FAILED    the guard could not be restored: the verifier still reports violations."
    printf '%s\n' "$RES_OUT" | grep -E '^(FAIL|ERROR)' | sed 's/^/          /'
    PRIVFAIL=1
  fi
  RESTORE_DENY="$(mig "UPDATE audit_event SET outcome = 'tampered' WHERE id = 1")"
  case "$RESTORE_DENY" in
    *"not permitted"*|*"permission denied"*)
      echo "DENIED    the owner's UPDATE is refused again: $(printf '%s' "$RESTORE_DENY" | tr '\n' ' ' | cut -c1-120)" ;;
    *)
      echo "CRITICAL  after remediation the owner's UPDATE was NOT refused: $(printf '%s' "$RESTORE_DENY" | tr '\n' ' ' | cut -c1-120)"
      PRIVFAIL=1 ;;
  esac
elif [ "$POL_RC" -ne 0 ]; then
  echo "PROTECTED   the table owner cannot remove the guard."
  echo "            server said: $(printf '%s' "$DROP_OUT" | tr '\n' ' ' | cut -c1-200)"
else
  case "$DROP_OUT" in
    *"does not exist"*|*"Connection refused"*|*"could not connect"*)
      echo "INCONCLUSIVE  the drop was never refused — it could not be attempted."
      echo "              server said: $(printf '%s' "$DROP_OUT" | tr '\n' ' ' | cut -c1-200)"
      echo "              PROTECTED must NOT be recorded from this run: the guard trigger or the"
      echo "              audited relation was absent, so nothing was proven about the owner role."
      PRIVFAIL=1
      ;;
    *)
      echo "INCONCLUSIVE  the trigger drop was refused for a reason that must be read:"
      echo "              server said: $(printf '%s' "$DROP_OUT" | tr '\n' ' ' | cut -c1-200)"
      PRIVFAIL=1
      ;;
  esac
fi

echo
echo "-- server version actually tested"
SV="$(docker exec -i -e "PGPASSWORD=$PW_ROOT" "$NAME" psql -X -q -tA -U "$ROOT" -h 127.0.0.1 -d "$DB" -c "SHOW server_version")"
echo "$SV"
# Anti-mislabel control. Accepting a PostgreSQL 16 result as evidence of 18.6 compatibility is
# forbidden, and the old harness made that mistake easy: its default tag and its transcript label
# were independent. The tag's major version and the server's own report are therefore compared, and a
# disagreement invalidates the transcript rather than being printed beside it.
WANT_MAJOR="$(printf '%s' "$IMAGE" | sed -e 's/.*://' -e 's/[^0-9].*$//')"
GOT_MAJOR="$(printf '%s' "$SV" | sed -e 's/[^0-9].*$//')"
if [ -n "$WANT_MAJOR" ] && [ "$WANT_MAJOR" != "$GOT_MAJOR" ]; then
  echo "FATAL: image tag $IMAGE implies major version $WANT_MAJOR but the server reported $SV (major $GOT_MAJOR)."
  echo "       This transcript is not evidence for either version and must not be cited."
  PRIVFAIL=1
else
  echo "        server major version $GOT_MAJOR agrees with image tag $IMAGE — the transcript measures what it claims"
fi

echo
echo "-- teardown of what this run created (its own container and volume only)"
# Also performed by the EXIT trap, so the FATAL paths above clean up too; running it twice is
# harmless because both commands are guarded with `|| true`.
cleanup
echo "        removed $NAME and $VOL"

echo
if [ "$FAILED" -eq 0 ] && [ "$PRIVFAIL" -eq 0 ]; then
  echo "RESULT: every behavioural case matched expectation for an authorization reason, and the grant state passed."
  exit 0
fi
echo "RESULT: $FAILED behavioural case(s) did not match, or matched only vacuously (INVALID);"
echo "        grant-state / evidence-integrity failures: $PRIVFAIL."
exit 1
