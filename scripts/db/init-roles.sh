#!/bin/sh
# Noujoude — PostgreSQL role and privilege bootstrap (ADR-005 as refined by ADR-019,
# Standard §3.2 lines 99–106; Master Spec §8.16 line 1356, §16.19 line 2664,
# G.8 line 3822).
# Runs once, inside the container, as the bootstrap superuser, via
# /docker-entrypoint-initdb.d. Idempotent: re-running it re-tightens an
# already-initialised cluster instead of skipping it.
#
# Roles — no single credential can both mutate schema and serve traffic:
#   ndm_migration  - DDL only, owns the schema, used by `payload migrate` (CI/deploy only)
#   ndm_runtime    - DML only, NO DDL, NOT superuser; the identity the app connects as
#   ndm_reporting  - read-only, for analytics/audit queries and the read-only auditor
#   ndm_backup     - login + replication for pg_basebackup / PITR; no DML, no DDL
#
# Privilege model (ADR-019):
#   ndm_runtime holds SELECT, INSERT, UPDATE, DELETE on ordinary relations, and
#   SELECT, INSERT on the append-only relations listed in NDM_APPEND_ONLY_TABLES.
#   That reduced grant is created here as a *default-privilege carve-out cannot* be
#   expressed per table, so harden-append-only.sh applies it per table after each
#   migration and verify-privileges.sh fails CI when it is missing. This script
#   additionally revokes it here, so a cluster bootstrapped by the previous version
#   of this file is tightened on the next run.
#
# Never store these values in a browser bundle, a log line, or the CMS UI
# (Standard §5, §15).

# `pipefail` is deliberately not requested: the container's /bin/sh is BusyBox ash,
# and an unsupported option would abort the bootstrap before any role is created.
set -eu

DB="${NDM_DATABASE:?NDM_DATABASE missing}"
APP_SCHEMA="${NDM_APP_SCHEMA:-public}"
GUARD_SCHEMA="${NDM_GUARD_SCHEMA:-ndm_guard}"
# Space-separated list of relations that must stay append-only for ordinary
# application roles. Deliberately narrow: only what the specification names.
# `audit_event` is the custom Drizzle table behind AuditEvent (Master Spec §8.2 line
# 1051, §8.16 line 1356, G.8 line 3822; docs/DATA_MODEL.md §3.7 classifies it as a
# custom table precisely because a CMS collection cannot express a withheld grant).
# CMS revision tables are a *candidate* and are NOT listed: Payload's own
# version-retention behaviour (deleting superseded revisions) has never been
# observed in this project, and enforcing DELETE-off an unverified behaviour
# breaks the app rather than the audit trail.
APPEND_ONLY="${NDM_APPEND_ONLY_TABLES:-audit_event}"

