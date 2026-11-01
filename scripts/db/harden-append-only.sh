#!/bin/sh
# Noujoude — append-only enforcement for ordinary application roles (ADR-019).
# Run as the bootstrap superuser AFTER every `payload migrate`, from the host:
#
#   docker compose exec -T postgres sh /opt/ndm-db/harden-append-only.sh
#   docker compose exec -T postgres sh /opt/ndm-db/verify-privileges.sh
#
# ALTER DEFAULT PRIVILEGES cannot name a table, so a per-table exception to the
# runtime role's DML grant has to be applied after the table exists. This script is
# that step, and it is idempotent: it can be re-run on every deploy.
#
# Three layers, because the specification is absolute about the outcome
# (Master Spec line 1356 "Audit records are protected from ordinary editing"; line
# 2664 "Ordinary users must not be able to silently edit or erase audit history";
# G.8 line 3822 "Audit records are append-only to ordinary application roles"):
#
#   1. grant   — REVOKE UPDATE, DELETE, TRUNCATE FROM ndm_runtime
#   2. trigger — BEFORE UPDATE OR DELETE raises, so the attempt fails loudly
#                instead of silently affecting zero rows. The trigger target is
#                ndm_guard.deny_trigger(), which RETURNS trigger; ndm_guard.deny(text)
#                RETURNS boolean and cannot be used here (see init-roles.sh)
#   3. RLS     — deny policies plus FORCE ROW LEVEL SECURITY, so the table owner
#                (ndm_migration) is also denied; only a superuser or a role with
#                BYPASSRLS can circumvent layer 3, and init-roles.sh refuses to
#                leave BYPASSRLS on an application identity. Layer 3 must be installed
#                with matching allow policies for SELECT and INSERT, because RLS is
#                default-deny per command: forcing it without them silently empties the
#                audit read path and blocks the append path.

set -eu   # no `pipefail`: BusyBox ash in the alpine image is the target shell

DB="${NDM_DATABASE:?NDM_DATABASE missing}"
APP_SCHEMA="${NDM_APP_SCHEMA:-public}"
GUARD_SCHEMA="${NDM_GUARD_SCHEMA:-ndm_guard}"
APPEND_ONLY="${NDM_APPEND_ONLY_TABLES:-audit_event}"

TABLES=""
for t in $APPEND_ONLY; do
  TABLES="${TABLES} UNION ALL SELECT '${APP_SCHEMA}' AS ns, '${t}' AS rel"
done
TABLES="$(printf '%s' "$TABLES" | sed "s/^ UNION ALL //")"

MISSING="$(psql -At -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${DB}" <<-EOSQL
  WITH want(ns, rel) AS (${TABLES})
  SELECT string_agg(w.ns || '.' || w.rel, ' ') FROM want w
  WHERE to_regclass(w.ns || '.' || w.rel) IS NULL;
EOSQL
)"

if [ -n "$MISSING" ]; then
  echo "[noujoude] append-only table(s) not present yet: $MISSING" >&2
  echo "[noujoude] nothing to harden; expected before the first migration, NOT after one." >&2
  exit 0
fi

for t in $APPEND_ONLY; do
  echo "[noujoude] hardening ${APP_SCHEMA}.${t}"
  # The heredoc body is flush-left on purpose: `<<-` strips only leading TABs, and a
  # space-indented EOSQL terminator would never close the document.
  psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${DB}" <<EOSQL
REVOKE UPDATE, DELETE, TRUNCATE ON TABLE ${APP_SCHEMA}.${t} FROM ndm_runtime;

DROP TRIGGER IF EXISTS ndm_append_only ON ${APP_SCHEMA}.${t};
CREATE TRIGGER ndm_append_only
  BEFORE UPDATE OR DELETE ON ${APP_SCHEMA}.${t}
  FOR EACH ROW EXECUTE FUNCTION ${GUARD_SCHEMA}.deny_trigger();

ALTER TABLE ${APP_SCHEMA}.${t} ENABLE ROW LEVEL SECURITY;
ALTER TABLE ${APP_SCHEMA}.${t} FORCE ROW LEVEL SECURITY;

-- Row-level security is default-deny *per command*. Enabling and forcing it without a SELECT policy
-- makes the audit trail read as EMPTY for ndm_reporting and for the Control Center's Audit module,
-- and without an INSERT policy it refuses the append path, which is the only write an append-only
-- relation may have. Both failures are silent rather than loud, which is worse than an error, so the
-- two allowing policies below are part of hardening and not an optional extra.
DROP POLICY IF EXISTS ndm_allow_select ON ${APP_SCHEMA}.${t};
CREATE POLICY ndm_allow_select ON ${APP_SCHEMA}.${t}
  AS PERMISSIVE FOR SELECT
  TO PUBLIC
  USING (true);

DROP POLICY IF EXISTS ndm_allow_insert ON ${APP_SCHEMA}.${t};
CREATE POLICY ndm_allow_insert ON ${APP_SCHEMA}.${t}
  AS PERMISSIVE FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

DROP POLICY IF EXISTS ndm_deny_update ON ${APP_SCHEMA}.${t};
CREATE POLICY ndm_deny_update ON ${APP_SCHEMA}.${t}
  AS PERMISSIVE FOR UPDATE
  TO PUBLIC
  USING (${GUARD_SCHEMA}.deny('UPDATE on ${APP_SCHEMA}.${t}'));

DROP POLICY IF EXISTS ndm_deny_delete ON ${APP_SCHEMA}.${t};
CREATE POLICY ndm_deny_delete ON ${APP_SCHEMA}.${t}
  AS PERMISSIVE FOR DELETE
  TO PUBLIC
  USING (${GUARD_SCHEMA}.deny('DELETE on ${APP_SCHEMA}.${t}'));
EOSQL
done

echo "[noujoude] append-only enforcement applied: ${APPEND_ONLY}"
