#!/usr/bin/env node
/**
 * scripts/tests/verify-workflow-structure.test.mjs — red/green proof for the workflow structure gate.
 *
 * Plain Node, no runner: `node scripts/tests/verify-workflow-structure.test.mjs`.
 *
 * WHY THIS SUITE EXISTS. Until 1 November 2026 the only evidence that `.github/workflows/ci.yml` was
 * well-formed was that a human had read it: no YAML parser exists on this host (`python -c "import
 * yaml"`, `perl -MYAML`, `ruby -e "require 'yaml'"` and PowerShell's `ConvertFrom-Yaml` all fail —
 * measured 1 Nov 2026), and the file cannot run because there is no repository (B-04). "Verified by
 * reading only" is the weakest claim in this workspace, and a 370-line pipeline with four jobs and
 * thirty-three steps is the least able to support it. This suite converts that into a checked claim:
 * one red fixture per rule, and an independent green fixture per exemption, so a rule cannot be
 * satisfied by a tool that simply cries at everything.
 *
 * What this proves: the gate fires on the defects it names. What it does not prove: that the workflow
 * is valid GitHub Actions YAML (the checker is a block-subset reader, not a conformance parser), or
 * that any step has ever run.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const CHECKER = path.join(ROOT, 'scripts', 'verify-workflow-structure.mjs');

let pass = 0;
let fail = 0;

function logPass(label, extra = '') {
  pass++;
  console.log(`PASS  ${label}${extra ? `   ${extra}` : ''}`);
}
function logFail(label, detail) {
  fail++;
  console.log(`FAIL  ${label}`);
  for (const l of String(detail).split('\n')) console.log(`      | ${l}`);
}

function runFixture(yaml, env = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ndm-workflow-'));
  try {
    const file = path.join(dir, 'ci.yml');
    writeFileSync(file, yaml, 'utf8');
    const r = spawnSync(process.execPath, [CHECKER, file], {
      encoding: 'utf8',
      cwd: ROOT,
      timeout: 30_000,
      env: { ...process.env, ...env },
    });
    return { rc: r.status, out: (r.stdout || '') + (r.stderr || '') };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function expect(label, yaml, wantRc, wantMatch, env = {}) {
  const { rc, out } = runFixture(yaml, env);
  const rcOk = rc === wantRc;
  const msgOk = wantMatch ? wantMatch.test(out) : true;
  if (rcOk && msgOk) logPass(label, `(exit ${rc})`);
  else logFail(label, `wanted exit ${wantRc}${wantMatch ? ` and /${wantMatch}/` : ''}, got exit ${rc}\n${out}`);
}

/** Replace an anchor or fail loudly: a fixture that stopped mutating is a silent loss of coverage. */
function mutate(from, to) {
  return (yaml) => {
    if (!yaml.includes(from)) throw new Error(`fixture anchor is missing: ${from}`);
    return yaml.replace(from, to);
  };
}

// ── baseline: every rule satisfied, so each negative case is exactly one mutation ────────────────
const GOOD = `name: fixture-ci
on:
  push:
    branches: ['**']
jobs:
  gates:
    name: Gates
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Preflight
        run: node scripts/preflight.mjs

      - name: Table suite
        run: node scripts/tests/verify-tables.test.mjs

      - name: Shell syntax
        run: |
          set -e
          for f in scripts/db/*.sh; do
            sh -n "$f"
            echo "sh -n OK  $f"
          done
  downstream:
    name: Downstream
    runs-on: ubuntu-latest
    needs: gates
    env:
      IMAGE: postgres:18.6-alpine
    steps:
      - name: Arm only when the schema exists
        run: |
          if [ -f src/payload/payload.config.ts ]; then
            echo "ARMED: src/payload/payload.config.ts is present"
          else
            echo "NOT ARMED: the file is absent, and that is its state today"
          fi
      - name: Evidence harness
        run: IMAGE="$IMAGE" sh scripts/db/run-privilege-tests.sh
      - name: Toolchain
        run: |
          pnpm install --frozen-lockfile
          pnpm audit --audit-level=high
          pnpm db:up
          echo "generated per run, never stored: $(openssl rand -hex 24)"
`;

// Two-line fixtures for the rules that need an *absent* body, where mutating GOOD would leave the
// remainder of the file ambiguous.
const EMPTY_BLOCK = `name: tiny
on: push
jobs:
  a:
    name: A
    runs-on: ubuntu-latest
    steps:
      - name: Empty
        run: |
`;

const EMPTY_STEPS = `name: tiny
on: push
jobs:
  a:
    name: A
    runs-on: ubuntu-latest
    steps:
`;

const NO_JOBS = `name: tiny
on:
  workflow_dispatch:
`;

const NO_STEPS = `name: tiny
on: push
jobs:
  a:
    name: A
    runs-on: ubuntu-latest
    timeout-minutes: 10
`;

