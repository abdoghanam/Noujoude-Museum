#!/usr/bin/env node
/**
 * scripts/tests/copy-master-spec-output.test.mjs — regression tests for the figures that
 * scripts/copy-master-spec.mjs prints about the file it just wrote.
 * Covers the defect recorded in docs/TEST_AND_RELEASE_REPORT.md section 2.2.
 *
 * Plain Node, no runner: `node scripts/tests/copy-master-spec-output.test.mjs`. The project has no
 * node_modules yet (installing it is Owner decision OD-2), so a gate test that needed vitest would be
 * unrunnable, and an unrunnable test is not evidence.
 *
 * THE DEFECT THIS FILE EXISTS FOR. The generator used to announce itself as
 * "wrote FILE | ${written.length} bytes | ${wl.length} lines", where `written` is a **string**.
 * Two things followed from that. The number labelled "bytes" was a UTF-16 code-unit count, so every
 * typographic character this specification carries (right single quote, curly double quotes, em dash,
 * less-or-equal) was reported as one where the disk holds three. And `split` yields one extra empty
 * element after a final newline, so "lines" was one too high on any normally-terminated file.
 *
 * WHY BOTH SURVIVED REVIEW. They were wrong in opposite directions — one too small, one too large — and
 * both landed inside the range a reader expects for a document of this size, so neither looked
 * surprising. That is the reason the truth here is computed a *different* way than the code under test
 * computes it: bytes come from the file on disk as a Buffer, and lines come from counting newline
 * characters rather from splitting on them. A test that re-derived the implementation's own expression
 * would only restate it.
 *
 * Every case builds a fixture workspace in the OS temp directory, runs the generator as a child process
 * with that fixture as its cwd, and asserts against the file it actually wrote. Nothing here writes into
 * docs/, reference/ or Noujoude.photo/ — the real repository is never the input to these cases.
 */
import { spawnSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const GENERATOR = path.resolve(
  import.meta.dirname,
  "..",
  "copy-master-spec.mjs",
);
const SRC_REL = path.join("reference", "Noujoude_Master_Specification_EN.md");
const DOCX_REL = path.join(
  "reference",
  "Noujoude_Master_Specification_EN.docx",
);
const OUT_REL = path.join("docs", "MASTER_SPECIFICATION.md");

const num = (s) => Number(s.replace(/,/g, ""));

/**
 * Ground truth for the file the generator wrote, computed independently of the generator.
 *   bytes        — Buffer length, i.e. what `wc -c` reports
 *   lines        — number of newline characters, plus one when the file is not newline-terminated
 *   oldBytes     — the figure the pre-fix generator printed (UTF-16 code units of the string)
 *   oldLines     — the figure the pre-fix generator printed (split length, incl. the trailing empty element)
 */
function truthOf(buf) {
  const text = buf.toString("utf8");
  const breaks = (text.match(/\n/g) || []).length;
  return {
    text,
    bytes: buf.length,
    lines: text.endsWith("\n") ? breaks : breaks + 1,
    oldBytes: text.length,
    oldLines: text.split(/\r?\n/).length,
  };
}

/** Run the generator over a fixture workspace; returns its exit code, merged output, and the file it wrote. */
function generate(files) {
  const dir = mkdtempSync(path.join(tmpdir(), "ndm-speccopy-"));
  try {
    mkdirSync(path.join(dir, "reference"), { recursive: true });
    mkdirSync(path.join(dir, "docs"), { recursive: true });
    for (const [rel, content] of Object.entries(files)) {
      writeFileSync(path.join(dir, rel), content);
    }
    // The generator reads the companion DOCX unconditionally, so a fixture without one must still have it.
    if (!(DOCX_REL in files))
      writeFileSync(
        path.join(dir, DOCX_REL),
        Buffer.from("fixture docx bytes"),
      );
    const r = spawnSync(process.execPath, [GENERATOR], {
      cwd: dir,
      encoding: "utf8",
    });
    return {
      rc: r.status,
      out: (r.stdout || "") + (r.stderr || ""),
      wrote: existsSync(path.join(dir, OUT_REL))
        ? readFileSync(path.join(dir, OUT_REL))
        : null,
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** The two printed figures, parsed back out of the generator's own sentence. */
function printed(out) {
  const m =
    /wrote \S+ \| ([\d,]+) UTF-8 bytes \| ([\d,]+) lines( \((?:final newline present|no final newline)\))/.exec(
      out,
    );
  if (!m) return null;
  return { bytes: num(m[1]), lines: num(m[2]), newlineLabel: m[3] };
}

let pass = 0;
let fail = 0;

function caseRun(label, files, assertions, note = "") {
  const run = generate(files);
  const problems = [];
  try {
    for (const [name, ok] of assertions(run)) if (!ok) problems.push(name);
  } catch (e) {
    problems.push(`threw ${e && e.message}`);
  }
  if (problems.length === 0) {
    pass++;
    console.log(`PASS  ${label}${note ? `   [${note}]` : ""}`);
  } else {
    fail++;
    console.log(`FAIL  ${label}`);
    for (const p of problems) console.log(`      ${p}`);
    console.log(
      run.out
        .split("\n")
        .slice(0, 12)
        .map((l) => `      | ${l}`)
        .join("\n"),
    );
  }
}

/* ── the fixtures ─────────────────────────────────────────────────────────────────────────────────── */

// Multi-byte body, normally newline-terminated. This is the shape that made the old "bytes" label false.
const MULTI = [
  "Artifact — “Sultan’s basin” ≤ 1900",
  "Second requirement line.",
  "Third requirement line.",
  "",
].join("\n");

// Pure ASCII, so UTF-8 bytes and UTF-16 code units coincide. The old code was only ever right here,
// which is exactly why a code-unit count survived labelled as bytes.
const ASCII = [
  'Artifact - "Sultans basin" <= 1900',
  "Second requirement line.",
  "Third requirement line.",
  "",
].join("\n");

// No final newline: the split artifact that inflated the old line count is absent, so the corrected
// count must NOT subtract one here. Without this case the fix could pass by subtracting unconditionally.
const NO_TRAILING = "Artifact — “Sultan’s basin”\nSecond line.\nThird line.";

// CRLF source, which `split` on the pattern /\r?\n/ treats as one break per occurrence.
const CRLF = "Artifact — line one\r\nLine two.\r\nLine three.\r\n";

// Three lines that duplicate the generated header's own first three lines verbatim. The generator locates
// the verbatim body by searching the emitted text for the body's opening lines, so this collapses the
// search onto the header and must be refused rather than written with a wrong offset.
const PROBE_COLLAPSE = [
  "# NOUJOUDE DIGITAL HERITAGE MUSEUM — MASTER SPECIFICATION (WORKING COPY)",
  "",
  "**This file is a generated working copy.** It exists so the binding product",
  "Fourth line, which is body.",
  "",
].join("\n");

const ALIGN_JSON = JSON.stringify(
  {
    generatedAt: "2026-11-01T00:00:00.000Z",
    verdict: "ALIGNED (fixture)",
    counts: { mdHeadings: 111, docxParagraphs: 222, mdParagraphs: 333 },
    differences: {
      contentLossRisk: [],
      wordTypesOnlyInMarkdownCount: 4,
      mdParagraphsAbsentFromDocxCount: 5,
      substantiveMisses: [],
    },
  },
  null,
  2,
);

const isYes = (out) =>
  /body byte-identical to source: YES \(misaligned lines: 0\)/.test(out);

/* ── 1. the labelled figures must equal the file on disk ───────────────────────────────────────────── */

caseRun(
  'multi-byte body: printed "UTF-8 bytes" equals the file size on disk',
  { [SRC_REL]: MULTI },
  ({ rc, out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      ["exit 0", rc === 0],
      ["the byte sentence parsed", p !== null],
      [
        `printed ${p && p.bytes} != disk ${t.bytes} bytes`,
        p !== null && p.bytes === t.bytes,
      ],
    ];
  },
);

caseRun(
  'multi-byte body: printed "lines" equals the newline count of the file',
  { [SRC_REL]: MULTI },
  ({ out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      [
        `printed ${p && p.lines} != real ${t.lines} lines`,
        p !== null && p.lines === t.lines,
      ],
      [
        "final-newline branch announced",
        p !== null && p.newlineLabel === " (final newline present)",
      ],
    ];
  },
);

caseRun(
  "THE REGRESSION ITSELF: the old formulas are measurably wrong on this same file",
  { [SRC_REL]: MULTI },
  ({ out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      [
        "the fixture must actually contain multi-byte text (oldBytes < bytes)",
        t.oldBytes < t.bytes,
      ],
      [
        "the old byte figure must differ from the printed one",
        t.oldBytes !== p.bytes,
      ],
      [
        "the old line figure must be one higher than the printed one",
        t.oldLines === p.lines + 1,
      ],
    ];
  },
  "a reverted generator fails here, not silently",
);

caseRun(
  "pure-ASCII body: a code-unit count is still wrong, because the generated header is not ASCII",
  { [SRC_REL]: ASCII },
  ({ out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      [
        "the body alone has bytes == code units",
        Buffer.byteLength(ASCII, "utf8") === ASCII.length,
      ],
      [
        "the emitted file does not, so the label was false regardless of what the source contains",
        t.oldBytes < t.bytes,
      ],
      ["printed bytes == disk bytes", p !== null && p.bytes === t.bytes],
      ["printed lines == real lines", p !== null && p.lines === t.lines],
    ];
  },
  "the bug was never body-dependent: the header carries the em dash and curly quotes",
);

caseRun(
  "body with no final newline: the correction must not subtract (boundary, not symmetry)",
  { [SRC_REL]: NO_TRAILING },
  ({ rc, out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      ["exit 0", rc === 0],
      [
        `printed ${p && p.lines} != real ${t.lines} lines`,
        p !== null && p.lines === t.lines,
      ],
      [
        "no-trailing-newline branch announced",
        p !== null && p.newlineLabel === " (no final newline)",
      ],
      ["printed bytes == disk bytes", p !== null && p.bytes === t.bytes],
    ];
  },
);

caseRun(
  "CRLF source body: bytes exact, one line per line break, and the breaks are not normalised",
  { [SRC_REL]: CRLF },
  ({ out, wrote }) => {
    const p = printed(out);
    const t = truthOf(wrote);
    return [
      ["printed bytes == disk bytes", p !== null && p.bytes === t.bytes],
      [
        "printed lines == real lines (one per CRLF, not one per character)",
        p !== null && p.lines === t.lines,
      ],
      [
        `the three carriage returns survived verbatim (found ${(t.text.match(/\r/g) || []).length})`,
        (t.text.match(/\r/g) || []).length === 3,
      ],
      ["self-check still reports the body intact", isYes(out)],
    ];
  },
  "a re-flowed body would move every citation line number in docs/",
);

/* ── 2. the generator must still say whether the copy is faithful ─────────────────────────────────── */

caseRun(
  "verbatim body is byte-identical to the source and misalignment is zero",
  { [SRC_REL]: MULTI },
  ({ rc, out, wrote }) => {
    const t = truthOf(wrote);
    return [
      ["exit 0", rc === 0],
      [
        '"body byte-identical to source: YES (misaligned lines: 0)"',
        isYes(out),
      ],
      ["the source body appears verbatim at the tail", t.text.endsWith(MULTI)],
      [
        "the unresolved offset placeholder was replaced",
        !t.text.includes("__OFFSET__"),
      ],
    ];
  },
);

caseRun(
  "the printed body-start line is the real line (every docs/ citation depends on it)",
  { [SRC_REL]: MULTI },
  ({ out, wrote }) => {
    const m =
      /verbatim body starts at this file's line (\d+) = source line 1/.exec(
        out,
      );
    const t = truthOf(wrote);
    const at = m ? t.text.split(/\r?\n/)[Number(m[1]) - 1] : null;
    const header = /source line N = line N \+ (\d+) of this file/.exec(t.text);
    return [
      ["the start line was printed", m !== null],
      [
        `line ${m && m[1]} of the copy is the source's line 1`,
        at === "Artifact — “Sultan’s basin” ≤ 1900",
      ],
      [
        "the header offset agrees with the printed line",
        header !== null && Number(header[1]) + 1 === Number(m[1]),
      ],
    ];
  },
);

/* ── 3. the header is generated from files, not typed ─────────────────────────────────────────────── */

caseRun(
  "alignment JSON absent: the copy states NOT YET VERIFIED instead of inventing a verdict",
  { [SRC_REL]: MULTI },
  ({ rc, wrote }) => {
    const t = truthOf(wrote);
    return [
      ["exit 0", rc === 0],
      [
        "the written header says NOT YET VERIFIED",
        t.text.includes("NOT YET VERIFIED"),
      ],
      [
        "and names the command that would settle it",
        t.text.includes("scripts/check-docx-alignment.mjs"),
      ],
      ["no verdict is asserted in its place", !t.text.includes("ALIGNED")],
    ];
  },
  "the header goes to the file, not to stdout — asserting it on stdout would be a vacuous pass",
);

caseRun(
  "alignment JSON present: its measured numbers and verdict are carried into the header",
  {
    [SRC_REL]: MULTI,
    [path.join("docs", "DOCX_MD_ALIGNMENT.json")]: ALIGN_JSON,
  },
  ({ out, wrote }) => {
    const t = truthOf(wrote);
    return [
      ["verdict reproduced", t.text.includes("ALIGNED (fixture)")],
      ["heading count reproduced", t.text.includes("111 of 111")],
      ["paragraph counts reproduced", t.text.includes("222 / 333")],
      ["NOT YET VERIFIED is gone", !t.text.includes("NOT YET VERIFIED")],
      [
        "printed figures still match the disk",
        (() => {
          const p = printed(out);
          return p !== null && p.bytes === t.bytes && p.lines === t.lines;
        })(),
      ],
    ];
  },
);

/* ── 4. failure leaves nothing behind ─────────────────────────────────────────────────────────────── */

caseRun(
  "a body-start the generator cannot trust is refused with exit 1 and no partial file",
  { [SRC_REL]: PROBE_COLLAPSE },
  ({ rc, out, wrote }) => [
    ["exit 1", rc === 1],
    [
      "names the failure",
      /could not locate the verbatim body inside the generated file/.test(out),
    ],
    ["wrote no MASTER_SPECIFICATION.md", wrote === null],
    [
      "did not print a byte/line sentence for a file it did not write",
      !/UTF-8 bytes/.test(out),
    ],
  ],
  "the self-check is not vacuous: it can and does say no",
);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
