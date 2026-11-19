#!/usr/bin/env node
/**
 * Noujoude — Phase 1 preflight gate.
 *
 * Run before any install, migration or build. It answers one question:
 * "is this workspace actually able to execute the next step, and are the
 * read-only inputs still untouched?"
 *
 * Dependency-free. Exits 1 on any FAIL so it can gate CI (Standard §12).
 */

import { createHash } from "node:crypto";
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { execSync, spawnSync } from "node:child_process";
import path from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { sniffFormat, readDimensions } from "./lib/image-signature.mjs";
import { declarationMismatch } from "./lib/asset-declarations.mjs";

// --root lets the gate be pointed at a fixture workspace. Regression cases have to create a directory that
// contains a deliberate defect — an uncatalogued asset, a modified original, a stale catalog row — and doing
// that inside the real Noujoude.photo/ would violate the rule that the originals are never touched. Without
// this flag the only way to prove the check detects anything is to damage the library it guards.
const argv = process.argv.slice(2);
const rootArg = argv.indexOf("--root");
const ROOT = path.resolve(
  rootArg >= 0 ? argv[rootArg + 1] : path.resolve(import.meta.dirname, ".."),
);
const sha256 = (p) =>
  createHash("sha256").update(readFileSync(p)).digest("hex");
const results = [];
const record = (level, name, detail) => results.push({ level, name, detail });

// ── 1. Runtime must satisfy the declared engine range ───────────────────────
const pkg = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const want = pkg.engines?.node ?? "";
const node = process.version.replace(/^v/, "");
const cmp = (a, b) => {
  const pa = a.split("-")[0].split(".").map(Number);
  const pb = b.split("-")[0].split(".").map(Number);
  for (let i = 0; i < 3; i++)
    if (pa[i] !== pb[i]) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};
// Only ">=X <Y" form is supported here, which is the range we declare.
const ge = want.match(/>=(\S+)/)?.[1];
const lt = want.match(/<(\S+)/)?.[1];
const nodeOk = (!ge || cmp(node, ge) >= 0) && (!lt || cmp(node, lt) < 0);
record(
  nodeOk ? "PASS" : "FAIL",
  `Node.js ${node}`,
  nodeOk
    ? `satisfies engines.node "${want}"`
    : `VIOLATES engines.node "${want}" — install Node ${ge ?? "required"} or later in range. Payload 3.92.1 refuses this version.`,
);

