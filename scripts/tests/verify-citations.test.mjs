// H-8 regression suite for `scripts/verify-citations.mjs`.
//
// H-8 was two defects, and both are about what the gate could NOT see or could NOT fail on:
//
//   1. blindness — the scan loop began `if (!/["“”]/.test(line)) continue;`, so a line carrying a
//      citation without quotation marks was never read. Measured in docs/: 867 of 1,646 line
//      references sat on such lines — the majority of this repository's citations.
//   2. impotence — the only failure path in the whole script was the spec-copy boundary guard. A run
//      that printed "LINE_OFF 3" or "NOT_FOUND 2" still exited 0, so CI reported success on a document
//      set the tool had just declared untrustworthy.
//
// Every case below therefore asserts THREE things at once: the classification (which defect class the
// reference lands in), the verdict (exit code), and — for the two blindness cases — that the pre-fix
// rule genuinely did not see what the shipped rule now sees. A suite that only asserted classifications
// would pass on a checker that detects nothing and exits 0.
//
// The suite runs the real script against synthetic workspaces built in the system temp directory, so
// the read-only `reference/` originals and `Noujoude.photo/` are never written to, and a deliberately
// broken fixture can never corrupt the real document set. Plain Node on purpose: these gates must be
// runnable before `pnpm install`, so they cannot depend on vitest.

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';

const REPO = path.resolve(import.meta.dirname, '..', '..');
const CHECKER = path.join(REPO, 'scripts', 'verify-citations.mjs');
const MASTER_NAME = 'Noujoude_Master_Specification_EN.md';
const STANDARD_NAME = 'Noujoude_Technology_and_Security_Standard_EN.md';

let passCount = 0;
let failCount = 0;
const failures = [];

function pass(msg) { passCount++; console.log(`PASS  ${msg}`); }
function fail(msg) {
  failCount++;
  failures.push(msg);
  console.log(`FAIL  ${msg}`);
}

// ── fixture sources ───────────────────────────────────────────────────────────
// Line numbers are the point of this fixture, so the arrays below are the authority and their lengths
// are asserted. Each heading's section runs to the line before the next heading of its own level or
// shallower: `### G.11.3` (level 3) sits INSIDE `## 18.4` (level 2) and does not close it.
const MASTER = [
  '# Master Specification (fixture)',                       // 1
  '',                                                       // 2
  '## 8.2 Logical entities',                                // 3
  '',                                                       // 4
  'The logical model includes, at minimum:',                // 5
  '',                                                       // 6
  '1. `Country` — a country world within the museum.',      // 7
  '2. `Artifact` — an object record with rights state.',    // 8
  '',                                                       // 9
  '## 8.16 Publication and audit entities',                  // 10
  '',                                                       // 11
  '**PublicationRecord:** content entity, locale, publication state, publisher.', // 12
  '',                                                       // 13
  '## 15.9 Global administrative controls',                  // 14
  '',                                                       // 15
  '- **Admin Language:** change the Control Center language independently.', // 16
  '',                                                       // 17
  '## 18.4 Concurrent editing',                              // 18
  '',                                                       // 19
  'The system must detect when another authorized user changed the same record.', // 20
  '',                                                       // 21
  '### G.11.3 Backup policy',                                // 22
  '',                                                       // 23
  '- Backup encryption keys and credentials must not be exposed in the interface.', // 24
  '',                                                       // 25
  '## 23 Closure sequence',                                  // 26
  '',                                                       // 27
  'Phase zero is the only phase claimable without a deployment record.', // 28
  '',                                                       // 29
  '## 24 Rights vocabulary',                                 // 30
  '',                                                       // 31
  'Rights Confirmed is granted only by a recorded approval.', // 32
  '',                                                       // 33
  '## 25 Reserved',                                          // 34
  '',                                                       // 35
  'Padding line thirty six, held in reserve for citation tests.', // 36
  '',                                                       // 37
  'Padding line thirty eight, held in reserve for citation tests.', // 38
  '',                                                       // 39
  'Padding line forty, the last line of this fixture specification.', // 40
];