sql_list() {
  # audit_event -> 'audit_event','x'
  for t in $APPEND_ONLY; do
    printf "'%s'," "$t"
  done
}
APPEND_ONLY_QUOTED="$(sql_list)"
APPEND_ONLY_QUOTED="${APPEND_ONLY_QUOTED%,}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${DB}" <<-EOSQL
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ndm_migration') THEN
      CREATE ROLE ndm_migration LOGIN PASSWORD '${NDM_MIGRATION_PASSWORD}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ndm_runtime') THEN
      CREATE ROLE ndm_runtime LOGIN PASSWORD '${NDM_RUNTIME_PASSWORD}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ndm_reporting') THEN
      CREATE ROLE ndm_reporting LOGIN PASSWORD '${NDM_REPORTING_PASSWORD}';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ndm_backup') THEN
      CREATE ROLE ndm_backup LOGIN REPLICATION PASSWORD '${NDM_BACKUP_PASSWORD}';
    END IF;
  END
  \$\$;

  -- Schema ownership belongs to the migration role, not the bootstrap superuser.
  ALTER SCHEMA ${APP_SCHEMA} OWNER TO ndm_migration;
  GRANT USAGE ON SCHEMA ${APP_SCHEMA} TO ndm_migration, ndm_runtime, ndm_reporting;

  -- Guard objects live in a schema the application identities do not own, so the
  -- function below cannot be replaced or dropped by them (ADR-019 layer 2).
  CREATE SCHEMA IF NOT EXISTS ${GUARD_SCHEMA};
  GRANT USAGE ON SCHEMA ${GUARD_SCHEMA} TO ndm_runtime, ndm_reporting;

  CREATE OR REPLACE FUNCTION ${GUARD_SCHEMA}.deny(reason text)
  RETURNS boolean
  LANGUAGE plpgsql
  AS \$fn\$
  BEGIN
    RAISE EXCEPTION 'NDM append-only relation: % is not permitted for ordinary application roles', reason
      USING ERRCODE = 'insufficient_privilege', HINT = 'Master Spec line 3822; see docs/ARCHITECTURE_DECISIONS.md ADR-019';
  END
  \$fn\$;
  REVOKE ALL ON FUNCTION ${GUARD_SCHEMA}.deny(text) FROM PUBLIC;
  -- ndm_migration is included for the same reason deny_trigger() below is: the RLS deny policies
  -- are evaluated for the table owner too, and without EXECUTE the owner's UPDATE and DELETE are
  -- refused by an incidental "permission denied for function deny" instead of by the guard's own
  -- RAISE EXCEPTION. Measured 1 Nov 2026 as behavioural cases G and H. Both messages deny the
  -- statement, but only the designed one is evidence that ADR-019 layer 3 is the thing protecting
  -- the audit trail. The function can only raise, so the grant confers no capability.
  GRANT EXECUTE ON FUNCTION ${GUARD_SCHEMA}.deny(text) TO ndm_migration, ndm_runtime, ndm_reporting;

  -- ADR-019 layer 2 needs a function that RETURNS trigger, and deny(text) above cannot be it:
  -- an RLS policy's USING clause must be a boolean expression while a trigger's EXECUTE FUNCTION
  -- target must return 'trigger'. One function cannot serve both. The previous version tried, and
  -- additionally passed an expression to EXECUTE FUNCTION, which accepts string *literals* only --
  -- the concatenation 'public.audit_event via ' followed by || CURRENT_USER is a syntax error at
  -- the ||. Measured 1 Nov 2026 against postgres:18.6-alpine: harden-append-only.sh aborted on that
  -- statement, so the guard trigger and all four RLS policies were never created, and ndm_migration
  -- was then able to UPDATE and DELETE audit rows. The replacement takes no argument and reads its
  -- context from TG_OP / TG_TABLE_SCHEMA / TG_TABLE_NAME, which is legal and correct for every
  -- table it is attached to.
  -- NOTE FOR THE NEXT EDITOR: this heredoc delimiter is unquoted, so the shell expands dollar
  -- variables, dollar-paren command substitution and backticks inside it. Any of the three written
  -- literally into a SQL comment is executed, and because this script runs under 'set -u' an
  -- undefined name aborts the entire bootstrap. BusyBox ash reports it at the heredoc's own line.
  -- None of it is visible to a host-side syntax check, whose shell parses the same text without
  -- error -- measured twice on 1 Nov 2026, first as 'syntax error: unexpected word' from a pair of
  -- backticks and then as 'VAR: parameter not set' from a dollar sign in this very warning.
  -- Write prose in these comments; do not write shell syntax, even to describe it.
  CREATE OR REPLACE FUNCTION ${GUARD_SCHEMA}.deny_trigger()
  RETURNS trigger
  LANGUAGE plpgsql
  AS \$fn\$
  BEGIN
    RAISE EXCEPTION 'NDM append-only relation: % on %.% is not permitted for ordinary application roles',
      TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME
      USING ERRCODE = 'insufficient_privilege', HINT = 'Master Spec line 3822; see docs/ARCHITECTURE_DECISIONS.md ADR-019';
  END
  \$fn\$;
  REVOKE ALL ON FUNCTION ${GUARD_SCHEMA}.deny_trigger() FROM PUBLIC;
  -- Granted to every identity that can reach an append-only relation, ndm_migration included, so a
  -- denial is produced by the guard itself rather than by an incidental EXECUTE failure. The
  -- function can only raise an exception, so granting EXECUTE on it confers no capability, and it
  -- cannot be replaced by an application identity: this schema is owned by the bootstrap superuser.
  GRANT EXECUTE ON FUNCTION ${GUARD_SCHEMA}.deny_trigger() TO ndm_migration, ndm_runtime, ndm_reporting;

  -- Runtime: data manipulation only. Deliberately no CREATE, no DDL.
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ${APP_SCHEMA} TO ndm_runtime;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA ${APP_SCHEMA} TO ndm_runtime;
  ALTER DEFAULT PRIVILEGES FOR ROLE ndm_migration IN SCHEMA ${APP_SCHEMA}
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ndm_runtime;
  ALTER DEFAULT PRIVILEGES FOR ROLE ndm_migration IN SCHEMA ${APP_SCHEMA}
    GRANT USAGE, SELECT ON SEQUENCES TO ndm_runtime;

  -- Append-only carve-out (ADR-019 layer 1). Ordinary editing of audit history is
  -- forbidden by Master Spec line 1356 "Audit records are protected from ordinary
  -- editing" and line 2664 "must not be able to silently edit or erase audit
  -- history", so the write path keeps SELECT/INSERT and loses UPDATE/DELETE/TRUNCATE.
  -- The grant above was just widened for ALL TABLES; REVOKE is what makes the
  -- exception real. Runtime still needs USAGE, SELECT on the identity sequence to
  -- insert, which the grant above already gave.
  DO \$\$
  DECLARE t text;
  BEGIN
    FOR t IN SELECT unnest(string_to_array('${APPEND_ONLY}', ' ')) LOOP
      IF to_regclass('${APP_SCHEMA}.' || t) IS NOT NULL THEN
        EXECUTE format(
          'REVOKE UPDATE, DELETE, TRUNCATE ON TABLE %I.%I FROM ndm_runtime',
          '${APP_SCHEMA}', trim(t));
      END IF;
    END LOOP;
  END
  \$\$;

  -- Reporting: read-only, and only on tables that exist at grant time plus future ones.
  GRANT SELECT ON ALL TABLES IN SCHEMA ${APP_SCHEMA} TO ndm_reporting;
  ALTER DEFAULT PRIVILEGES FOR ROLE ndm_migration IN SCHEMA ${APP_SCHEMA}
    GRANT SELECT ON TABLES TO ndm_reporting;

  -- Backup: needs replication for continuous WAL archiving; no DML, no DDL.
  GRANT CONNECT ON DATABASE ${DB} TO ndm_backup;

  -- No application identity may hold BYPASSRLS: RLS and row-grants are the
  -- enforcement point, and Standard §4.2 warns a bypassing role silently defeats them.
  DO \$\$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname IN ('ndm_runtime','ndm_reporting') AND rolbypassrls) THEN
      RAISE EXCEPTION 'ndm_runtime / ndm_reporting must not hold BYPASSRLS';
    END IF;
  END
  \$\$;
EOSQL

echo "[noujoude] roles initialised: ndm_migration / ndm_runtime / ndm_reporting / ndm_backup"
echo "[noujoude] append-only relations: ${APPEND_ONLY}"