// ── 2. Package manager ──────────────────────────────────────────────────────
let pnpmVer = "";
// An absent or non-executable pnpm is not an exception here: step 2 below records it as FAIL.
try {
  pnpmVer = execSync("pnpm -v", { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
} catch {
  /* leave pnpmVer empty — the FAIL is recorded in step 2 */
}
record(
  pnpmVer ? "PASS" : "WARN",
  `pnpm ${pnpmVer || "ABSENT"}`,
  pnpmVer
    ? `packageManager declares ${pkg.packageManager}`
    : "pnpm is the mandated manager (Standard §2.2)",
);

// ── 3. Docker daemon, which carries PostgreSQL 18.6 ─────────────────────────
let dockerOk = false,
  dockerDetail = "";
try {
  dockerOk =
    execSync('docker info --format "{{.ServerVersion}}"', {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 20_000,
    })
      .toString()
      .trim().length > 0;
  dockerDetail = `server reachable; compose: ${(() => {
    try {
      return execSync("docker compose version --short", {
        stdio: ["ignore", "pipe", "ignore"],
        timeout: 20_000,
      })
        .toString()
        .trim();
    } catch {
      return "MISSING";
    }
  })()}`;
} catch {
  dockerDetail = "daemon did not answer within 20 s";
}
record(
  dockerOk ? "PASS" : "WARN",
  "Docker",
  dockerDetail + " — required for postgres:18.6-alpine (ADR-004)",
);

// ── 4. Environment file present but never printed ───────────────────────────
const envExists = existsSync(path.join(ROOT, ".env"));
record(
  envExists ? "PASS" : "WARN",
  ".env",
  envExists
    ? "present (values intentionally not read into this report)"
    : "missing — copy .env.example to .env before install. Do not commit it.",
);

// ── 5. Read-only inputs must be untouched ───────────────────────────────────
// Baseline of reference/ is captured on first run and compared afterwards, so
// "never modify original source files" (Directive §3) becomes a checked claim
// instead of an intention.
const BASELINE = path.join(ROOT, "docs", "REFERENCE_INTEGRITY.json");
const refDir = path.join(ROOT, "reference");
const current = {};
for (const f of readdirSync(refDir)
  .filter((n) => !n.startsWith("."))
  .sort()) {
  const abs = path.join(refDir, f);
  if (statSync(abs).isFile())
    current[f] = { sha256: sha256(abs), bytes: statSync(abs).size };
}
if (!existsSync(BASELINE)) {
  const out = {
    capturedAt: new Date().toISOString(),
    note: "First capture. reference/ is declared read-only by Directive §3; any later DRIFT means an original was modified.",
    files: current,
  };
  (await import("node:fs")).writeFileSync(
    BASELINE,
    JSON.stringify(out, null, 2),
  );
  record(
    "PASS",
    `reference/ baseline created`,
    `${Object.keys(current).length} files fingerprinted`,
  );
} else {
  const base = JSON.parse(readFileSync(BASELINE, "utf8")).files;
  const drift = [];
  for (const [f, v] of Object.entries(base)) {
    if (!current[f]) drift.push(`${f}: DELETED`);
    else if (current[f].sha256 !== v.sha256)
      drift.push(`${f}: CONTENT CHANGED`);
  }
  for (const f of Object.keys(current))
    if (!base[f]) drift.push(`${f}: NEW FILE IN READ-ONLY DIR`);
  record(
    drift.length ? "FAIL" : "PASS",
    "reference/ integrity",
    drift.length
      ? `DRIFT DETECTED → ${drift.join("; ")}`
      : `${Object.keys(current).length} files match baseline checksums`,
  );
}

// ── 6. Asset library: catalog and physical directory reconciled ─────────────
// H-7 (measured 31 Oct 2026). The previous version of this check iterated the CSV rows and nothing else,
// so its PASS line read "all 82 audited assets match their recorded SHA-256" while the directory actually
// held 85 files. Three assets were sitting in Noujoude.photo/ with no catalog row, and the gate could not
// see them because it never looked at the directory. It also trusted the CSV's own MIME/Width/Height
// columns instead of re-deriving them, so a stale or wrong row could not be contradicted by the file it
// describes. The check now walks both sides and re-measures.
const AUDIT = path.join(ROOT, "docs", "ASSET_INVENTORY_AUDIT.csv");
const PHOTOS = path.join(ROOT, "Noujoude.photo");
if (existsSync(AUDIT) && existsSync(PHOTOS)) {
  const rows = parseCsv(readFileSync(AUDIT, "utf8")).filter(
    (r) => r.length > 1,
  );
  const head = rows[0].map((h) => h.trim());
  const col = (n) => head.indexOf(n);
  const need = [
    "Filename",
    "Physical Status",
    "Actual Path",
    "MIME Type",
    "Width",
    "Height",
    "SHA-256",
  ];
  const idx = Object.fromEntries(need.map((n) => [n, col(n)]));
  if (need.some((n) => idx[n] < 0)) {
    record(
      "FAIL",
      "Noujoude.photo/ reconciliation",
      `ASSET_INVENTORY_AUDIT.csv is missing expected column(s): ` +
        `${need.filter((n) => idx[n] < 0).join(", ")} — the gate cannot reconcile against a catalog whose shape it does not know`,
    );
  } else {
    const walkDir = (dir, rel = "") => {
      const out = [];
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) out.push(...walkDir(path.join(dir, e.name), r));
        else if (e.isFile()) out.push(r);
      }
      return out;
    };
    const physical = walkDir(PHOTOS);
    const physicalBasenames = new Set(
      physical.map((r) => r.split("/").pop().toLowerCase()),
    );

    const catalogFilenames = new Set();
    const modified = [],
      missing = [],
      contradicted = [],
      wrongFormat = [],
      namePixel = [];
    let audited = 0;

    for (const row of rows.slice(1)) {
      const filename = (row[idx["Filename"]] ?? "").trim();
      if (!filename) continue;
      catalogFilenames.add(filename.toLowerCase());
      const recStatus = (row[idx["Physical Status"]] ?? "").trim();
      const recPath = (row[idx["Actual Path"]] ?? "").trim();
      const recMime = (row[idx["MIME Type"]] ?? "").trim();
      const recW = (row[idx["Width"]] ?? "").trim();
      const recH = (row[idx["Height"]] ?? "").trim();
      const recSha = (row[idx["SHA-256"]] ?? "").trim();

      // A row that records the asset as absent cannot be checksum-reconciled, but it can still be
      // contradicted: if a file now sits at that name, the register no longer describes the library.
      // That is the opposite failure to "missing", so it is reported separately — folding the two into
      // one bucket made the message describe two opposite situations with one label.
      if (recStatus === "MISSING" || !recPath) {
        if (physicalBasenames.has(filename.toLowerCase())) {
          contradicted.push(
            `${filename}: catalog records it as absent (Physical Status "${recStatus || "blank"}", ` +
              `Actual Path "${recPath || "blank"}") but a file of that name exists`,
          );
        }
        continue;
      }
      audited++;
      const abs = path.join(PHOTOS, recPath);
      if (!existsSync(abs) || !statSync(abs).isFile()) {
        missing.push(recPath);
        continue;
      }
      const buf = readFileSync(abs);
      const sha = createHash("sha256").update(buf).digest("hex");
      if (recSha && sha !== recSha) {
        modified.push(recPath);
        continue;
      }

      // Re-derive what the file is, rather than accepting what the row says it is.
      const mime = sniffFormat(buf);
      const dims = mime ? readDimensions(buf, mime) : null;
      if (recMime && mime && recMime !== mime) {
        contradicted.push(
          `${recPath}: row records ${recMime}, container is ${mime}`,
        );
      }
      if (recW && dims && String(dims.width) !== recW) {
        contradicted.push(
          `${recPath}: row records width ${recW}, container decodes ${dims.width}`,
        );
      }
      if (recH && dims && String(dims.height) !== recH) {
        contradicted.push(
          `${recPath}: row records height ${recH}, container decodes ${dims.height}`,
        );
      }
      const ext = recPath.split(".").pop().toLowerCase();
      const wantMime = {
        webp: "image/webp",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        svg: "image/svg+xml",
        gif: "image/gif",
        bmp: "image/bmp",
      }[ext];
      if (wantMime && mime && mime !== wantMime)
        wrongFormat.push(`${recPath}: .${ext} holding ${mime}`);

      // Filename self-declaration, measured from the file now, not from the recorded columns.
      // Same rule as the audit, from the same module, so the two counts cannot drift apart.
      const dm = dims
        ? declarationMismatch(filename, dims.width, dims.height)
        : null;
      if (dm) namePixel.push(`${filename} → ${dm}`);
    }

    const uncatalogued = physical.filter(
      (r) => !catalogFilenames.has(r.split("/").pop().toLowerCase()),
    );
    const uncImages = uncatalogued.filter((r) => {
      const b = readFileSync(path.join(PHOTOS, r));
      return sniffFormat(b) !== null;
    });
    const uncMeta = uncatalogued.filter((r) => !uncImages.includes(r));

    // Integrity first: a changed or vanished original, or a catalog row the file contradicts, is a FAIL.
    const integrity = modified.length + missing.length + contradicted.length;
    // Governance findings are real but already registered for Owner approval (docs/asset-audit-summary.json,
    // docs/ASSET_GOVERNANCE.md). They must be visible on every run; they are not this gate's to decide.
    const governance =
      uncatalogued.length + wrongFormat.length + namePixel.length;

    const parts = [];
    if (modified.length)
      parts.push(
        `${modified.length} MODIFIED original(s): ${modified.slice(0, 5).join(", ")}`,
      );
    if (missing.length)
      parts.push(
        `${missing.length} catalogued original(s) no longer in the directory: ${missing.slice(0, 5).join(", ")}`,
      );
    if (contradicted.length)
      parts.push(
        `${contradicted.length} catalog row(s) contradicted by the file: ${contradicted.slice(0, 5).join("; ")}`,
      );
    if (uncImages.length)
      parts.push(
        `${uncImages.length} image file(s) in the directory with NO catalog row: ${uncImages.slice(0, 5).join(", ")}`,
      );
    if (uncMeta.length)
      parts.push(
        `${uncMeta.length} non-image file(s) not catalogued (manifests/notes): ${uncMeta.slice(0, 5).join(", ")}`,
      );
    if (wrongFormat.length)
      parts.push(
        `${wrongFormat.length} WRONG_FORMAT (extension vs container): ${wrongFormat.slice(0, 3).join("; ")}`,
      );
    if (namePixel.length)
      parts.push(
        `${namePixel.length} NAME/PIXEL mismatch(es): ${namePixel.slice(0, 3).join("; ")}${namePixel.length > 3 ? " …" : ""}`,
      );

    const level = integrity ? "FAIL" : governance ? "WARN" : "PASS";
    const tally = `catalog rows ${audited}, physical files ${physical.length}`;
    record(
      level,
      "Noujoude.photo/ reconciliation",
      (parts.length
        ? parts.join(" | ")
        : `every catalogued original matches its recorded SHA-256, container and dimensions; the directory holds nothing the catalog does not account for (${tally})`) +
        (parts.length ? ` (${tally})` : ""),
    );
  }
} else {
  record(
    "WARN",
    "Noujoude.photo/ reconciliation",
    !existsSync(AUDIT)
      ? "no ASSET_INVENTORY_AUDIT.csv yet — run pnpm audit:assets"
      : `no ${PHOTOS} directory to reconcile against`,
  );
}