// ── the red cases: one per rule ─────────────────────────────────────────────────────────────────
const red = [
  ['[W1] a tab in indentation is a defect', mutate('    name: Gates', '\t    name: Gates'), /\[W1\]/],
  ['[W1] a carriage return is a defect', mutate('name: fixture-ci', 'name: fixture-ci\r'), /\[W1\]/],
  ['[W2] a workflow with no jobs block is a defect', () => NO_JOBS, /`jobs:`/],
  ['[W2] an unknown top-level key is a defect', mutate('name: fixture-ci', 'name: fixture-ci\nartifact_repo: true'), /\[W2\].*artifact_repo/],
  ['[W3] a duplicate key in one mapping is a defect',
    mutate('    name: Gates\n    runs-on: ubuntu-latest', '    name: Gates\n    name: Gates twice\n    runs-on: ubuntu-latest'),
    /\[W3\].*duplicate key "name"/],
  ['[W3] a dedent to a column that opens no block is a defect',
    mutate('        run: |\n          if [ -f', '       run: |\n          if [ -f'), /\[W3\]/],
  ['[W3] a line that is neither a key nor a sequence item is a defect',
    mutate('      - name: Preflight', '      - name: Preflight\n        this is not yaml'), /\[W3\].*neither a "key: value" pair/],
  ['[W3] a block scalar with no body is a defect', () => EMPTY_BLOCK, /block scalar has no content/],
  ['[W4] a job without runs-on is a defect',
    mutate('    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4', '    steps:\n      - uses: actions/checkout@v4'),
    /\[W4\].*runs-on/],
  ['[W4] a job with an empty steps block is a defect', () => EMPTY_STEPS, /empty `steps:`/],
  ['[W4] a job with both steps and uses is a defect',
    mutate('    steps:\n      - uses: actions/checkout@v4', '    uses: someorg/some-action@v1\n    steps:\n      - uses: actions/checkout@v4'),
    /\[W4\].*both/],
  ['[W4] a job with neither steps nor uses is a defect', () => NO_STEPS, /\[W4\].*neither/],
  ['[W5] a run step without a name is a defect',
    mutate('      - name: Preflight\n        run: node scripts/preflight.mjs', '      - run: node scripts/preflight.mjs'),
    /\[W5\].*name/],
  ['[W5] a malformed uses ref is a defect', mutate('      - uses: actions/checkout@v4', '      - uses: checkout@v4'), /\[W5\].*owner\/repo@ref/],
  ['[W5] a step with neither run nor uses is a defect',
    mutate('      - name: Preflight\n        run: node scripts/preflight.mjs', '      - name: Idle'), /\[W5\].*neither/],
  ['[W6] needs naming a job that does not exist is a defect', mutate('    needs: gates', '    needs: gates-and-more'), /\[W6\]/],
  ['[W6] a needs cycle is a defect', mutate('  gates:\n    name: Gates', '  gates:\n    name: Gates\n    needs: downstream'), /\[W6\].*needs-cycle/],
  ['[W7] a step that runs a script which does not exist is a defect',
    mutate('run: node scripts/preflight.mjs', 'run: node scripts/preflight-renamed.mjs'), /\[W7\].*preflight-renamed\.mjs/],
  ['[W8] a pnpm script package.json does not declare is a defect', mutate('pnpm db:up', 'pnpm db:uptoo'), /\[W8\].*db:uptoo/],
  ['[W10] a literal secret in an env mapping is a defect',
    mutate('      IMAGE: postgres:18.6-alpine', '      IMAGE: postgres:18.6-alpine\n      NDM_RUNTIME_PASSWORD: supersecretvalue12345'),
    /\[W10\].*NDM_RUNTIME_PASSWORD/],
  ['[W10] a literal secret assigned in a shell line is a defect',
    mutate('echo "generated per run, never stored: $(openssl rand -hex 24)"', 'NDM_RUNTIME_PASSWORD=supersecretvalue12345 pnpm db:up'),
    /\[W10\]/],
];

// ── the exemptions, each with its own fixture so the proof is specific ──────────────────────────
const green = [
  ['[W8] pnpm own subcommands are not project scripts',
    `name: tiny\non: push\njobs:\n  a:\n    name: A\n    runs-on: ubuntu-latest\n    steps:\n      - name: Setup\n        run: |\n          pnpm install --frozen-lockfile\n          pnpm audit --audit-level=high\n          pnpm dlx some-tool\n`,
    null],
  ['[W10] an expanded or generated value is not a literal',
    `name: tiny\non: push\njobs:\n  a:\n    name: A\n    runs-on: ubuntu-latest\n    env:\n      NDM_RUNTIME_PASSWORD: \${NODE_ENV}\n      GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}\n    steps:\n      - name: Gen\n        run: NDM_RUNTIME_PASSWORD=$(openssl rand -hex 24) pnpm db:up\n`,
    null],
  ['[W9] a fixture is not accused of repository drift',
    `name: tiny\non: push\njobs:\n  a:\n    name: A\n    runs-on: ubuntu-latest\n    steps:\n      - name: Nothing\n        run: node scripts/preflight.mjs\n`,
    null],
];

