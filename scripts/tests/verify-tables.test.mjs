#!/usr/bin/env node
/**
 * scripts/tests/verify-tables.test.mjs — regression tests for scripts/verify-tables.mjs (defect H-9).
 *
 * Plain Node, no runner: `node scripts/tests/verify-tables.test.mjs`. The project has no node_modules yet
 * (installing it is Owner decision OD-2), so a gate test that needed vitest would be unrunnable, and an
 * unrunnable test is not evidence.
 *
 * Each case builds a fixture workspace in the OS temp directory, runs the checker as a child process, and
 * asserts the exit code and the defect code it must name. Nothing here writes into docs/, reference/ or
 * Noujoude.photo/.
 *
 * THE POINT OF THE SPLIT-TABLE CASES. H-9 is the claim that the previous checker could report a healthy
 * result on a broken document. For every negative case this file also applies the *old* rule — a run of
 * pipe-led lines whose pipe counts are all equal — to the same fixture, and records whether that rule would
 * have said "fine". Where it would, the case is a real regression demonstration rather than an assertion
 * about history.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHECKER = path.resolve(import.meta.dirname, '..', 'verify-tables.mjs');

// ── the rule as it stood before H-9 was fixed, kept here only to prove vacuity ────────────────────────
function oldRuleWouldPass(text) {
  const lines = text.split('\n');
  let inFence = false;
  let i = 0;
  const w = (l) => {
    let n = 0;
    for (let k = 0; k < l.length; k++) {
      if (l[k] !== '|') continue;
      if (k > 0 && l[k - 1] === '\\') continue;
      n++;
    }
    return n;
  };
  while (i < lines.length) {
    if (/^\s*(```|~~~)/.test(lines[i])) { inFence = !inFence; i++; continue; }
    if (inFence || !/^\s*\|/.test(lines[i])) { i++; continue; }
    const rows = [];
    while (i < lines.length && !/^\s*(```|~~~)/.test(lines[i]) && /^\s*\|/.test(lines[i])) {
      rows.push(w(lines[i])); i++;
    }
    if (rows.some((x) => x !== rows[0])) return false;   // old checker would have reported a defect
  }
  return true;                                            // old checker would have exited 0
}

const cases = [];
let pass = 0;
let fail = 0;

function run(fixtures) {
  const dir = mkdtempSync(path.join(tmpdir(), 'ndm-tables-'));
  try {
    for (const [name, text] of Object.entries(fixtures)) {
      writeFileSync(path.join(dir, name), text, 'utf8');
    }
    const r = spawnSync(process.execPath, [CHECKER, dir], { encoding: 'utf8' });
    return { rc: r.status, out: (r.stdout || '') + (r.stderr || ''), dir };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function expect(label, fixtures, wantRc, wantMatch, opts = {}) {
  const { rc, out } = run(fixtures);
  const rcOk = rc === wantRc;
  const msgOk = wantMatch ? wantMatch.test(out) : true;
  const vacuous = opts.oldRuleWouldMiss === true ? oldRuleWouldPass(Object.values(fixtures).join('\n')) : null;
  if (rcOk && msgOk) {
    pass++;
    let extra = '';
    if (vacuous === true) extra = '   [regression proven: the pre-H-9 pipe-count rule would have exited 0 on this fixture]';
    if (vacuous === false) extra = '   [the pre-H-9 rule also rejected this fixture — it is coverage, not a red case]';
    console.log(`PASS  ${label}  (exit ${rc})${extra}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}`);
    console.log(`      wanted exit ${wantRc}${wantMatch ? ` and /${wantMatch}/` : ''}, got exit ${rc}`);
    console.log(out.split('\n').map((l) => `      | ${l}`).join('\n'));
  }
}

const VALID = `# Doc

| Role | Duty | Owner |
| --- | --- | --- |
| Archivist | Catalogue | A |
| Curator | Interpretation | B |
`;

// ── POSITIVE: a valid table must pass ─────────────────────────────────────────────────────────────────
expect('valid GFM table passes', { 'a.md': VALID }, 0, /OK: 1 tables/);

expect('rows without a trailing pipe still pass (same 3 columns)', {
  'a.md': `| Role | Duty |\n| --- | --- |\n| Archivist | Catalogue |\n| Curator | Interpretation\n`,
}, 0, /OK: 1 tables/);

expect('escaped pipe inside a cell is content, not a separator', {
  'a.md': `| Role | Duty |\n| --- | --- |\n| A | uses \\| and \\||\n| B | plain |\n`,
}, 0, /OK: 1 tables/);

expect('alignment colons in the delimiter row are valid', {
  'a.md': `| L | C | R |\n| :-- | :-: | --: |\n| a | b | c |\n`,
}, 0, /OK: 1 tables/);

expect('pipe-led lines inside a code fence are not tables', {
  'a.md': `# Heading\n\n\`\`\`text\n| not | a |\n| table | at all |\n\`\`\`\n\n| Real | Table |\n| --- | --- |\n| x | y |\n`,
}, 0, /OK: 1 tables/);

expect('two valid tables in one file', {
  'a.md': `${VALID}\n${VALID}`,
}, 0, /OK: 2 tables/);

// ── NEGATIVE: the H-9 defect class ───────────────────────────────────────────────────────────────────
// The exact shape that produced the healthy-looking result: an edit removed a row and left the remainder of
// the table as a second pipe-led run with no header and no delimiter. Every row in both runs has three pipes,
// so the pre-H-9 rule found nothing to report.
expect('SPLIT TABLE: orphan data rows without header or delimiter must fail', {
  'a.md': `| Role | Duty |\n| --- | --- |\n| Archivist | Catalogue |\n\n| Curator | Interpretation |\n| Registrar | Rights |\n`,
}, 1, /\[T2\].*no GFM delimiter row/, { oldRuleWouldMiss: true });

expect('run that begins with a delimiter row has no header', {
  'a.md': `| --- | --- |\n| a | b |\n`,
}, 1, /\[T1\].*starts with a delimiter row/, { oldRuleWouldMiss: true });

expect('header and data rows but no delimiter row at all', {
  'a.md': `| Role | Duty |\n| Archivist | Catalogue |\n`,
}, 1, /\[T2\]/, { oldRuleWouldMiss: true });

expect('delimiter row declaring the wrong number of columns', {
  'a.md': `| A | B | C |\n| --- | --- |\n| x | y | z |\n`,
}, 1, /\[T3\].*header declares 3 column/, { oldRuleWouldMiss: true });

expect('uneven data row (the original incident) is still caught', {
  'a.md': `| A | B |\n| --- | --- |\n| ${'x'} | y |\n| merged onto one line |\n`,
}, 1, /\[T4\]/);

expect('single pipe-led line cannot be a table', {
  'a.md': `# Heading\n\n| lone | row |\n`,
}, 1, /\[T5\]/, { oldRuleWouldMiss: true });

expect('header plus delimiter with no data rows is flagged', {
  'a.md': `| A | B |\n| --- | --- |\n`,
}, 1, /\[T5\].*no data rows/);

// ── the checker must still run clean against the real docs/ ──────────────────────────────────────────
const real = spawnSync(process.execPath, [CHECKER, 'docs'], {
  encoding: 'utf8', cwd: path.resolve(import.meta.dirname, '..', '..'),
});
if (real.status === 0) {
  pass++;
  console.log(`PASS  docs/ passes the strengthened rule   (${real.stdout.trim()})`);
} else {
  fail++;
  console.log(`FAIL  docs/ does not pass the strengthened rule (exit ${real.status})`);
  console.log((real.stdout + real.stderr).split('\n').slice(0, 40).map((l) => `      | ${l}`).join('\n'));
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