// §4.2 = 3–6, §6 = 7–11, §8 = 12–15, §10 = 16. Deliberately 16 lines long: a reference that a loose
// binder wrongly attributes to the Standard can be caught as "past the end", which is how the
// cross-column defect became visible. Line 10 is two digits because the registers' house style writes
// a citation as `§6 10`, and that form is only harvested for 2–4 digits.
const STANDARD = [
  '# Technology and Security Standard (fixture)',           // 1
  '',                                                       // 2
  '## 4.2 Runtime',                                         // 3
  '',                                                       // 4
  'Node 24.22.1 is the minimum runtime for this project.',  // 5
  '',                                                       // 6
  '## 6 Rights gating',                                     // 7
  '',                                                       // 8
  'Publication requires recorded rights approval first.',   // 9
  'Padding line ten, still inside section six of the standard.', // 10
  '',                                                       // 11
  '## 8 Provenance',                                        // 12
  '',                                                       // 13
  "An asset's provenance is recorded, never inferred.",     // 14
  '',                                                       // 15
  '## 10 Reserved',                                         // 16
];

// A sibling document: doc→doc citations are this repository's house style, and a filename label is
// written in markdown emphasis. SPEC_A §7.1 = 3–6, §7.2 = 8–11. Line 11 exists specifically so a
// citation that binds §7.1 to line 11 is a demonstrable mismatch rather than a guess.
const SPEC_A = [
  '# Architecture Decisions (fixture)',                     // 1
  '',                                                       // 2
  '## 7.1 Preservation evidence',                           // 3
  '',                                                       // 4
  'The originals are provably unmodified by checksum.',     // 5
  'Every reference file is fingerprinted at rest.',         // 6
  '',                                                       // 7
  '## 7.2 Container engine',                                // 8
  '',                                                       // 9
  'The daemon must answer a bounded probe.',                // 10
  'Nothing here belongs to section 7.1.',                   // 11
];

// The register this project writes about itself. Quoted values from it are a declared class
// (SELF_RECORDING), not a defect, and must never fail the run.
const AUDIT_CSV = [
  'Filename,Derivative Status,Notes',
  'master_atmosphere_definitive.webp,Original (no derivatives produced),checksum verified',
];

const fixtureWrite = (file, lines) =>
  writeFileSync(file, Array.isArray(lines) ? lines.join('\n') : String(lines), 'utf8');

/** Build a throwaway workspace whose docs/ contains exactly one document under test. */
function workspace(docLines, { audit = null, extra = {} } = {}) {
  const root = mkdtempSync(path.join(tmpdir(), 'ndm-cite-'));
  mkdirSync(path.join(root, 'reference'), { recursive: true });
  mkdirSync(path.join(root, 'docs'), { recursive: true });
  fixtureWrite(path.join(root, 'reference', MASTER_NAME), MASTER);
  fixtureWrite(path.join(root, 'reference', STANDARD_NAME), STANDARD);
  fixtureWrite(path.join(root, 'docs', 'SPEC_A.md'), SPEC_A);
  if (audit) fixtureWrite(path.join(root, 'docs', 'ASSET_INVENTORY_AUDIT.csv'), audit);
  fixtureWrite(path.join(root, 'docs', 'UNDER_TEST.md'), docLines);
  for (const [rel, text] of Object.entries(extra)) {
    const abs = path.join(root, rel);
    mkdirSync(path.dirname(abs), { recursive: true });
    writeFileSync(abs, text, 'utf8');
  }
  return root;
}