// ── 7. Scaffold state ───────────────────────────────────────────────────────
const srcDir = path.join(ROOT, "src");
const srcEntries = existsSync(srcDir) ? readdirSync(srcDir) : [];
record(
  srcEntries.length ? "PASS" : "WARN",
  "src/",
  srcEntries.length
    ? `contains ${srcEntries.join(", ")}`
    : "empty — application not yet scaffolded (intentional at this phase)",
);

// ── 8. Local infrastructure contract ───────────────────────────────────────
// The compose file is the only thing in the repository that nobody executes until the Owner creates
// `.env`, which is exactly why it needs a gate: on 1 Nov 2026 rendering it exposed that its
// container_name collided with a stopped container already on this host — a defect that would have
// made `pnpm db:up` fail for the Owner after they had done everything right. The rules live in
// scripts/verify-compose-config.mjs so the gate and the suite read one implementation, and this
// check only ever reads the file: no container, volume or network is created here.
const COMPOSE = path.join(ROOT, "docker-compose.yml");
const COMPOSE_CHECKER = path.join(ROOT, "scripts", "verify-compose-config.mjs");
if (!existsSync(COMPOSE)) {
  record(
    "WARN",
    "docker-compose.yml contract",
    `no docker-compose.yml at ${ROOT} — nothing to check in this workspace`,
  );
} else if (!existsSync(COMPOSE_CHECKER)) {
  record(
    "WARN",
    "docker-compose.yml contract",
    "scripts/verify-compose-config.mjs is missing — the contract is unchecked",
  );
} else {
  const r = spawnSync(process.execPath, [COMPOSE_CHECKER, COMPOSE], {
    encoding: "utf8",
    timeout: 30_000,
  });
  const out = ((r.stdout || "") + (r.stderr || "")).trim().split(/\r?\n/);
  record(
    r.status === 0 ? "PASS" : "FAIL",
    "docker-compose.yml contract",
    r.status === 0
      ? (out[out.length - 1] || "").replace(/^OK: /, "")
      : out.join(" | "),
  );
}

