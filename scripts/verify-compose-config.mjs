#!/usr/bin/env node
/**
 * scripts/verify-compose-config.mjs — static contract check for docker-compose.yml.
 *
 * Plain Node, no dependencies: `node scripts/verify-compose-config.mjs [path]`. The project has no
 * node_modules yet (installing it is Owner decision OD-2), so this checker cannot import a YAML
 * library. It therefore does NOT pretend to be a parser. Scope is deliberately split:
 *
 *   • THIS file answers "does the committed definition still state the invariants the ADRs chose?"
 *     Those are text-level facts — image tag, loopback binding, mount paths and modes, secret
 *     guards, absent escape hatches — and they can regress silently in a file nobody runs until the
 *     Owner creates `.env`. That is the gap this gate closes.
 *   • Structural validation ("is this well-formed, do the interpolations resolve?") belongs to
 *     `docker compose config` and is exercised by scripts/tests/verify-compose-config.test.mjs when
 *     a container engine answers. A machine without Docker runs the static rules and reports the
 *     dynamic half as SKIP, never as PASS.
 *
 * Each rule carries a code so a CI log names the invariant that broke instead of just failing.
 * Exit 0 = clean. Exit 1 = at least one defect. Reads only: no writes, no containers, no network.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

const TARGET = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.resolve(import.meta.dirname, "..", "docker-compose.yml");

// The seven variables `.env` must supply. `init-roles.sh` and `verify-privileges.sh` read the same
// names, and Standard §3.2 makes the roles distinct privileges, so a missing one must abort the
// start rather than bring up a database with an empty password.
const SECRET_VARS = [
  "POSTGRES_DB",
  "POSTGRES_SUPERUSER",
  "POSTGRES_SUPERUSER_PASSWORD",
  "NDM_MIGRATION_PASSWORD",
  "NDM_RUNTIME_PASSWORD",
  "NDM_REPORTING_PASSWORD",
  "NDM_BACKUP_PASSWORD",
];

// Escape hatches that would turn a local database container into a host-level privilege grant.
// ADR-004 keeps this file local-only; Standard §4.2 forbids the application layer reaching the host.
const FORBIDDEN = [
  ["privileged", /(^|[^-\w])privileged:\s*true/m],
  ["network_mode", /(^|[^-\w])network_mode:/m],
  ["cap_add", /(^|[^-\w])cap_add:/m],
  ["shared pid namespace", /(^|[^-\w])pid:\s*host/m],
  ["host devices", /(^|[^-\w])devices:/m],
  ["volumes_from", /(^|[^-\w])volumes_from:/m],
  ["the docker socket", /\/var\/run\/docker\.sock/m],
];

const defects = [];
const lines = [];

function add(code, message) {
  defects.push({ code, message });
}

function lineOf(re, from = 0) {
  const i = lines.findIndex((l, n) => n >= from && re.test(l));
  return i < 0 ? null : i + 1;
}

let text = "";
try {
  text = readFileSync(TARGET, "utf8");
} catch (e) {
  console.log(`[C0] cannot read ${TARGET}: ${e.message}`);
  process.exit(1);
}
lines.push(...text.split(/\r?\n/));

// A deliberately shallow reader: every short-syntax list item (`- value`) in the document, with its
// line number. Ports and mounts are then told apart by their shape, because a container path starts
// with `/` and a port mapping is all digits and dots. Long-syntax (`- source: ...`) items are not
// used in this file; if someone converts it, the rules below report the absence they observe rather
// than silently passing.
const items = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^\s*-\s*["']?([^"'\s]+)["']?\s*$/);
  if (m) items.push({ value: m[1], line: i + 1 });
}
const mounts = items
  .map((it) => ({ ...it, parts: it.value.split(":") }))
  .filter((it) => it.parts.length >= 2 && it.parts[1].startsWith("/"))
  .map((it) => ({
    source: it.parts[0],
    target: it.parts[1],
    mode: it.parts.length >= 3 ? it.parts.slice(2).join(":") : "",
    raw: it.value,
    line: it.line,
  }));
const ports = items.filter((it) =>
  /^(?:[\d.]+:)?\d{2,5}:\d{2,5}$/.test(it.value),
);

// ── C1 — the image tag is the ADR-004 baseline, not a floating one ─────────────────────────────────
{
  const m = text.match(/^\s*image:\s*(\S+)\s*$/m);
  if (!m) add("C1", "no image: declaration found");
  else if (m[1] !== "postgres:18.6-alpine")
    add(
      "C1",
      `image is ${m[1]}, ADR-004 pins postgres:18.6-alpine (line ${lineOf(/^\s*image:/)})`,
    );
}

// ── C2 — 5432 is published on loopback and nowhere else ────────────────────────────────────────────
{
  if (!ports.length)
    add(
      "C2",
      "no port mapping found; the stack is expected to be reachable on 127.0.0.1:5432 only",
    );
  const unbound = ports.filter((p) => !p.value.startsWith("127.0.0.1:"));
  if (ports.length && unbound.length)
    add(
      "C2",
      `published without a loopback host IP: ${unbound.map((p) => p.value).join(", ")} (line ${unbound[0].line})`,
    );
  if (ports.length && !ports.some((p) => p.value === "127.0.0.1:5432:5432"))
    add(
      "C2",
      `5432 is not published from 127.0.0.1 (mappings: ${ports.map((p) => p.value).join(", ")})`,
    );
}

// ── C3 — every secret is a *required* interpolation, so a missing .env aborts ──────────────────────
// The rule is per-occurrence, not per-variable. A file can guard `${POSTGRES_DB:?…}` on one line and
// still write `NDM_DATABASE: ${POSTGRES_DB}` on another: Compose then emits `The "POSTGRES_DB" variable
// is not set. Defaulting to a blank string` for the second one (measured 1 Nov 2026) and the container
// receives a blank value on any path where the guarded line stops being reached. The healthcheck block
// is exempt — its interpolations are only ever evaluated inside a container that already started, and
// every occurrence in `environment:` has already aborted the render by then.
{
  const envStart = lines.findIndex((l) => /^\s*environment:\s*$/.test(l));
  let envBlock = [];
  if (envStart >= 0) {
    const indent = lines[envStart].match(/^\s*/)[0].length;
    for (let j = envStart + 1; j < lines.length; j++) {
      const l = lines[j];
      if (l.trim() && l.match(/^\s*/)[0].length <= indent) break;
      // A `#` line is commentary, not a value. The first version of this rule flagged its own
      // explanatory comment, which quoted an unguarded reference to explain why it is wrong.
      if (/^\s*#/.test(l)) continue;
      envBlock.push({ text: l, line: j + 1 });
    }
  }
  if (!envBlock.length) add("C3", "no service environment block found");
  for (const v of SECRET_VARS) {
    const occurrences = envBlock.filter((x) =>
      new RegExp(`\\$\\{${v}(?![A-Z0-9_])`).test(x.text),
    );
    if (!occurrences.length) {
      add("C3", `${v} is never referenced in the service environment`);
      continue;
    }
    const unguarded = occurrences.filter(
      (x) => !new RegExp(`\\$\\{${v}:\\?`).test(x.text),
    );
    if (unguarded.length)
      add(
        "C3",
        `${v} is interpolated without a :? guard on line(s) ${unguarded.map((x) => x.line).join(", ")}; an unset .env value silently becomes an empty password`,
      );
  }
}

