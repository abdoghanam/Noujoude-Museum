#!/usr/bin/env node
/**
 * scripts/tests/preflight-pnpm-trap.test.mjs — regression tests for defect H-12 (blocker B-10).
 *
 * H-12 is the claim that a command which reads like a check performs a write. In this workspace
 * `pnpm run <script>` does not reach the script: pnpm 11 verifies the declared dependencies first and,
 * with `node_modules` absent by design until Owner decision OD-2, starts an install against the public
 * registry. Measured 1 Nov 2026 — `pnpm run audit:workflow` printed `Progress: resolved 669 …` before it
 * was killed. The fix cannot live in the project: `verify-deps-before-run` is one of the keys pnpm reads
 * only from the *global* config file, which is why `.npmrc` sets nothing and why preflight's check 10
 * reports the effective state instead of a hoped-for one.
 *
 * What these cases therefore prove, in order:
 *   • the three effective states are distinguished — built-in default, explicit `install`, and a guard;
 *   • a guard is reported by what it was **measured** to do, not by its name: `error` refuses, `warn`
 *     prints a warning and then runs the script, `false` runs it silently, and all three are non-installing;
 *   • `prompt` is NOT a pass, because it only refuses when stdin is not a terminal — pnpm's prompt
 *     defaults to yes, so at a keyboard it is still one Enter key away from the install;
 *   • a value outside the known set is reported as unguarded, and the text must not claim an install is
 *     coming, because measured behaviour for such a value is a silent fall-through;
 *   • a project-scoped `.npmrc` line does NOT turn the warning off. That single case is the whole hole:
 *     a check that trusted the file would print PASS in exactly the workspace where the install happens;
 *   • an absent pnpm degrades to WARN rather than crashing or silently passing;
 *   • the warning names both Owner remedies, so the next engineer is told what to do rather than that
 *     something is wrong;
 *   • and the committed workspace itself carries the line, in its measured state.
 *
 * Fixtures live in the OS temp directory and point preflight at them with --root, the same seam the H-7
 * suite uses. A stub `pnpm` is placed on the child's PATH — `.cmd` for Windows' cmd.exe resolution and an
 * extension-less 0o755 script for POSIX — so the *real* code path (`execSync` plus the output parse) is
 * what gets tested, not a re-implementation of it. Nothing in the repository or in Noujoude.photo/ is
 * written, renamed or removed by this file.
 */
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const REPO = path.resolve(import.meta.dirname, "..", "..");
const PREFLIGHT = path.join(REPO, "scripts", "preflight.mjs");
const MARKER = "pnpm run deps-before-run";

/**
 * A workspace small enough to reason about: package.json satisfies the engine check so the child exits
 * for reasons that have nothing to do with the line under test. `absentPnpm` leaves the fixture PATH empty
 * of any pnpm; `npmrcLine` writes the project-scoped setting that pnpm 11 is measured to ignore.
 */
function fixture({
  depsAbsent = true,
  stubValue = null,
  npmrcLine = null,
  nodeModules = false,
} = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-trap-"));
  writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({
      name: "fixture",
      version: "0.0.0",
      engines: { node: ">=18" },
      packageManager: "pnpm@11.21.0",
    }),
  );
  mkdirSync(path.join(dir, "docs"), { recursive: true });
  mkdirSync(path.join(dir, "reference"), { recursive: true });
  writeFileSync(
    path.join(dir, "reference", "README.txt"),
    "fixture read-only input" + String.fromCharCode(10),
  );
  mkdirSync(path.join(dir, "Noujoude.photo"), { recursive: true });
  if (nodeModules)
    mkdirSync(path.join(dir, "node_modules"), { recursive: true });
  if (!depsAbsent) {
    const body = stubValue === undefined ? "" : String(stubValue);
    // Windows resolves `pnpm` through PATHEXT, so the .cmd form is what cmd.exe picks up.
    writeFileSync(
      path.join(dir, "pnpm.cmd"),
      "@echo off" +
        String.fromCharCode(13, 10) +
        "echo " +
        (body || "undefined") +
        String.fromCharCode(13, 10),
    );
    // POSIX ignores the extension entirely and execs the bare name.
    const sh =
      "#!/bin/sh" +
      String.fromCharCode(10) +
      "echo " +
      (body || "undefined") +
      String.fromCharCode(10);
    const shPath = path.join(dir, "pnpm");
    writeFileSync(shPath, sh);
    try {
      chmodSync(shPath, 0o755);
    } catch {
      /* Windows: no mode bit to set */
    }
  }
  if (npmrcLine)
    writeFileSync(
      path.join(dir, ".npmrc"),
      npmrcLine + String.fromCharCode(10),
    );
  return dir;
}