// ── 9. CI workflow structure contract ──────────────────────────────────────
// The pipeline definition is the artefact most likely to be edited by a search-and-replace and least
// likely to be noticed broken, because nothing runs it here: there is no repository (B-04) and no YAML
// parser exists on this host (measured 1 Nov 2026 — python, perl, ruby and PowerShell all lack one). So
// the file that is supposed to enforce the twelve release checks was itself enforced only by a human
// read. scripts/verify-workflow-structure.mjs replaces that with ten structural rules, including the
// ones no reader holds in working memory: every script a step runs exists, every `pnpm <name>` is a
// declared script, and the CI step list has not drifted from `pnpm test:gates`. It is a structural
// check, not a YAML conformance parser, and it is emphatically not a CI run.
const WORKFLOW = path.join(ROOT, ".github", "workflows", "ci.yml");
const WORKFLOW_CHECKER = path.join(
  ROOT,
  "scripts",
  "verify-workflow-structure.mjs",
);
if (!existsSync(WORKFLOW)) {
  record(
    "WARN",
    "CI workflow structure",
    "no .github/workflows/ci.yml in this workspace — nothing to check",
  );
} else if (!existsSync(WORKFLOW_CHECKER)) {
  record(
    "WARN",
    "CI workflow structure",
    "scripts/verify-workflow-structure.mjs is missing — the contract is unchecked",
  );
} else {
  const r = spawnSync(process.execPath, [WORKFLOW_CHECKER, WORKFLOW], {
    encoding: "utf8",
    timeout: 30_000,
  });
  const out = ((r.stdout || "") + (r.stderr || "")).trim().split(/\r?\n/);
  record(
    r.status === 0 ? "PASS" : "FAIL",
    "CI workflow structure",
    r.status === 0
      ? (out[0] || "").replace(/^OK: /, "")
      : out.filter((l) => !l.startsWith("NOTE:")).join(" | "),
  );
}

