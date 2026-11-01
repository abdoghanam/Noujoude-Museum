#!/usr/bin/env node
/**
 * scripts/tests/verify-compose-config.test.mjs — regression suite for the compose static gate,
 * plus the two dynamic checks that only a machine with a container engine can perform.
 *
 * Plain Node, no runner: `node scripts/tests/verify-compose-config.test.mjs`.
 *
 * WHY THIS SUITE EXISTS. On 1 November 2026 the compose file was read for the first time as anything
 * other than text: `docker compose config` rendered it, and the render exposed that
 * `container_name: noujoude-postgres` collided with a stopped container that was already using that
 * name on this host — a defect that would have made `pnpm db:up` fail for the Owner even after they
 * created `.env`, and that no static review, table gate or citation gate could have seen. That is
 * the class of bug this file keeps from coming back: one case per invariant, each with the red
 * fixture that proves the rule is not decorative.
 *
 * The dynamic half never creates or touches a container, volume or network: `docker compose config`
 * renders and exits. Placeholder values live in the child process environment only — nothing is
 * written to `.env`, to a file, or to any transcript.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const CHECKER = path.join(ROOT, 'scripts', 'verify-compose-config.mjs');

let pass = 0;
let fail = 0;
let skipped = 0;

function logPass(label, extra = '') {
  pass++;
  console.log(`PASS  ${label}${extra ? `   ${extra}` : ''}`);
}
function logFail(label, detail) {
  fail++;
  console.log(`FAIL  ${label}`);
  for (const l of String(detail).split('\n')) console.log(`      | ${l}`);
}

/** Run the checker over a fixture written into a fresh temp directory. */
function runChecker(yaml) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ndm-compose-'));
  try {
    const file = path.join(dir, 'docker-compose.yml');
    writeFileSync(file, yaml, 'utf8');
    const r = spawnSync(process.execPath, [CHECKER, file], { encoding: 'utf8', cwd: ROOT, timeout: 30_000 });
    return { rc: r.status, out: (r.stdout || '') + (r.stderr || '') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function expect(label, yaml, wantRc, wantMatch) {
  const { rc, out } = runChecker(yaml);
  const rcOk = rc === wantRc;
  const msgOk = wantMatch ? wantMatch.test(out) : true;
  if (rcOk && msgOk) logPass(label, `(exit ${rc})`);
  else {
    logFail(label, `wanted exit ${wantRc}${wantMatch ? ` and /${wantMatch}/` : ''}, got exit ${rc}\n${out}`);
  }
}

// ── the baseline fixture: every rule satisfied, so each negative case is exactly one mutation ─────
const GOOD = `name: noujoude
services:
  postgres:
    image: postgres:18.6-alpine
    container_name: ndm-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB:?set POSTGRES_DB in .env}
      POSTGRES_USER: \${POSTGRES_SUPERUSER:?set POSTGRES_SUPERUSER in .env}
      POSTGRES_PASSWORD: \${POSTGRES_SUPERUSER_PASSWORD:?set in .env}
      NDM_MIGRATION_PASSWORD: \${NDM_MIGRATION_PASSWORD:?set in .env}
      NDM_RUNTIME_PASSWORD: \${NDM_RUNTIME_PASSWORD:?set in .env}
      NDM_REPORTING_PASSWORD: \${NDM_REPORTING_PASSWORD:?set in .env}
      NDM_BACKUP_PASSWORD: \${NDM_BACKUP_PASSWORD:?set in .env}
      NDM_DATABASE: \${POSTGRES_DB:?set POSTGRES_DB in .env}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - noujoude-pgdata:/var/lib/postgresql
      - ./scripts/db/init-roles.sh:/docker-entrypoint-initdb.d/10-init-roles.sh:ro
      - ./scripts/db:/opt/ndm-db:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_SUPERUSER} -d \${POSTGRES_DB}"]
      interval: 5s
volumes:
  noujoude-pgdata:
    driver: local
`;

/** One mutation, applied by replacing a literal that is known to exist in GOOD. */
function mutate(from, to) {
  if (!from.test(GOOD)) throw new Error(`mutation anchor missing: ${from}`);
  return GOOD.replace(from, to);
}

// ── POSITIVE ──────────────────────────────────────────────────────────────────────────────────────
expect('a definition that states every invariant passes', GOOD, 0, /^OK: /);

// ── NEGATIVE: one case per rule code ──────────────────────────────────────────────────────────────
expect('[C1] a floating image tag is a defect',
  mutate(/image: postgres:18\.6-alpine/, 'image: postgres:latest'), 1, /\[C1\].*postgres:latest/);

expect('[C2] publishing on every interface is a defect',
  mutate(/"127\.0\.0\.1:5432:5432"/, '"0.0.0.0:5432:5432"'), 1, /\[C2\].*0\.0\.0\.0:5432:5432/);

expect('[C2] a bare port mapping with no host IP is a defect',
  mutate(/"127\.0\.0\.1:5432:5432"/, '"5432:5432"'), 1, /\[C2\].*5432:5432/);

expect('[C2] removing the published port is a defect',
  GOOD.replace(/    ports:\n      - "127\.0\.0\.1:5432:5432"\n/, ''), 1, /\[C2\].*no port mapping/);

expect('[C3] an unguarded secret becomes an empty password',
  mutate(/\$\{NDM_RUNTIME_PASSWORD:\?set in \.env\}/, '${NDM_RUNTIME_PASSWORD}'), 1, /\[C3\].*NDM_RUNTIME_PASSWORD.*without a \:\? guard/);

expect('[C3] a secret that is never wired in is a defect',
  GOOD.replace(/      NDM_BACKUP_PASSWORD: \$\{NDM_BACKUP_PASSWORD:\?set in \.env\}\n/, ''), 1, /\[C3\].*NDM_BACKUP_PASSWORD is never referenced/);

// The shape the real file actually had until 1 Nov 2026: the secret is guarded once and read a second
// time without a guard. A per-variable rule passes it; Compose then warns `Defaulting to a blank
// string` and the container is handed an empty value. This case is why C3 counts occurrences.
expect('[C3] a second, unguarded read of a guarded secret is still a defect',
  mutate(/\n      NDM_DATABASE: \$\{POSTGRES_DB:\?set POSTGRES_DB in \.env\}/, '\n      NDM_DATABASE: ${POSTGRES_DB}'),
  1, /\[C3\].*POSTGRES_DB is interpolated without a \:\? guard/);

// A `#` line inside the environment block is commentary, not a value. Without this case the exemption
// would be invisible, and the real file needs it: its own comment quotes an unguarded reference to
// explain why that shape is wrong — the first run of the strengthened rule flagged that comment.
expect('[C3] an explanatory comment is not an interpolation',
  GOOD.replace(/    ports:\n/, '      # an unguarded ${POSTGRES_DB} here would default to a blank string\n    ports:\n'),
  0, /^OK: /);

// The exemption itself needs no separate case: GOOD's healthcheck already reads
// `pg_isready -U ${POSTGRES_SUPERUSER} -d ${POSTGRES_DB}` without guards, and the passing case at the
// top of this file proves those bare occurrences are not counted as defects.

expect('[C4] the postgres:18 /data mount path is a defect',
  mutate(/      - noujoude-pgdata:\/var\/lib\/postgresql\n/, '      - noujoude-pgdata:/var/lib/postgresql/data\n'), 1, /\[C4\].*\/var\/lib\/postgresql\/data/);

expect('[C4] no data volume at all is a defect',
  GOOD.replace(/      - noujoude-pgdata:\/var\/lib\/postgresql\n/, ''), 1, /\[C4\].*no volume mounted/i);

expect('[C5] a writable bind mount of scripts into the container is a defect',
  mutate(/\.\/scripts\/db:\/opt\/ndm-db:ro/, './scripts/db:/opt/ndm-db'), 1, /\[C5\].*not read-only.*\.\/scripts\/db:\/opt\/ndm-db/);

expect('[C6] dropping the healthcheck is a defect',
  GOOD.replace(/    healthcheck:\n(?:      .*\n)*/, ''), 1, /\[C6\].*no healthcheck/);

expect('[C6] a healthcheck that never probes readiness is a defect',
  mutate(/pg_isready -U \$\{POSTGRES_SUPERUSER\} -d \$\{POSTGRES_DB\}/, 'true'), 1, /\[C6\].*pg_isready/);

expect('[C7] privileged is forbidden',
  GOOD.replace(/    restart: unless-stopped\n/, '    restart: unless-stopped\n    privileged: true\n'), 1, /\[C7\].*privileged/);

expect('[C7] the docker socket must never be mounted',
  GOOD.replace(/      - \.\/scripts\/db:\/opt\/ndm-db:ro\n/, '      - /var/run/docker.sock:/var/run/docker.sock:ro\n'), 1, /\[C7\].*docker socket/);

expect('[C8] no restart policy is a defect',
  GOOD.replace(/    restart: unless-stopped\n/, ''), 1, /\[C8\]/);

expect('[C9] the occupied noujoude-postgres name is rejected',
  mutate(/container_name: ndm-postgres/, 'container_name: noujoude-postgres'), 1, /\[C9\].*noujoude-postgres/);

expect('[C9] an absent container name would collide with the protection glob',
  GOOD.replace(/    container_name: ndm-postgres\n/, ''), 1, /\[C9\].*container_name is unset/);

expect('[C10] an inline default password is a defect',
  mutate(/\$\{NDM_RUNTIME_PASSWORD:\?set in \.env\}/, '${NDM_RUNTIME_PASSWORD:-devpassword}'), 1, /\[C10\].*NDM_RUNTIME_PASSWORD/);

// A definition can break several rules at once; the gate must name each one, not stop at the first.
expect('several simultaneous defects are all reported',
  GOOD.replace(/image: postgres:18\.6-alpine/, 'image: postgres:16-alpine')
      .replace(/"127\.0\.0\.1:5432:5432"/, '"5432:5432"')
      .replace(/    container_name: ndm-postgres\n/, ''),
  1, /\[C1\][\s\S]*\[C2\][\s\S]*\[C9\]/);

// ── the committed file must satisfy the same rules the fixtures teach ─────────────────────────────
{
  const r = spawnSync(process.execPath, [CHECKER], { encoding: 'utf8', cwd: ROOT, timeout: 30_000 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) logPass('the real docker-compose.yml passes all 10 rules', `(exit 0)`);
  else logFail('the real docker-compose.yml violates its own contract', `exit ${r.status}\n${out}`);
}

// ── DYNAMIC: only where a container engine answers ────────────────────────────────────────────────
const SECRETS = [
  'POSTGRES_DB', 'POSTGRES_SUPERUSER', 'POSTGRES_SUPERUSER_PASSWORD',
  'NDM_MIGRATION_PASSWORD', 'NDM_RUNTIME_PASSWORD', 'NDM_REPORTING_PASSWORD', 'NDM_BACKUP_PASSWORD',
];

function composeEnv(withValues) {
  const env = { ...process.env };
  for (const k of SECRETS) delete env[k];
  if (withValues) for (const k of SECRETS) env[k] = 'ndm_config_check_only';
  return env;
}

const probe = spawnSync('docker', ['compose', 'version'], { encoding: 'utf8', cwd: ROOT, timeout: 30_000 });
const dockerReady = probe.status === 0;

if (!dockerReady) {
  skipped += 3;
  console.log('SKIP  docker compose config (positive) — no container engine on this machine');
  console.log('SKIP  docker compose config (secret guard negative) — no container engine');
  console.log('SKIP  container name is free on this host — no container engine');
} else {
  const good = spawnSync('docker', ['compose', 'config'], { encoding: 'utf8', cwd: ROOT, timeout: 60_000, env: composeEnv(true) });
  const gout = (good.stdout || '') + (good.stderr || '');
  const committed = readFileSync(path.join(ROOT, 'docker-compose.yml'), 'utf8');
  const nameLine = (committed.match(/container_name:\s*(\S+)/) || [])[1];
  if (good.status === 0 && /host_ip:\s*127\.0\.0\.1/.test(gout) && /image:\s*postgres:18\.6-alpine/.test(gout)
      && new RegExp(`container_name:\\s*${nameLine}`).test(gout)) {
    logPass('docker compose config renders the real file with the declared invariants', `(exit 0, name ${nameLine})`);
  } else {
    logFail('docker compose config did not render the expected definition', `exit ${good.status}\n${gout}`);
  }

  const bad = spawnSync('docker', ['compose', 'config'], { encoding: 'utf8', cwd: ROOT, timeout: 60_000, env: composeEnv(false) });
  const bout = (bad.stdout || '') + (bad.stderr || '');
  if (bad.status !== 0 && /required variable .* is missing a value/.test(bout)) {
    logPass('the :? guards bite when the secrets are unset', `(exit ${bad.status})`);
  } else {
    logFail('an unset secret did not abort the render', `exit ${bad.status}\n${bout}`);
  }

  const listed = spawnSync('docker', ['ps', '-a', '--format', '{{.Names}}'], { encoding: 'utf8', cwd: ROOT, timeout: 60_000 });
  const names = (listed.stdout || '').split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
  if (listed.status !== 0) logFail('could not list containers to test the name collision', `exit ${listed.status}\n${listed.stderr || ''}`);
  else if (nameLine && !names.includes(nameLine)) logPass(`the declared container name ${nameLine} is free on this host`, `(${names.length} existing containers, none named ${nameLine})`);
  else logFail(`the declared container name ${nameLine} is already taken on this host`, `existing: ${names.join(', ')}`);
}

console.log(`\n${pass} passed, ${fail} failed, ${skipped} skipped (dynamic cases need a container engine)`);
process.exit(fail ? 1 : 0);