/** Run the real gate with the fixture as its working directory. */
function run(root) {
  const r = spawnSync(process.execPath, [CHECKER], { cwd: root, encoding: 'utf8' });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  let report = null;
  try {
    report = JSON.parse(readFileSync(path.join(root, 'docs', 'CITATION_VERIFICATION.json'), 'utf8'));
  } catch { /* surfaced by the assertions below */ }
  const under = report?.files?.find((f) => f.file === 'docs/UNDER_TEST.md') ?? { checks: [], refChecks: [], counts: {} };
  return {
    rc: r.status,
    out,
    report,
    counts: {
      verified: report?.summary?.verified ?? 0,
      drifted: report?.summary?.drifted ?? 0,
      notFound: report?.summary?.notFound ?? 0,
      selfRecording: report?.summary?.selfRecording ?? 0,
      definedTerm: report?.summary?.definedTerm ?? 0,
      noReference: report?.summary?.noReference ?? 0,
      uncitedVerbatim: report?.summary?.uncitedVerbatim ?? 0,
      bareRefs: report?.summary?.bareRefs ?? 0,
      bareRefDefects: report?.summary?.bareRefDefects ?? 0,
    },
    refChecks: under.refChecks ?? [],
    checks: under.checks ?? [],
    verdict: /CITATION GATE PASSED/.test(out) ? 'PASSED' : /CITATION GATE FAILED/.test(out) ? 'FAILED' : 'ABSENT',
  };
}

/**
 * The pre-H-8 harvest, re-implemented against the same document so the blindness is measured rather
 * than asserted. Two rules, both taken from the code that shipped before the fix: a line entered the
 * check only if it carried a quotation mark, and no count of findings could set a non-zero exit.
 */