// ── C4 — the data volume must NOT end in /data on postgres:18 images ───────────────────────────────
{
  const data = mounts.filter((x) => x.target.startsWith("/var/lib/postgresql"));
  if (!data.length) add("C4", "no volume mounted at /var/lib/postgresql");
  else if (data.some((x) => x.target === "/var/lib/postgresql/data"))
    add(
      "C4",
      `data volume mounted at /var/lib/postgresql/data (line ${data.find((x) => x.target === "/var/lib/postgresql/data").line}) — postgres:18 images refuse to initialise on that path (ADR-004)`,
    );
  else if (!data.some((x) => x.target === "/var/lib/postgresql"))
    add(
      "C4",
      `postgres data is mounted at ${data.map((x) => x.target).join(", ")}, ADR-004 requires the mount root /var/lib/postgresql`,
    );
}

// ── C5 — anything mounted out of the host filesystem is read-only ──────────────────────────────────
{
  const binds = mounts.filter(
    (x) => x.source.startsWith("./") || x.source.startsWith("/"),
  );
  if (!binds.length)
    add(
      "C5",
      "no host bind mounts found; scripts/db is expected to be mounted into the container",
    );
  const rw = binds.filter((x) => x.mode !== "ro");
  if (rw.length)
    add(
      "C5",
      `bind mount not read-only: ${rw.map((x) => x.raw).join(" , ")} (line ${rw[0].line})`,
    );
}