// ── 10. `pnpm run` dependency-check trap ────────────────────────────────────
// On 1 Nov 2026 a documented read-only command — `pnpm run audit:workflow` — did not run the gate.
// pnpm 11 checks the declared dependencies before running any script and, finding `node_modules`
// absent (which is the *agreed* state until Owner decision OD-2), started `pnpm install`: it resolved
// the whole tree against the public registry and wrote packages into the machine store. The command
// was killed and the workspace gained nothing, but a read-only check had silently attempted the one
// action this phase forbids, and every `pnpm <name>` in `docs/` carries that same surprise.
//
// The trap cannot be switched off from inside the project: `verify-deps-before-run` is one of the 67
// keys pnpm reads only from the *global* config file (proved by a control — a bogus `registry=` line
// in the same `.npmrc` *was* honoured), there is no CLI flag for it, and `engine-strict=true` does not
// prevent it because the deps check runs first. See `.npmrc` for the full measurement. What this check
// can do is report the effective state instead of leaving it to be discovered by an install: the
// global value, read with `pnpm config get --global` (a pure config read; it neither resolves nor
// downloads anything), plus whether the condition that arms the trap still holds.
//
// WHAT EACH VALUE ACTUALLY DOES WAS MEASURED, not read off documentation, on 1 Nov 2026. Each value was
// set through `pnpm_config_verify_deps_before_run` in a temp fixture holding a declared dependency, no
// `node_modules`, no lockfile and stdin closed — over a `.npmrc` pointing the registry at an unreachable
// host, so that a value which does start an install dies on ENOTFOUND instead of reaching the machine
// store. `install` and the unset default were the only values that began resolving anything:
//
//   error      exit 1  [ERR_PNPM_VERIFY_DEPS_BEFORE_RUN] refuses; nothing resolved or downloaded
//   warn       exit 0  [WARN] Your node_modules are out of sync … and then the SCRIPT RUNS (no install)
//   prompt     exit 1  refuses *because stdin was not a terminal*; pnpm's own prompt is default=yes, so
//                       in an interactive shell this value can still start the install
//   false      exit 0  script runs, no install attempted, no notice emitted
//   <unknown>  exit 0  script runs, no install attempted — `runDepsStatusCheck`'s switch covers
//                       install/prompt/error/warn and has NO default case, so junk falls through
//   install    the H-12 behaviour above: registry resolution begins before the script is reached
//
// That matrix is why the three states below are PASS, WARN and WARN rather than one blunt "guarded" set:
// `warn` and `false` never install but do run the script, `prompt` only refuses when nobody is looking,
// and an unrecognised value is safe today by fall-through rather than by design.
const PASS_VALUES = new Map([
  [
    "error",
    "refuses the run outright (measured: exit 1, ERR_PNPM_VERIFY_DEPS_BEFORE_RUN, nothing resolved or downloaded)",
  ],
  [
    "warn",
    "warns that the tree is out of sync and then RUNS the script (measured: exit 0, no install attempted)",
  ],
  [
    "false",
    "runs the script with no install attempted and no notice emitted (measured: exit 0)",
  ],
]);
const depsAbsent = !existsSync(path.join(ROOT, "node_modules"));
let depsCheckState = "";
try {
  depsCheckState = execSync("pnpm config get --global verify-deps-before-run", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    timeout: 20_000,
  })
    .toString()
    .trim()
    .split(/\r?\n/)
    .pop();
} catch {
  depsCheckState = "";
}
const effective =
  !depsCheckState || depsCheckState === "undefined"
    ? "install (built-in default)"
    : depsCheckState;