function trapLine(dir) {
  const r = spawnSync(process.execPath, [PREFLIGHT, "--root", dir], {
    encoding: "utf8",
    env: { ...process.env, PATH: dir },
  });
  const out = (r.stdout || "") + (r.stderr || "");
  const lines = out.split(String.fromCharCode(10));
  const i = lines.findIndex((l) => l.includes(MARKER));
  if (i < 0)
    return { rc: r.status, level: "ABSENT", detail: out.slice(0, 800) };
  return {
    rc: r.status,
    level: lines[i].trim().split(" ")[0],
    detail: (lines[i + 1] || "").trim(),
  };
}

let passCount = 0,
  failCount = 0;
function check(label, opts, wantLevel, wantPattern) {
  const dir = fixture(opts);
  try {
    const { level, detail } = trapLine(dir);
    if (level === wantLevel && wantPattern.test(detail)) {
      passCount++;
      console.log(`PASS  ${label}  [${level}]`);
    } else {
      failCount++;
      console.log(`FAIL  ${label}`);
      console.log(`      wanted ${wantLevel} matching /${wantPattern}/`);
      console.log(`      got    ${level}: ${detail.slice(0, 400)}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── the three effective states ───────────────────────────────────────────────────────────────────────
check(
  "pnpm answers `undefined`, so the built-in default `install` is in force → trap armed",
  { depsAbsent: false, stubValue: "undefined" },
  "WARN",
  /TRAP ARMED: verify-deps-before-run is install \(built-in default\)/,
);

check(
  "an explicit `install` is armed too — the default and the declared value are the same danger",
  { depsAbsent: false, stubValue: "install" },
  "WARN",
  /TRAP ARMED: verify-deps-before-run is install/,
);

check(
  "the Owner set `error` globally → PASS, and the line says what it was measured to do",
  { depsAbsent: false, stubValue: "error" },
  "PASS",
  /verify-deps-before-run=error[\s\S]*refuses the run outright[\s\S]*exit 1, ERR_PNPM_VERIFY_DEPS_BEFORE_RUN/,
);

check(
  "`warn` passes as non-installing, but must be described as warning AND RUNNING, not as refusing",
  { depsAbsent: false, stubValue: "warn" },
  "PASS",
  /verify-deps-before-run=warn[\s\S]*warns that the tree is out of sync and then RUNS the script[\s\S]*exit 0, no install attempted/,
);

check(
  "`false` passes on the measured fact (script runs, nothing fetched), not on a mechanism claim",
  { depsAbsent: false, stubValue: "false" },
  "PASS",
  /verify-deps-before-run=false[\s\S]*no install attempted[\s\S]*exit 0/,
);

check(
  "`prompt` is only a WARN: it refuses in a non-TTY and can still install at a terminal",
  { depsAbsent: false, stubValue: "prompt" },
  "WARN",
  /PARTIAL GUARD[\s\S]*refuses when stdin is not a terminal[\s\S]*defaults to yes[\s\S]*`error` is the value that cannot/,
);

// ── the hole itself: the project file is not the effective state ─────────────────────────────────────
check(
  "a project `.npmrc` carrying verify-deps-before-run=error does NOT disarm the trap (H-12 measured)",
  {
    depsAbsent: false,
    stubValue: "undefined",
    npmrcLine: "verify-deps-before-run=error",
  },
  "WARN",
  /TRAP ARMED/,
);

check(
  "nor does `engine-strict=true`, the other key this file can actually set",
  {
    depsAbsent: false,
    stubValue: "undefined",
    npmrcLine: "engine-strict=true",
  },
  "WARN",
  /TRAP ARMED/,
);

check(
  "even the two settings together still leave the check red, because neither is global",
  {
    depsAbsent: false,
    stubValue: "undefined",
    npmrcLine:
      "verify-deps-before-run=error" +
      String.fromCharCode(10) +
      "engine-strict=true",
  },
  "WARN",
  /TRAP ARMED/,
);

// ── the guard must be real, not a keyword ────────────────────────────────────────────────────────────
check(
  "an unrecognised value is not treated as safe — PASS is reserved for the three measured non-installing values",
  { depsAbsent: false, stubValue: "yes-please" },
  "WARN",
  /UNRECOGNISED VALUE: global verify-deps-before-run=yes-please[\s\S]*not one pnpm recognises \(install, prompt, error, warn\)/,
);

check(
  "an empty answer degrades to the default rather than to silence",
  { depsAbsent: false, stubValue: "" },
  "WARN",
  /install \(built-in default\)/,
);

{
  // A WARN has to describe the behaviour that was measured. For an unrecognised value the measurement is
  // exit 0 and nothing fetched, so text claiming an install is coming would be the same over-claim class
  // H-12 itself is: a documented statement that does not match what the command does.
  const dir = fixture({ depsAbsent: false, stubValue: "yes-please" });
  try {
    const { level, detail } = trapLine(dir);
    const overClaimsAnInstall = /starts a network install|TRAP ARMED/.test(
      detail,
    );
    const namesTheMechanism = /no default case/.test(detail);
    const stillUnguarded =
      /Treat the workspace as unguarded/.test(detail) &&
      /error --global/.test(detail);
    if (
      level === "WARN" &&
      !overClaimsAnInstall &&
      namesTheMechanism &&
      stillUnguarded
    ) {
      passCount++;
      console.log(
        "PASS  the unrecognised-value WARN states the measured fall-through, does not claim an install, and still demands the remedy",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  unrecognised-value wording: level=${level} claims-install=${overClaimsAnInstall} mechanism=${namesTheMechanism} unguarded=${stillUnguarded}`,
      );
      console.log(`      ${detail.slice(0, 400)}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── absent tooling must not crash or pretend ─────────────────────────────────────────────────────────
check(
  "pnpm missing from PATH entirely → WARN with the default, not a crash and not a PASS",
  { depsAbsent: true },
  "WARN",
  /TRAP ARMED: verify-deps-before-run is install \(built-in default\)/,
);

check(
  "node_modules present ⇒ the missing-tree trigger is gone; the global value is still reported",
  { depsAbsent: false, stubValue: "undefined", nodeModules: true },
  "PASS",
  /node_modules exists[\s\S]*global setting: install \(built-in default\)/,
);

check(
  "a guard plus an installed tree still reads PASS, reported from the tree first",
  { depsAbsent: false, stubValue: "error", nodeModules: true },
  "PASS",
  /node_modules exists[\s\S]*global setting: error/,
);

// ── the warning has to be actionable, not merely alarming ────────────────────────────────────────────
{
  const dir = fixture({ depsAbsent: false, stubValue: "undefined" });
  try {
    const { detail } = trapLine(dir);
    const hasGlobal =
      /pnpm config set verify-deps-before-run error --global/.test(detail);
    const hasShell =
      /pnpm_config_verify_deps_before_run=error pnpm run <script>/.test(detail);
    const tellsTheReader = /node scripts\/<name>\.mjs/.test(detail);
    if (hasGlobal && hasShell && tellsTheReader) {
      passCount++;
      console.log(
        "PASS  the armed state names both Owner remedies and the safe invocation form",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  the WARN is not actionable: global=${hasGlobal} shell=${hasShell} node-form=${tellsTheReader}`,
      );
      console.log(`      ${detail.slice(0, 400)}`);
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── vacuity proof: the rule a naive fix would have written ──────────────────────────────────────────
/**
 * The obvious implementation of this check is to read `.npmrc` — the file a project controls — and report
 * the guard from it. That is precisely what H-12 measured to be wrong: pnpm 11.21.0 does not read
 * `verify-deps-before-run` from a project-scoped file. These two cases run that naive rule against the same
 * fixtures as the real check and show it disagrees in **both** directions, which is what makes the current
 * implementation non-vacuous rather than merely green.
 */
function naiveFileRule(dir) {
  const npmrcPath = path.join(dir, ".npmrc");
  if (!existsSync(npmrcPath)) return "unarmed-by-file";
  const text = readFileSync(npmrcPath, "utf8");
  const m = /^verify-deps-before-run\s*=\s*(\S+)/m.exec(text);
  if (!m) return "unarmed-by-file";
  return ["error", "warn", "prompt", "false"].includes(m[1])
    ? "guarded-by-file"
    : "unarmed-by-file";
}

{
  // File says guarded, effective state says armed: the naive rule would have printed PASS here.
  const dir = fixture({
    depsAbsent: false,
    stubValue: "undefined",
    npmrcLine: "verify-deps-before-run=error",
  });
  try {
    const { level } = trapLine(dir);
    const naive = naiveFileRule(dir);
    if (level === "WARN" && naive === "guarded-by-file") {
      passCount++;
      console.log(
        "PASS  [regression proven] the file-based rule reports guarded where the effective state is armed — the naive fix would have hidden H-12",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  expected real=WARN and naive=guarded-by-file; got real=${level}, naive=${naive}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

{
  // The mirror case: the guard is set globally and the file says nothing. The naive rule cries wolf.
  const dir = fixture({ depsAbsent: false, stubValue: "error" });
  try {
    const { level } = trapLine(dir);
    const naive = naiveFileRule(dir);
    if (level === "PASS" && naive === "unarmed-by-file") {
      passCount++;
      console.log(
        "PASS  [regression proven] the mirror case: a global guard with an empty project file reads PASS here and armed under the file rule",
      );
    } else {
      failCount++;
      console.log(
        `FAIL  expected real=PASS and naive=unarmed-by-file; got real=${level}, naive=${naive}`,
      );
    }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ── the committed workspace carries the line, in its measured state ─────────────────────────────────
{
  // The expectation is computed here, from the workspace and the machine, and is NOT read back out of
  // preflight — the same rule the rest of this suite follows. Hard-coding one state is the defect this
  // case used to have: it asserted `WARN … TRAP ARMED` forever, which was true only while node_modules
  // was absent and no global guard was set. Both of those stopped being true when Owner decisions OD-2
  // (install) and OD-7 (guard) were executed, and the case went red for a reason that was not a defect
  // in check 10. It now follows the state, so it stays correct in all five of them.
  const treePresent = existsSync(path.join(REPO, "node_modules"));
  let globalState = "";
  try {
    const g = spawnSync(
      "pnpm",
      ["config", "get", "--global", "verify-deps-before-run"],
      {
        encoding: "utf8",
        cwd: REPO,
        timeout: 30_000,
        stdio: ["ignore", "pipe", "ignore"],
      },
    );
    globalState = ((g.stdout || "").trim().split(/\r?\n/).pop() || "").trim();
  } catch {
    globalState = "";
  }
  const GUARD_VALUES = ["error", "warn", "false"]; // the three measured never-install values

  let wantLevel, wantPhrase, why;
  if (treePresent) {
    wantLevel = "PASS";
    wantPhrase = "node_modules exists";
    why =
      "node_modules is present, so the missing-tree install path cannot be reached";
  } else if (GUARD_VALUES.includes(globalState)) {
    wantLevel = "PASS";
    wantPhrase = "verify-deps-before-run=";
    why = `the tree is absent but the global guard is set to ${globalState}`;
  } else if (globalState === "prompt") {
    wantLevel = "WARN";
    wantPhrase = "PARTIAL GUARD";
    why = "prompt refuses only on a non-terminal stdin";
  } else if (
    globalState !== "" &&
    globalState !== "undefined" &&
    globalState !== "install"
  ) {
    wantLevel = "WARN";
    wantPhrase = "UNRECOGNISED VALUE";
    why = `the global value ${globalState} is outside pnpm's recognised set (fall-through, not a guard)`;
  } else {
    wantLevel = "WARN";
    wantPhrase = "TRAP ARMED";
    why = "the tree is absent and no guard is set";
  }

  const r = spawnSync(process.execPath, [PREFLIGHT], {
    encoding: "utf8",
    cwd: REPO,
    env: {
      ...process.env,
      PATH: process.env.WINDIR
        ? process.env.WINDIR + path.sep + "System32"
        : "/bin",
    },
  });
  const out = (r.stdout || "") + (r.stderr || "");
  const lines = out.split(String.fromCharCode(10));
  const i = lines.findIndex((l) => l.includes(MARKER));
  const level = i >= 0 ? lines[i].trim().split(" ")[0] : "ABSENT";
  const detail = i >= 0 ? (lines[i + 1] || "").trim() : "";

  // Two assertions, one case: the classification must match the measured state, and the line must never
  // claim the trap is armed while the tree exists — that claim would send the next engineer to set a
  // guard that is already irrelevant to the path they are about to take.
  const classified = level === wantLevel && detail.includes(wantPhrase);
  const noStaleArmedClaim = !(treePresent && /TRAP ARMED/.test(detail));
  if (classified && noStaleArmedClaim) {
    passCount++;
    console.log(
      `PASS  the real workspace runs check 10 in its measured state [${level} / "${wantPhrase}"] — ${why}`,
    );
  } else {
    failCount++;
    console.log(
      `FAIL  real-workspace check 10 is [${level}]: ${detail.slice(0, 400)}`,
    );
    console.log(
      `      expected [${wantLevel}] containing "${wantPhrase}", derived independently from`,
    );
    console.log(
      `      node_modules=${treePresent}, global verify-deps-before-run=${globalState || "(unreadable)"}` +
        `${noStaleArmedClaim ? "" : "; and the line must not say TRAP ARMED while the tree exists"}`,
    );
  }
}

console.log(`\n${passCount} passed, ${failCount} failed`);
process.exit(failCount ? 1 : 0);