// ── C6 — a healthcheck that can actually gate readiness ────────────────────────────────────────────
{
  if (!/^\s*healthcheck:/m.test(text))
    add(
      "C6",
      "no healthcheck block; pnpm db:up would report success before postgres accepts connections",
    );
  else if (!/pg_isready/.test(text))
    add("C6", "healthcheck does not use pg_isready");
}

// ── C7 — no host-escape affordances ────────────────────────────────────────────────────────────────
for (const [label, re] of FORBIDDEN) {
  if (re.test(text))
    add(
      "C7",
      `${label} is present — a local-only database container must not gain host privileges (line ${lineOf(re)})`,
    );
}

// ── C8 — the service declares a restart policy ─────────────────────────────────────────────────────
if (!/(^|[^-\w])restart:\s*(unless-stopped|on-failure|always)\b/m.test(text))
  add("C8", "no restart policy on the database service");

// ── C9 — the container name is explicit and inside this project's own namespace ────────────────────
// Three stopped containers already own noujoude-postgres, -postgres2 and -postgres3 on the project
// host (measured 1 Nov 2026 with `docker ps -a`). An explicit name that is already taken makes
// `pnpm db:up` fail with a conflict even after `.env` exists, and those containers are not this
// project's to start, reuse or remove. Leaving the field out is not a fix either: Compose would
// generate noujoude-postgres-1, which the project's own safety rule — never touch
// noujoude-postgres* in scripts/db/run-privilege-tests.sh — would then cover, making our own
// container uncleanable by our own scripts. ndm- is the prefix every role, script and throwaway
// container in this repository already uses. Nothing else addresses this container by name: the
// npm scripts and CI all go through `docker compose exec -T postgres`, which is the service name.
{
  const m = text.match(/(^|[^-\w])container_name:\s*(\S+)/m);
  if (!m)
    add(
      "C9",
      "container_name is unset; Compose would generate a name inside the noujoude-postgres* protection glob",
    );
  else if (!/^ndm-[a-z0-9][a-z0-9-]*$/.test(m[2]))
    add(
      "C9",
      `container_name ${m[2]} is outside the ndm- namespace this project uses for its roles and scripts (line ${lineOf(/container_name:/)})`,
    );
}

// ── C10 — no secret may carry a default value ──────────────────────────────────────────────────────
for (const v of SECRET_VARS) {
  const re = new RegExp(`\\$\\{${v}:-[^}]*\\}`);
  if (re.test(text))
    add(
      "C10",
      `${v} has an inline default (line ${lineOf(re)}); a committed default password would start the stack instead of aborting`,
    );
}

const rel = path.relative(process.cwd(), TARGET) || TARGET;
if (defects.length) {
  for (const d of defects) console.log(`[${d.code}] ${rel}: ${d.message}`);
  console.log(
    `COMPOSE CONFIG GATE FAILED: ${defects.length} defect(s) in ${rel}`,
  );
  process.exit(1);
}
console.log(
  `OK: ${rel} states the pinned image, the loopback-only publish, the postgres:18 mount root, the read-only script mounts, the seven required secret guards, a pg_isready healthcheck, no host-escape affordance and an ndm- container name (10 rules)`,
);