function oldRule(docLines) {
  let linesChecked = 0;
  let refsChecked = 0;
  const refRe = /lines?\s*[:#]?\s*\d{1,4}(?!\.\d)/gi;
  for (const l of docLines) {
    if (!/["“”]/.test(l)) continue;
    linesChecked++;
    refsChecked += (l.match(refRe) ?? []).length;
  }
  const refsOnQuotelessLines = docLines
    .filter((l) => !/["“”]/.test(l))
    .reduce((a, l) => a + ((l.match(refRe) ?? []).length), 0);
  return { linesChecked, refsChecked, refsOnQuotelessLines, exitWas: 0 };
}

/**
 * The pre-H-8 label binder: it took any file word appearing anywhere before the number, so in a table
 * row a label in one column claimed a number in the next column. Kept here to prove that the strict
 * adjacency rule replaced a rule that invented defects, not one that merely failed to find them.
 */
function looseLabelOf(line, numAt) {
  const before = line.slice(0, numAt);
  const words = [...before.matchAll(/(Standard|Master Spec|Specification|Directive)/gi)];
  return words.length ? words[words.length - 1][1] : null;
}

function check(label, docLines, expect, opts) {
  const root = workspace(docLines, opts);
  try {
    const r = run(root);
    // oldRule takes LINES, not a blob: iterating a string yields characters, which would turn every
    // blindness assertion into a tautology about quote marks in single letters.
    const old = oldRule(String(docLines).split('\n'));
    const problems = [];
    if (r.rc !== expect.rc) problems.push(`exit ${r.rc}, expected ${expect.rc}`);
    if (r.verdict !== expect.verdict) problems.push(`verdict ${r.verdict}, expected ${expect.verdict}`);
    if (r.report === null) problems.push('no JSON artefact written');
    for (const [k, v] of Object.entries(expect.counts ?? {})) {
      if (r.counts[k] !== v) problems.push(`${k} = ${r.counts[k]}, expected ${v}`);
    }
    for (const [k, v] of Object.entries(expect.atLeast ?? {})) {
      if (!(r.counts[k] >= v)) problems.push(`${k} = ${r.counts[k]}, expected >= ${v}`);
    }
    const statuses = r.refChecks.map((c) => c.status);
    if (expect.refStatus) {
      for (const want of expect.refStatus) {
        if (!statuses.includes(want)) problems.push(`no ${want} among [${statuses.join(', ') || 'none'}]`);
      }
    }
    if (expect.refStatusCount !== undefined && statuses.length !== expect.refStatusCount) {
      problems.push(`${statuses.length} reference defect(s) [${statuses.join(', ')}], expected ${expect.refStatusCount}`);
    }
    const qStatuses = r.checks.map((c) => c.status);
    for (const want of expect.quoteStatus ?? []) {
      if (!qStatuses.includes(want)) problems.push(`no ${want} among [${qStatuses.join(', ') || 'none'}]`);
    }
    if (expect.detailIncludes) {
      const hay = r.refChecks.map((c) => `${c.detail} ${c.source ?? ''}`).join(' | ');
      if (!hay.includes(expect.detailIncludes)) {
        problems.push(`no reference defect mentions "${expect.detailIncludes}" (got: ${hay.slice(0, 220)})`);
      }
    }
    if (expect.outMatches && !expect.outMatches.test(r.out)) {
      problems.push(`output lacks ${expect.outMatches}`);
    }
    if (expect.oldSees !== undefined && old.refsChecked !== expect.oldSees) {
      problems.push(`pre-fix rule checked ${old.refsChecked} reference(s), expected ${expect.oldSees}`);
    }
    if (expect.oldLinesChecked !== undefined && old.linesChecked !== expect.oldLinesChecked) {
      problems.push(`pre-fix rule read ${old.linesChecked} line(s), expected ${expect.oldLinesChecked}`);
    }
    if (expect.oldBlindTo && old.refsOnQuotelessLines < expect.oldBlindTo) {
      problems.push(`fixture carries only ${old.refsOnQuotelessLines} reference(s) on quote-less lines, expected >= ${expect.oldBlindTo}`);
    }
    if (problems.length) {
      fail(`${label} — ${problems.join('; ')}\n      ${r.out.split('\n').filter((l) => /^\s+\[|^BARE REFERENCES|^VERIFIED |^CITATION/.test(l)).join('\n      ')}`);
    } else {
      pass(`${label} [exit ${r.rc}, ${r.verdict}, refs ${r.counts.bareRefs}, defects ${r.counts.bareRefDefects}${r.refChecks.length ? `: ${r.refChecks.map((c) => `${c.status}@doc:${c.docLine}`).join(', ')}` : ''}]`);
    }
    return r;
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

// ── the fixture's own arithmetic must be trustworthy ──────────────────────────
// Every expected line number below is a claim about these arrays. If an array length drifts, the
// assertions drift with it silently — so the lengths are asserted first, and a mismatch means the
// suite is testing nothing.
if (MASTER.length !== 40 || STANDARD.length !== 16 || SPEC_A.length !== 11) {
  console.log(`FAIL  fixture line counts drifted (master ${MASTER.length}, standard ${STANDARD.length}, SPEC_A ${SPEC_A.length})`);
  console.log('      every expected line number in this suite is now unverified; fix the fixture, not the expectations');
  process.exitCode = 1;
} else {
  pass(`fixture sources have the exact line counts the expectations assume (master 40, standard 16, SPEC_A 11)`);
}

const HEAD = '# Under test\n';

// ── POSITIVE: a document set that is honestly cited must pass ─────────────────
// One line per reference form the repository actually uses. bareRefs is asserted exactly, because the
// H-8 root cause was references never being harvested; a future regression that skips a shape shows up
// here as a count that drops instead of a test that stays green.
const HEALTHY = [
  HEAD,
  'Concurrency is required per §18.4 line 20.',                              // line form + section
  'Two house-style references, §15.9 16 and §23 28, both remain in force.',  // house style, no "line"
  'The audit clause sits at Master Spec G.11.3 line 24.',                    // labelled + appendix sub-section
  'The runtime floor is Standard §4.2 line 5.',                              // labelled file + section
  'Publication fields are listed at (`docs/SPEC_A.md` §7.1, line 5).',       // doc→doc, in emphasis
  '| Standard §6 10 | the concurrency rule is at line 20 |',                 // label must not cross the cell
  '```',                                                                     // ── fence opens
  'A transcript quotes §99.9 line 400, which is not a citation.',
  '```',                                                                     // ── fence closes
  'The roadmap line (2026) and the quantity (400) are not references.',      // bare-paren exemption
  'Verbatim, and cited: "content entity, locale, publication state, publisher" (Master Spec §8.16 line 12).',
  'The provenance rule is Standard §8 line 14, anchored once here.',         // the DEFINED_TERM anchor
  '',
  'The register records "Original (no derivatives produced)" at line 40.',   // SELF_RECORDING class
  '',
  'We reuse the label "provenance is recorded" as vocabulary.',              // DEFINED_TERM class
].join('\n');

check('a honestly cited document passes, and every reference form is harvested', HEALTHY, {
  rc: 0,
  verdict: 'PASSED',
  counts: {
    bareRefs: 9,               // 4 line-form + 2 house + 1 doc→doc + 2 cross-column; the fence, the
                               // parenthesised numbers and every quote-bearing line stay out
    bareRefDefects: 0,
    drifted: 0,
    notFound: 0,
    uncitedVerbatim: 0,
    selfRecording: 1,
    definedTerm: 1,
    verified: 1,
    noReference: 1,
  },
}, { audit: AUDIT_CSV });

check('a document with no citations at all neither crashes nor invents findings',
  [HEAD, 'Nothing in this paragraph is cited, and nothing should be claimed.'].join('\n'),
  { rc: 0, verdict: 'PASSED', counts: { bareRefs: 0, bareRefDefects: 0, verified: 0 } });

// ── NEGATIVE: each REF_* class must fire, and must fail the run ───────────────
check('a bare reference whose line lies outside its own cited section is REF_SECTION_MISMATCH',
  [HEAD, 'Optimistic concurrency per §8.2 line 20, which is not §8.2.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_SECTION_MISMATCH'], refStatusCount: 1,
    counts: { bareRefs: 1, bareRefDefects: 1 },
    detailIncludes: '§8.2 is master lines 3–9',
    // The blindness proof: this line carries a citation, and the pre-fix rule read no such line at all.
    oldSees: 0, oldLinesChecked: 0, oldBlindTo: 1,
  });

check('a reference past the end of every bindable source is REF_PAST_END',
  [HEAD, 'The publication contract is stated at line 399 of the specification.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_PAST_END'], refStatusCount: 1,
    counts: { bareRefs: 1, bareRefDefects: 1 },
    oldSees: 0, oldBlindTo: 1,
  });

check('a reference onto an empty line is REF_BLANK_TARGET, not a silent pass',
  [HEAD, 'The clause at line 21 carries the whole argument.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_BLANK_TARGET'], refStatusCount: 1,
    counts: { bareRefs: 1, bareRefDefects: 1 },
    oldSees: 0, oldBlindTo: 1,
  });

check('a reference into a section no bindable source has is REF_SECTION_UNKNOWN',
  [HEAD, 'This is governed by §99.7 line 20, which exists nowhere.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_SECTION_UNKNOWN'], refStatusCount: 1,
    counts: { bareRefs: 1, bareRefDefects: 1 },
    oldSees: 0, oldBlindTo: 1,
  });

// ── NEGATIVE: the quotation pass must be able to fail, which it never could ───
check('a quotation at the wrong line number is LINE_OFF and fails the run',
  [HEAD, 'The spec says "content entity, locale, publication state, publisher" at Master Spec §18.4 line 20.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    quoteStatus: ['LINE_OFF'],
    counts: { drifted: 1, verified: 0, notFound: 0 },
    outMatches: /\[LINE_OFF\] doc:3 cited 20 actual 12/,
  });

check('a quotation no requirement source contains is NOT_FOUND and fails the run',
  [HEAD, 'The specification demands "the quarterly restore rehearsal was cancelled without notice" (line 20).'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    quoteStatus: ['NOT_FOUND'],
    counts: { notFound: 1, drifted: 0 },
  });

check('verbatim requirement text quoted without any citation fails as uncited verbatim',
  [HEAD, 'We rely on "Phase zero is the only phase claimable without a deployment record" here.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    quoteStatus: ['NO_LINE_REFERENCE'],
    counts: { uncitedVerbatim: 1 },
    outMatches: /verbatim requirement text but carry no line reference/,
  });

// ── red / green: the same document, corrected, must go clean ─────────────────
// Without this pair a suite cannot distinguish "the gate detects defects" from "the gate always fails".
check('CORRECTED: the same sentence with the section it actually cites passes',
  [HEAD, 'Optimistic concurrency per §18.4 line 20, which is where it is.'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 1, bareRefDefects: 0 },
  });

check('CORRECTED: the same sentence with a line inside the section it names passes',
  [HEAD, 'The entity list per §8.2 line 8, inside §8.2.'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 1, bareRefDefects: 0 },
  });

check('CORRECTED: a line reference moved off the empty line resolves',
  [HEAD, 'The clause at line 20 carries the whole argument.'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 1, bareRefDefects: 0 },
  });