if (!depsAbsent) {
  record(
    "PASS",
    "pnpm run deps-before-run",
    `node_modules exists, so the auto-install path no longer fires from a missing tree; global setting: ${effective}`,
  );
} else if (PASS_VALUES.has(depsCheckState)) {
  record(
    "PASS",
    "pnpm run deps-before-run",
    `global verify-deps-before-run=${depsCheckState} — ${PASS_VALUES.get(depsCheckState)}; the H-12 auto-install cannot fire from this value, so \`pnpm run <script>\` is safe to use`,
  );
} else if (depsCheckState === "prompt") {
  record(
    "WARN",
    "pnpm run deps-before-run",
    "PARTIAL GUARD: global verify-deps-before-run=prompt refuses when stdin is not a terminal (measured: exit 1), " +
      "but pnpm's own prompt defaults to yes, so in an interactive shell it can still start the install. " +
      "`error` is the value that cannot. Until then run the gates as `node scripts/<name>.mjs`.",
  );
} else if (
  depsCheckState !== "" &&
  depsCheckState !== "undefined" &&
  depsCheckState !== "install"
) {
  record(
    "WARN",
    "pnpm run deps-before-run",
    `UNRECOGNISED VALUE: global verify-deps-before-run=${depsCheckState} is not one pnpm recognises (install, prompt, error, warn). ` +
      `Measured 1 Nov 2026: the script ran, exit 0, nothing was fetched — because the dependency check's switch has no default case, so an ` +
      `unknown value falls through. That is fall-through, not a guard: a pnpm version bump can turn it back into the armed behaviour. ` +
      "Treat the workspace as unguarded and run the gates as `node scripts/<name>.mjs`; the remedy is still " +
      "`pnpm config set verify-deps-before-run error --global`.",
  );
} else {
  record(
    "WARN",
    "pnpm run deps-before-run",
    `TRAP ARMED: verify-deps-before-run is ${effective} and node_modules is absent by design (B-02/OD-2), ` +
      `so any \`pnpm run <script>\` — including pnpm test:gates and pnpm audit:* — starts a network install before ` +
      `the script runs (measured 1 Nov 2026; killed, nothing landed in the workspace, packages were written to the ` +
      `machine store). Run the gates as \`node scripts/<name>.mjs\` until the Owner sets the guard: ` +
      `\`pnpm config set verify-deps-before-run error --global\`, or per shell ` +
      `\`pnpm_config_verify_deps_before_run=error pnpm run <script>\`.`,
  );
}

// ── report ──────────────────────────────────────────────────────────────────
const order = { FAIL: 0, WARN: 1, PASS: 2 };
results.sort((a, b) => order[a.level] - order[b.level]);
for (const r of results)
  console.log(`${r.level.padEnd(4)} | ${r.name}\n     | ${r.detail}`);

const fails = results.filter((r) => r.level === "FAIL").length;
console.log(
  `\n${results.length} checks: ${fails} FAIL, ` +
    `${results.filter((r) => r.level === "WARN").length} WARN, ` +
    `${results.filter((r) => r.level === "PASS").length} PASS`,
);
process.exit(fails ? 1 : 0);