// 1. The green baseline, and its two claims.
{
  const { rc, out } = runFixture(GOOD);
  if (rc === 0 && /OK: .*parses as block YAML/.test(out)) {
    logPass('the fixture that satisfies every rule reads green', `(exit ${rc})`);
  } else {
    logFail('the fixture that satisfies every rule reads green', `exit ${rc}\n${out}`);
  }
}
{
  const { rc, out } = runFixture(GOOD);
  if (rc === 0 && !out.includes('[W7]')) {
    logPass('[W7] the armed-step existence probe and prose mentions are not reported', '(no W7 line)');
  } else {
    logFail('[W7] the armed-step existence probe and prose mentions are not reported', `exit ${rc}\n${out}`);
  }
}

// 2. One red fixture per rule.
for (const [label, fn, wantMatch] of red) {
  let yaml;
  try {
    yaml = fn(GOOD);
  } catch (err) {
    logFail(label, err.message);
    continue;
  }
  expect(label, yaml, 1, wantMatch);
}

// 3. The exemptions.
expect('[W8] pnpm own subcommands are not project scripts', green[0][1], 0, null);
expect('[W10] an expanded or generated value is not a literal', green[1][1], 0, null);
expect('[W9] a fixture is not accused of repository drift', green[2][1], 0, null);

// W9 red path, reachable only through the documented injection: the committed files cannot be edited
// to prove a gate, and a rule with no red case is a decoration.
expect('[W9] a suite the local chain runs but this workflow omits is a defect',
  GOOD, 1, /\[W9\].*nope\.test\.mjs/, { NDM_EXPECT_SUITES: 'scripts/tests/nope.test.mjs' });
expect('[W9] a suite the chain runs and a step also runs is not a defect',
  GOOD, 0, null, { NDM_EXPECT_SUITES: 'scripts/tests/verify-tables.test.mjs' });

// 4. Several defects at once must all be reported, not just the first one found.
{
  const yaml = GOOD
    .replace('    runs-on: ubuntu-latest\n    steps:', '    steps:')
    .replace('run: node scripts/preflight.mjs', 'run: node scripts/ghost.mjs')
    .replace('pnpm db:up', 'pnpm db:ghost');
  const { rc, out } = runFixture(yaml);
  const all = /\[W4\]/.test(out) && /\[W7\]/.test(out) && /\[W8\]/.test(out);
  const distinct = new Set((out.match(/\[(W\d+)\]/g) ?? [])).size >= 3;
  if (rc === 1 && all && distinct) logPass('several simultaneous defects are all reported', `(exit ${rc})`);
  else logFail('several simultaneous defects are all reported', `exit ${rc}\n${out}`);
}

// 5. The real repository file, and the drift claim read from the committed files rather than asserted
//    from memory: every suite `pnpm test:gates` chains must appear as a CI step.
{
  const r = spawnSync(process.execPath, [CHECKER], { encoding: 'utf8', cwd: ROOT, timeout: 30_000 });
  const out = (r.stdout || '') + (r.stderr || '');
  if (r.status === 0) logPass('the real .github/workflows/ci.yml passes all 10 rules', '(exit 0)');
  else logFail('the real .github/workflows/ci.yml passes all 10 rules', `exit ${r.status}\n${out}`);
}
{
  const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const chained = (pkg.scripts['test:gates'] ?? '').match(/scripts\/tests\/[A-Za-z0-9_.-]+\.mjs/g) ?? [];
  const ci = readFileSync(path.join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  const missing = chained.filter((s) => !ci.includes(s));
  if (chained.length >= 5 && missing.length === 0) {
    logPass(`the ${chained.length} suites pnpm test:gates chains all appear as CI steps`, '(drift checked both ways)');
  } else {
    logFail('the suites pnpm test:gates chains all appear as CI steps',
      `chained=${chained.length}, missing from CI: ${missing.join(', ') || 'none'}`);
  }
}

// 6. The gate must not be vacuous about its own file list: a step that names a checker which was
//    renamed has to be caught. This is W7 asserted against the real workflow shape, using a fixture
//    copied from it with one path broken.
{
  const ci = readFileSync(path.join(ROOT, '.github', 'workflows', 'ci.yml'), 'utf8');
  const broken = ci.replace('run: node scripts/verify-citations.mjs', 'run: node scripts/verify-citations-v2.mjs');
  if (broken === ci) { logFail('[W7] a renamed gate script inside the real workflow is caught', 'anchor missing'); }
  else {
    const { rc, out } = runFixture(broken);
    if (rc === 1 && /verify-citations-v2\.mjs/.test(out)) logPass('[W7] a renamed gate script inside the real workflow is caught', '(exit 1)');
    else logFail('[W7] a renamed gate script inside the real workflow is caught', `exit ${rc}\n${out}`);
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