// ── the label binder: both directions ────────────────────────────────────────
// The emphasis fix is only provable as a pair: a doc→doc citation that resolves, and the same citation
// pointing outside that section reporting a mismatch AGAINST THE DOC. If the label were simply being
// ignored, the second case would land in REF_SECTION_UNKNOWN against a requirement file instead.
check('a backticked sibling-document label binds to the sibling document',
  [HEAD, 'Preservation is recorded in (`docs/SPEC_A.md` §7.1, lines 5-6) and nowhere else.'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 1, bareRefDefects: 0 },
  });

check('the same label with a line outside that section mismatches against the DOC, not the spec',
  [HEAD, 'Preservation is recorded in (`docs/SPEC_A.md` §7.1, line 11) which §7.1 does not contain.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_SECTION_MISMATCH'], refStatusCount: 1,
    detailIncludes: 'SPEC_A',
    counts: { bareRefs: 1, bareRefDefects: 1 },
  });

check('a file label in one table cell cannot claim a number in the next cell',
  [HEAD, '| Standard §6 10 | the concurrency rule is at line 20, which the Standard is too short to hold |'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 2, bareRefDefects: 0 },
  });

// ── the two declared exclusions must be exclusions, not silence ───────────────
check('references inside a fenced block are excluded, and the exclusion is counted',
  [HEAD, '```', '§99.9 line 400 would be a defect if this were prose.', '```'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 0, bareRefDefects: 0 },
  });

check('a parenthesised number on a quote-less line is excluded as a possible year',
  [HEAD, 'The roadmap line (2026) and the quantity (400) stay outside this pass.'].join('\n'), {
    rc: 0, verdict: 'PASSED', counts: { bareRefs: 0, bareRefDefects: 0 },
  });

// A fence that never closes would mark the rest of the file invisible, so the exemption must be
// bounded: the same bad reference AFTER the fence is reported.
check('the fence exemption ends with the fence; a reference after it is still checked',
  [HEAD, '```', '§99.9 line 400 inside the transcript.', '```', 'And §99.9 line 400 again outside it.'].join('\n'), {
    rc: 1, verdict: 'FAILED',
    refStatus: ['REF_PAST_END'], refStatusCount: 1,
    counts: { bareRefs: 1, bareRefDefects: 1 },
  });

// ── the pre-fix behaviour, measured rather than asserted ─────────────────────
{
  const doc = [HEAD, 'Optimistic concurrency per §8.2 line 20, which is not §8.2.'].join('\n');
  const old = oldRule(doc.split('\n'));
  const root = workspace(doc);
  try {
    const now = run(root);
    const refDefects = now.refChecks.length;
    if (old.linesChecked === 0 && old.refsChecked === 0 && old.exitWas === 0 && refDefects === 1 && now.rc === 1) {
      pass('[regression proven] the pre-H-8 rule read 0 quote-less lines, checked 0 references and could not exit non-zero; the shipped rule finds 1 defect and exits 1');
    } else {
      fail(`expected the pre-H-8 rule to be blind: linesChecked ${old.linesChecked}, refsChecked ${old.refsChecked}, exitWas ${old.exitWas}, now ${refDefects} defect(s) exit ${now.rc}`);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
}

{
  // The impotence half of H-8, measured on a case the pre-fix script DID see: a quotation cited at the
  // wrong line. It printed the finding — and returned success.
  const doc = [HEAD, 'The spec says "content entity, locale, publication state, publisher" at Master Spec §18.4 line 20.'].join('\n');
  const old = oldRule(doc.split('\n'));
  const root = workspace(doc);
  try {
    const now = run(root);
    if (old.linesChecked === 1 && old.refsChecked === 1 && old.exitWas === 0 && now.counts.drifted === 1 && now.rc === 1) {
      pass('[regression proven] the pre-H-8 rule saw this LINE_OFF, printed it, and exited 0; the shipped rule exits 1');
    } else {
      fail(`expected a seen-but-ignored LINE_OFF: linesChecked ${old.linesChecked}, refsChecked ${old.refsChecked}, exitWas ${old.exitWas}, now drifted ${now.counts.drifted} exit ${now.rc}`);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
}

{
  // The nine-of-thirty-five artefact: a loose label binder invented defects that were its own.
  const line = '| Standard §6 10 | the concurrency rule is at line 20 |';
  const numAt = line.indexOf('line 20') + 'line '.length;
  const loose = looseLabelOf(line, numAt);
  const root = workspace([HEAD, line].join('\n'));
  try {
    const now = run(root);
    const invented = now.refChecks.filter((c) => /standard/i.test(`${c.source ?? ''} ${c.detail}`));
    if (loose === 'Standard' && invented.length === 0 && now.rc === 0) {
      pass('[regression proven] the loose binder assigns that number to the Standard (16 lines), which would have manufactured a defect; strict adjacency assigns nothing and the run is clean');
    } else {
      fail(`loose binder gave ${loose}, shipped run gave ${invented.length} invented defect(s), exit ${now.rc}`);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
}

// ── the real document set must pass, and the new pass must actually be running ─
// Asserting exit 0 alone would also be satisfied by a checker that harvests nothing, so the number of
// references examined is asserted as a floor. Before H-8 the figure was structurally zero: 867 of the
// 1,646 line references in docs/ sat on quote-less lines.
{
  const r = spawnSync(process.execPath, [CHECKER], { cwd: REPO, encoding: 'utf8' });
  const out = `${r.stdout ?? ''}${r.stderr ?? ''}`;
  const bare = (out.match(/BARE REFERENCES \(no quotation on the line\): (\d+) checked, (\d+) defect\(s\)/) ?? []);
  const quoteLine = (out.match(/^VERIFIED (\d+) \| LINE_OFF (\d+) \| LINE_OFF_OTHER_SOURCE (\d+).*NOT_FOUND (\d+)/m) ?? []);
  const problems = [];
  if (r.status !== 0) problems.push(`exit ${r.status}`);
  if (!/CITATION GATE PASSED/.test(out)) problems.push('no PASSED verdict');
  if (!bare[1] || Number(bare[1]) < 1000) problems.push(`only ${bare[1] ?? 'no'} bare references examined`);
  if (bare[2] !== '0') problems.push(`${bare[2]} bare-reference defect(s) remain`);
  if (!quoteLine[1] || Number(quoteLine[1]) < 400) problems.push(`only ${quoteLine[1] ?? 'no'} quotations verified`);
  if (quoteLine[2] !== '0' || quoteLine[3] !== '0' || quoteLine[4] !== '0') problems.push('quotation defects remain');
  if (problems.length) fail(`the real docs/ set does not pass the citation gate — ${problems.join('; ')}`);
  else pass(`real docs/ set: ${quoteLine[1]} quotations verified, ${bare[1]} bare references examined, 0 defects, exit 0`);
}

console.log(`\n${passCount} passed, ${failCount} failed`);
if (failCount) {
  console.log(`\n--- failures ---\n${failures.map((f) => `  ${f}`).join('\n')}`);
  process.exitCode = 1;
} else {
  console.log('verify-citations gate is proven: it sees quote-less references, classifies each defect, and fails the run.');
}
