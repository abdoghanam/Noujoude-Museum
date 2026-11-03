/**
 * scripts/verify-citations.mjs
 *
 * Citation integrity gate for everything in docs/.
 *
 * Every engineering document in this repository quotes a reference file and attaches a line number
 * to it. A single invented or drifted citation is enough to make a traceability register
 * untrustworthy, and manual re-reading does not scale across these documents.
 *
 * The model this tool implements:
 *   1. a quotation is extracted by paired quotes, so a line holding two quotations cannot be read
 *      as one quotation spanning them;
 *   2. attribution uses the line references written on the quotation's own markdown line plus the one
 *      line before and after it inside the same block — a prose sentence wraps, so `§8.16 line 1356`
 *      on one line governs the parenthesis that opens the next. An early version scanned a ±320/420
 *      character window over the whole paragraph, so a table row inherited the neighbouring row's
 *      numbers and reported hundreds of false defects; a citation whose label and its number are
 *      split by the wrap (`§13.2 (lines` / `1846–1866)`) is harvested as one citation, which is the
 *      only way the pool may reach past the adjacent line;
 *   3. all numbers on the line are candidates — a quotation is covered if any one of them places
 *      it. The tool never claims which number "belonged" to which quote, because pairing them is
 *      guesswork and guessing produced defects that were the checker's own;
 *   4. a file label binds a number only when it directly precedes it: `Standard §7 line 206`
 *      binds 206 to the Standard, while a later unlabeled `line 2660` on the same line belongs to
 *      no file and is tried against all of them;
 *   5. an elided quotation (`…`, `...`, or a bracketed editorial note) is matched by its surviving
 *      token runs in order, so an honest truncated quote is not mistaken for a fabricated one. The
 *      runs need not be adjacent — an ellipsis means material was omitted, and its length is not the
 *      author's error — but they must fall inside a three-line window, so two sentences that merely
 *      share vocabulary are not read as one quotation;
 *   6. the file under scan is excluded from its own sources, so a document cannot verify a
 *      quotation by matching it back to the very line it sits on;
 *   7. classification:
 *      VERIFIED              — some number on the line places the quotation there
 *      LINE_OFF              — genuine quotation, right file, wrong number
 *      LINE_OFF_OTHER_SOURCE — the quotation belongs to a different reference file
 *      SELF_RECORDING        — the quoted text is a value this project recorded in its own audit
 *                              registers or in the Owner's gap-closure register, which carry no
 *                              requirement line number; reported as a class, not as a defect
 *      PROJECT_RECORD        — the quoted text is verbatim in one of this repository's own
 *                              authored documents (a sibling deliverable's Status line, or its
 *                              recorded measurement). A row can cite a Directive line for the
 *                              requirement and quote a sibling document for the evidence at the
 *                              same time, and the number then points at neither of the quoted
 *                              words; the status reports where the words actually are.
 *      NOT_FOUND             — no requirement source contains the quotation, so it is either the
 *                              author's own wording inside quotation marks or a mis-transcription
 *      DEFINED_TERM          — a short controlled-vocabulary label (a status or state name) quoted
 *                              without a nearby number, where this same document already cites the
 *                              exact source line the term comes from. Repeating a defined term is not
 *                              a missing citation; the anchor is cited once, at its first use
 *      NO_LINE_REFERENCE     — quoted without any nearby number; often this document's own
 *                              vocabulary, which is not a citation and cannot be verified as one
 *
 * 8. a line reference needs no quotation to be checked. The classification above is driven by
 *    quotation marks, which left every paraphrase-plus-number citation outside the tool: measured in
 *    docs/, 867 of 1,646 line references sat on lines carrying no quote mark at all. Those are now
 *    validated against the claims a line number makes by itself — that the source is long enough, that
 *    the named line holds text, and that when the citation also names a section the line falls inside
 *    that section's range (see SECTIONS and the H-8 block). A paraphrase's *fidelity* is still not
 *    checked; nothing mechanical can check it, and pretending otherwise manufactures defects.
 * 9. a defect fails the run. Until H-8 the only failure path was the spec-copy boundary guard, so this
 *    script printed "LINE_OFF 3" and exited 0, and CI called that a pass. Exit 1 now covers LINE_OFF,
 *    LINE_OFF_OTHER_SOURCE, NOT_FOUND, uncited verbatim requirement text, and every REF_* class.
 *
 * The registers state their house style in their own column header — `Source (section · lines)` —
 * and cite as `§11.9 1613–1617`, `G.2 3672`, `Directive 194`. That form is a real citation, so the
 * parser reads it (HOUSE_REF_RE) instead of demanding the docs be rewritten to `line N`. It is
 * deliberately narrower than REF_RE: a locator token (`§n`, `G.n`, `A.n`, `Appendix X`, `Directive`,
 * `Standard`, `Master Spec`) must sit immediately before the number, the number is 2–4 digits, and
 * it may not be followed by a digit, dot or dash. Those three guards are what keep `ADR-014`,
 * `NDM-AST-041`, `18.6`, `768`, `2026` and a section number like `§8.16` from becoming phantom
 * line references.
 *
 * Known limits, stated so the output is not over-read:
 *   - fragments are token-normalised (case, punctuation, curly quotes, dash style, whitespace,
 *     markdown emphasis), so a quote that re-orders words inside a sentence still fails;
 *   - quoted strings of fewer than three tokens are skipped (summary.unmatched) — they carry no
 *     signal; a fragment spanning more than one markdown line is never extracted, because the
 *     extractor works line by line;
 *   - the tool verifies *attribution*, not that the quotation was used to reach a correct
 *     conclusion. A passing citation is necessary evidence, not sufficient.
 *
 * Reads reference/, docs/, the root configuration and the Owner's photo manifest below
 * Noujoude.photo (all read-only here); writes its report to exactly one file, by default
 * docs/CITATION_VERIFICATION.json, redirected with `--out <path>`.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DOCS = path.join(ROOT, "docs");

// Where the report lands is a parameter, not a constant. `pnpm audit:citations` deliberately writes the
// tracked artifact, but a test that verifies the real docs/ set has to be able to run this same checker
// without rewriting a tracked file. Measured 3 November 2026: `pnpm test:gates` moved
// docs/CITATION_VERIFICATION.json — its `generatedAt` field alone — and so broke the SHA-256 manifest
// pin on a checkpoint whose content had not otherwise changed. With no `--out` the behaviour is the
// default above, unchanged.
const OUT_FLAG = process.argv.indexOf("--out");
if (OUT_FLAG > -1 && !process.argv[OUT_FLAG + 1]) {
  console.error("usage error: --out needs a path");
  process.exit(2);
}
const OUT =
  OUT_FLAG > -1
    ? path.resolve(ROOT, process.argv[OUT_FLAG + 1])
    : path.join(ROOT, "docs", "CITATION_VERIFICATION.json");

// Quotations in docs/ are not limited to the specification. They also cite the repository's own
// authored configuration (`.env.example` records rules the docs quote back) and each other
// (`ARCHITECTURE_DECISIONS.md line 221`). A source set that stops at reference/ therefore reports
// true cross-citations as NOT_FOUND. Every one of these files is read-only to this tool.
const REPO_SOURCES = [
  ["env-example", ".env.example", /\.env\.example/i],
  ["docker-compose", "docker-compose.yml", /docker-compose\.yml/i],
  ["package.json", "package.json", /package\.json/i],
  ["tsconfig", "tsconfig.json", /tsconfig\.json/i],
  ["vitest-config", "vitest.config.ts", /vitest\.config\.ts/i],
  ["playwright-config", "playwright.config.ts", /playwright\.config\.ts/i],
  ["eslint-config", "eslint.config.mjs", /eslint\.config\.mjs/i],
];

const REPO_CONFIG_KEYS = new Set(REPO_SOURCES.map(([key]) => key));

// Values the Owner's own asset library records about itself. `_manifest.json` in the quarantine
// folder states each object's `asset_use_state`, `approval_state` and `rights_state`, and the docs
// quote those values while citing the manifest's own line numbers (`_manifest.json lines 21–23`).
// Without it as a source, the checker resolved that citation into the requirement documents — whose
// lines 21–23 are unrelated prose — and reported an honest quotation as drift. Like the repository
// configuration, it is consulted only when the line names it: a bare number never belongs to it.
const OBSERVED_SOURCES = [
  [
    "manifest",
    "Noujoude.photo/_pending_review_AI_generated/_manifest.json",
    /_manifest\.json/i,
  ],
];

/** Sources that are not requirement text, so an unlabelled line number must never resolve to them. */
const NON_REQUIREMENT_KEYS = new Set([
  ...REPO_CONFIG_KEYS,
  ...OBSERVED_SOURCES.map(([key]) => key),
]);

// Sibling documents, by filename. MASTER_SPECIFICATION.md is deliberately absent: its body is a
// verbatim copy of the specification with a line offset, so citing it verifies nothing new and the
// offset makes its line numbers a trap rather than an authority.
const DOC_SOURCES = fs
  .readdirSync(DOCS)
  .filter((f) => f.endsWith(".md") && f !== "MASTER_SPECIFICATION.md")
  .map((f) => [
    `doc:${f}`,
    `docs/${f}`,
    new RegExp(f.replace(/[.]/g, "\\."), "i"),
  ]);

const SOURCES = [
  [
    "master",
    "reference/Noujoude_Master_Specification_EN.md",
    /master spec|specification|the spec\b/i,
  ],
  [
    "standard",
    "reference/Noujoude_Technology_and_Security_Standard_EN.md",
    /\bstandard\b/i,
  ],
  [
    "directive",
    "reference/Noujoude_Master_Execution_Directive_EN.md",
    /directive/i,
  ],
  [
    "asset-req",
    "reference/Noujoude_Asset_and_Brand_Requirements_EN.md",
    /asset and brand|brand requirements|asset requirements/i,
  ],
  [
    "trace-csv",
    "reference/Noujoude_Line_by_Line_Traceability_EN.csv",
    /traceability csv|trace\.csv/i,
  ],
  ...REPO_SOURCES,
  ...OBSERVED_SOURCES,
  ...DOC_SOURCES,
];

const norm = (s) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[”]/g, '"')
    .replace(/[«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .replace(/\*\*/g, "")
    .replace(/[`*_]/g, "")
    .toLowerCase();

const toks = (s) => {
  const m = norm(s).match(/[a-z0-9]+/g);
  return m ? m.join(" ") : "";
};

// source text, per file: a padded token stream plus the stream offset of every line, so a match
// position maps back to a line number. The leading space anchors a match that starts a line to a
// token boundary — "support" cannot match inside "supports".
function loadSource(key, rel, hintRe) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  const text = fs.readFileSync(abs, "utf8");
  const lines = text.split(/\r?\n/);
  let acc = "";
  const lineStart = [];
  for (const l of lines) {
    lineStart.push(acc.length);
    acc += `${toks(l)} `;
  }
  return { key, rel, hintRe, lines, lineStart, acc };
}

const loaded = SOURCES.map(([key, rel, hintRe]) =>
  loadSource(key, rel, hintRe),
).filter(Boolean);

// ── section maps ─────────────────────────────────────────────────────────────
/**
 * Every requirement source is a numbered markdown document (`## 8.16 Concurrent editing`,
 * `# 3. Exact workspace rules`, `# Appendix G — …`, `## G.3 Binding product …`), so each heading
 * announces the section it starts and its level says where that section ends. Reducing a source to
 * (section id, first line, last line) makes one mechanical claim available:
 *
 *   a citation that writes BOTH a section and a line number asserts that the line lies inside
 *   that section — and that assertion can be checked without any quotation to compare against.
 *
 * This exists because of H-8. A quotation is verified by finding its text; a bare reference
 * ("optimistic concurrency per §18.4 line 2426+") has no quoted text to find, so before this map the
 * gate examined only lines carrying quote marks and read every other line as if it cited nothing at
 * all. Measured in docs/: 867 line references sat on quote-less lines against 779 that sat beside a
 * quotation — the majority of this repository's citations were outside the gate entirely. Section
 * containment is what brings them inside.
 *
 * Files with no headings (the line-by-line traceability CSV) yield an empty map, and an empty map can
 * never hold a section, so it can never generate a mismatch. Absence of structure is not structure.
 */
function sectionMap(src) {
  const found = [];
  src.lines.forEach((l, i) => {
    const h = l.match(/^(#{1,6})\s+(.+)$/);
    if (!h) return;
    const ap = h[2].match(/^Appendix\s+([A-G])\b/i);
    const nm = ap ? null : h[2].match(/^([A-H]|\d+)(?:\.(\d+))?(?:\.(\d+))?\b/);
    const id = ap
      ? ap[1].toUpperCase()
      : nm
        ? [nm[1], nm[2], nm[3]].filter(Boolean).join(".")
        : null;
    if (id) found.push({ id, level: h[1].length, line: i + 1 });
  });
  for (let k = 0; k < found.length; k++) {
    let end = src.lines.length;
    for (let j = k + 1; j < found.length; j++) {
      if (found[j].level <= found[k].level) {
        end = found[j].line - 1;
        break;
      }
    }
    found[k].end = end;
  }
  return found;
}
const SECTIONS = new Map(loaded.map((s) => [s.key, sectionMap(s)]));

// Registers that record what this project observed, rather than what the Owner required. Quoted
// values from them are legitimate without a requirement line number, so they are searched only
// after every requirement source has failed, and reported as their own class.
const RECORDED = [
  ["audit-csv", "docs/ASSET_INVENTORY_AUDIT.csv"],
  ["audit-summary", "docs/asset-audit-summary.json"],
  ["gap-csv", "reference/Noujoude_Gap_Closure_Register_EN.csv"],
]
  .map(([key, rel]) =>
    loadSource(
      key,
      rel,
      /asset_inventory_audit\.csv|gap_closure_register|gap closure register/i,
    ),
  )
  .filter(Boolean);

/** line number for a character position in the source token stream (`src.acc`) */
function lineOf(src, accIdx) {
  let lo = 0;
  let hi = src.lineStart.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (src.lineStart[mid] <= accIdx) lo = mid;
    else hi = mid - 1;
  }
  return lo + 1;
}

const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * One run of a quotation, anchored to token boundaries at both ends so "support" cannot match inside
 * "supports". The lookarounds consume nothing, which keeps `hit.index` pointing at the quotation.
 */
function runRe(run) {
  return new RegExp(`(?<=^| )${reEsc(run)}(?= |$)`);
}

/**
 * Where does this quotation start? Returns line numbers, in file order.
 *
 * `chunks` is the quotation split at its elisions (an ellipsis or a bracketed note), so the text
 * between two runs is material the author omitted — it can be any length, and requiring the runs to
 * be space-adjacent rejected honest elisions such as
 * `"Audit records are protected … edit or erase audit history"`. Left unbounded the other way, two
 * unrelated sentences that merely share vocabulary would match. The bound is therefore structural:
 * every run must fall inside the same three-line window as the first, which is further than any
 * quotation in these documents reaches.
 */
function matchStartsInRange(src, chunks, fromLine, toLine) {
  if (!chunks.length) return [];
  const fl = Math.max(1, Math.min(src.lines.length, fromLine));
  const tl = Math.max(fl, Math.min(src.lines.length, toLine));
  const endOf = (n) => {
    const i = Math.max(1, Math.min(src.lines.length, n));
    return src.lineStart[i - 1] + toks(src.lines[i - 1]).length;
  };
  const lo = src.lineStart[fl - 1];
  const hi = endOf(tl);
  const out = [];
  const head = new RegExp(runRe(chunks[0]).source, "g");
  head.lastIndex = Math.max(0, lo - 1);
  let hit;
  while ((hit = head.exec(src.acc)) !== null) {
    if (hit.index < lo) continue;
    if (hit.index >= hi) break;
    const startLine = lineOf(src, hit.index);
    const limit = endOf(startLine + 2);
    let pos = hit.index + chunks[0].length;
    let ok = true;
    for (const run of chunks.slice(1)) {
      const m = runRe(run).exec(src.acc.slice(pos, limit));
      if (!m) {
        ok = false;
        break;
      }
      pos += m.index + run.length;
    }
    if (ok) out.push(startLine);
    if (out.length > 40) break;
  }
  return out;
}

/**
 * Does the quotation occur inside the token range of lines [fromLine, toLine]? A window boundary can
 * never let a match leak into the neighbouring lines, because both ends are compared against
 * character offsets derived from the line index. Reporting the nearest occurrence, not the first,
 * matters: a phrase that also appears earlier in the file must still count as verified at the line
 * the author cited.
 */
function matchIn(src, chunks, fromLine, toLine) {
  const fl = Math.max(1, Math.min(src.lines.length, fromLine));
  const tl = Math.max(fl, Math.min(src.lines.length, toLine));
  const starts = matchStartsInRange(src, chunks, fl, tl);
  if (!starts.length) return null;
  const mid = Math.floor((fl + tl) / 2);
  return starts.sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid))[0];
}

/** Does the fragment occur within a small window around `at`? */
function occursNear(src, chunks, at, window) {
  if (!chunks.length) return null;
  return matchIn(
    src,
    chunks,
    Math.max(1, at - window),
    Math.min(src.lines.length, at + window * 2 + 8),
  );
}

/**
 * Occurrences of the quotation in this source, as line numbers. A file may repeat a phrase, and
 * reporting only the first occurrence turned correct citations into apparent drift: a quotation
 * cited at line 1856 "belonged" to line 37 because line 37 happened to repeat the same phrase.
 */
function occurrences(src, chunks) {
  return matchStartsInRange(src, chunks, 1, src.lines.length);
}

/** Which source line does this fragment belong to, anywhere in the file? */
function findAnywhere(src, chunks, nearLine = null) {
  const occ = occurrences(src, chunks);
  if (!occ.length) return null;
  if (nearLine == null) return occ[0];
  return occ.sort((a, b) => Math.abs(a - nearLine) - Math.abs(b - nearLine))[0];
}

/**
 * Quotation extraction by paired quotes.
 *
 * A plain regex over `["“”]` mis-pairs whenever a line holds two quotations: the closing quote of
 * the first becomes the opening quote of the second, so the text *between* two real quotations is
 * scanned as if it were one, and every such fragment reports NOT_FOUND against the following
 * citation. Openers and closers are therefore classified from their context: `“`/`”` are
 * unambiguous, and a straight `"` is an opener only when the previous character cannot end a word
 * and a closer only when the next character cannot start one. A straight quote between two word
 * characters (`5" nail`, inches, prime notation) is not a quote at all and is skipped.
 */
const OPENERS = new Set([
  "\t",
  " ",
  "(",
  "[",
  "{",
  "|",
  "*",
  "_",
  ">",
  "<",
  "`",
  "'",
  "“",
  "«",
  "“",
]);
const CLOSERS = new Set([
  "\t",
  " ",
  ")",
  "]",
  "}",
  "|",
  "*",
  "_",
  "`",
  "'",
  ".",
  ",",
  ";",
  ":",
  "!",
  "?",
  "”",
  "’",
  "»",
  "…",
]);

function quotations(line) {
  const out = [];
  let open = -1;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c !== '"' && c !== "“" && c !== "”") continue;
    const prev = i > 0 ? line[i - 1] : " ";
    const next = i < line.length - 1 ? line[i + 1] : " ";
    // `“`/`”` are self-declaring. A straight `"` is an opener when what precedes it cannot end a
    // word, and a closer when what follows it cannot start one — the neighbour on the OTHER side is
    // what disqualifies it, so `5" nail` (a prime) reads as a closer and never as an opener.
    const isOpen = c === "“" ? true : c === "”" ? false : OPENERS.has(prev);
    const isClose = c === "”" ? true : c === "“" ? false : CLOSERS.has(next);
    if (open < 0) {
      if (isOpen) open = i;
      continue;
    }
    if (isClose || c === "”") {
      const raw = line.slice(open + 1, i);
      if (raw.length >= 20) out.push({ at: open, raw });
      open = -1;
    } else if (isOpen) {
      // the previous candidate never closed; adopt this one as the opener
      open = i;
    }
  }
  return out;
}

/**
 * An elided quotation ("…", "...", or a bracketed editorial insertion) is not one contiguous token
 * sequence, so requiring the whole string to occur is wrong — it flags an honest truncated quote
 * as fabricated. The quote is split into its surviving chunks and each chunk is matched, in order,
 * inside the cited window. A chunk shorter than 3 tokens carries no signal and is dropped.
 */
function chunksOf(frag) {
  // A bracketed insertion is the author's own words inside a quotation and an ellipsis is text the
  // author left out. Both are seams, not content: split on them, keep the surviving runs, and each
  // run still has to appear in the source in order. A run shorter than 3 tokens carries no signal.
  const parts = frag
    .replace(/\[[^\]]{0,60}\]/g, " §ELID§ ")
    .replace(/…|\.{3}/g, " §ELID§ ")
    .split("§ELID§");
  return (
    parts
      .map((s) => toks(s).replace(/\s+/g, " ").trim())
      // A run needs three tokens *and* a letter. `^22.23.4 | | >=24.22.1` — a version matrix cell read
      // as one fragment because the quotes wrap a table row — is six bare numbers, and six bare numbers
      // match the version table on the very next line of the Standard by arithmetic alone. Numbers
      // without words are not evidence that a sentence was quoted.
      .filter(
        (t) => /[a-z]/.test(t) && t.split(" ").filter(Boolean).length >= 3,
      )
  );
}

// 1–4 digits: a citation to the first lines of a small file (`docker-compose.yml lines 3–5`) is as
// real as one to line 2884, and refusing to read single-digit numbers made genuine quotations of
// the repository's own configuration look unfounded. The `(?!\.\d)` guards are not cosmetic: the
// version-compatibility tables in these documents write `prior stable line 3.90.1→3.92.1`, and a
// matcher that read "line 3" there invented a citation to a line that no author meant.
const REF_RE =
  /(?:lines?)\s*[:#]?\s*(\d{1,4})(?!\.\d)(?:\s*(?:[–—-]|to|through)\s*(\d{1,4})(?!\.\d))?/gi;
// These documents also cite a bare number in parentheses — `"Current review status" (1259)`. Without
// this form the real citation is invisible to the checker and the quotation gets attributed to
// whatever other number shares the line, which is how correct rows were reported as drifted.
// Kept at 3–4 digits, unlike REF_RE: a bare parenthesised number is only readable as a citation when
// it is in the range the requirement file actually has. Letting `(2)` or `(45)` count would turn every
// list marker, year fragment and section number in prose into a phantom line reference.
const BARE_REF_RE = /\((\d{3,4})(?:\s*(?:[–—-]|to|through)\s*(\d{3,4}))?\)/g;

/**
 * The registers' declared house style: `Source (section · lines)` citations written without the word
 * "line" — `§11.9 1613–1617`, `G.2 3672`, `A.10 3463`, `Appendix C 3586–3597`, `Directive 194`,
 * `Standard §12 281`. Rewriting ~200 table cells to `line N` would churn a documented convention to
 * suit a parser, so the parser reads the convention instead.
 *
 * Three guards make this safe, and each one earns its place:
 *   - a locator token is mandatory, so an ordinary number in prose has no way to become a citation;
 *   - 2–4 digits, so `V1`, `P0`, `§8.16`'s own section numbers and a lone `7` stay invisible;
 *   - `(?![\d.\-–])` after the number, so `ADR-014`, `NDM-AST-041`, `18.6-alpine`, `3.92.1` and
 *     `24.22.1` cannot be read as references. The negative lookbehind keeps a number that is the
 *     tail of a longer number (`041` inside `AST-041`) out of the match.
 * The locator may carry an item clause (`§23 item 5 3294`) because that is how these rows cite a
 * numbered list inside a section.
 */
const HOUSE_LOCATOR = String.raw`(?:§{1,2}\s?\d+(?:\.\d+){0,2}(?:\s*items?\s*\d{1,2})?|G\.\d+|A\.\d+|Appendix\s+[A-G](?:\.\d+)?|Master\s+Spec(?:ification)?|Directive|Standard)`;
// The range group is tried first, because `3455-3458` and `1613–1617` are one citation: with the
// guard attached to the opening number instead, the dash would read as "this is not a line number"
// and the whole reference would be dropped.
const HOUSE_REF_RE = new RegExp(
  `(?<![\\dA-Za-z.\\-])${HOUSE_LOCATOR}\\s+(\\d{2,4})(?:\\s*(?:[\\u2013\\u2014-]|to|through)\\s*(\\d{2,4})(?![\\d.\\-\\u2013\\u2014]))?(?![\\d.\\-\\u2013\\u2014])`,
  "gi",
);

/**
 * Which section, if any, does this citation say it is pointing into?
 *
 * Two shapes are accepted, and nothing else:
 *   - an explicit marker: `§8.16`, `§8`, `Appendix G` (the word or the sign makes the intent
 *     unambiguous, so a bare digit after it is read as a section);
 *   - a dotted number: `16.19`, `G.3`, `A.10` — the dot is what distinguishes a section from an
 *     ordinary quantity.
 *
 * A *letter alone* is rejected unless it carries the marker, because `so a line 340` would otherwise
 * read as a citation into "section A", and a single lowercase letter before the word "line" is English,
 * not a locator. Case-sensitivity is deliberate: the reference files write appendices in capitals.
 *
 * When neither shape is present the citation makes no section claim, so section containment is simply
 * not evaluated for it. Absence of a claim is not treated as a violated claim.
 */
// Both alternatives may be followed by the citation words that sit between a section and its number —
// `§8.18 line 1386` has `line ` at the end of the prefix, and a section that cannot be read because the
// author wrote the word "line" would silently disable the containment check for the whole `line N` form.
const SEC_TAIL_SUFFIX = String.raw`(?:\s*lines?\s*[:#]?)?\s*\(?\s*$`;
const SECTION_TAIL = new RegExp(
  `${String.raw`(?:§{1,2}\s*|Appendix\s+)([A-H]|\d+(?:\.\d+){0,2})[,;]?` + SEC_TAIL_SUFFIX}|` +
    String.raw`(?<![A-Za-z0-9.§])([A-H]\.\d+(?:\.\d+)?|\d+\.\d+(?:\.\d+)?)[,;]?` +
    SEC_TAIL_SUFFIX,
);

function sectionIdOf(text, ref) {
  const before = text.slice(0, ref.numAt);
  const m = before.match(SECTION_TAIL);
  if (!m) return null;
  return (m[1] ?? m[2]).replace(/§\s*/g, "").toUpperCase();
}

/**
 * A citation span — `A.2–A.8 3323–3448` — names two sections, not one: the range covers the first
 * section's start through the last section's end. Reading only the locator nearest the number would
 * demand 3323 lie inside A.8 (which starts at 3425) and report a correct citation as a defect.
 * The span is recognised only in its exact written shape: section, dash, optional marker, section.
 */
const SECTION_SPAN = new RegExp(
  String.raw`(?<![A-Za-z0-9.])([A-H]\.\d+(?:\.\d+)?|\d+\.\d+(?:\.\d+)?|[A-H]|\d{1,2})\s*(?:[–\u2014-]|to)\s*(?:§{1,2}\s*|Appendix\s+)?([A-H]\.\d+(?:\.\d+)?|\d+\.\d+(?:\.\d+)?|[A-H]|\d{1,2})[,;]?` +
    SEC_TAIL_SUFFIX,
);

function sectionSpanOf(text, ref) {
  const m = text.slice(0, ref.numAt).match(SECTION_SPAN);
  return m ? { first: m[1].toUpperCase(), last: m[2].toUpperCase() } : null;
}

/**
 * Which file, if any, does the citation itself name — as part of the citation, not merely somewhere
 * on the line?
 *
 * This is house rule 4 ("a file label binds a number only when it directly precedes it") written
 * down. The loose version of it was a defect: in a table row, `… (line 1386; Standard §6) | line 1318`
 * has a label in column four and a number in column five, and the earlier harvest bound the number to
 * the label across the cell boundary — then reported `line 1318` as a citation the Standard is too
 * short to contain. Nine of the thirty-five first-run findings were that artefact, in numbers the
 * Master Spec holds comfortably. So a label may reach only through the shape a citation actually
 * takes: `Standard §10 line 241`, `Directive 190`, `docs/DATA_MODEL.md §2 line 40`, at most one
 * comma-joined second section, and nothing but that. A `;`, a `|` or a `)` between the label and the
 * number ends the citation.
 *
 * A label is then discarded when the citation's own section does not exist in the file it names:
 * `Standard §6, §8.18 line 1386` cannot mean the Standard's §8.18, because the Standard has no §8.18.
 * The section is what tells you which file the author was in.
 */
const LABEL_WORD = String.raw`(?:[A-Za-z0-9_.-]+\.md|Master\s+Spec(?:ification)?(?:\.md)?|Specification|Technology\s*(?:&|and)\s*Security\s+Standard|Standard|Directives?|Asset\s*(?:&|and)\s*Brand\s+Requirements|Traceability\s+CSV|trace\.csv)`;
// A filename label is written in markdown emphasis (`ARCHITECTURE_DECISIONS.md` §7.1), so the closing
// backtick or asterisk sits between the label and its section. Skipping it is not a looseness: without
// it a doc→doc citation binds to no file, falls back to the requirement set, and is then judged against
// a same-numbered section of the Master Spec — which reported a cross-document reference to the ADR as a
// mismatch against master §7.1. Emphasis markers only, never punctuation that ends a citation.
const LABEL_ADJ = new RegExp(
  String.raw`(?:^|[^A-Za-z0-9_.-])(${LABEL_WORD})(?:[\x60*\u007e]{1,3})?\s*\(?\s*(?:§{1,2}\s*)?([A-H]?\d+(?:\.\d+){0,2})?` +
    String.raw`(?:\s*(?:items?|invariant|invariants)\s*\d{1,2})?(?:,\s*(?:§{1,2}\s*)?[A-H]?\d+(?:\.\d+){0,2})?[,;]?\s*(?:lines?\s*[:#]?)?\s*\(?\s*$`,
  "i",
);

function labelKeyOf(text, ref, sources) {
  const m = text.slice(0, ref.numAt).match(LABEL_ADJ);
  if (!m) return null;
  const word = m[1];
  const named = sources.find(
    (s) => s.rel.split("/").pop().toLowerCase() === word.toLowerCase(),
  );
  const src = named ?? sources.find((s) => s.hintRe.test(word));
  if (!src) return null;
  if (ref.sec && !(SECTIONS.get(src.key) ?? []).some((x) => x.id === ref.sec))
    return null;
  if (m[2] && ref.sec === null) {
    // The label carried a section (`Standard §6`) that the citation's number does not repeat; if that
    // section is absent from the file it names, the pairing was misread and must not bind.
    if (!(SECTIONS.get(src.key) ?? []).some((x) => x.id === m[2].toUpperCase()))
      return null;
  }
  return src.key;
}

const results = [];
const summary = {
  files: 0,
  fragments: 0,
  verified: 0,
  drifted: 0,
  driftedOtherSource: 0,
  notFound: 0,
  selfRecording: 0,
  projectRecord: 0,
  definedTerm: 0,
  noReference: 0,
  uncitedVerbatim: 0,
  unmatched: 0,
  bareRefs: 0,
  bareRefDefects: 0,
};

const docFiles = fs
  .readdirSync(DOCS)
  .filter((f) => f.endsWith(".md"))
  .sort();

for (const f of docFiles) {
  const abs = path.join(DOCS, f);
  const text = fs.readFileSync(abs, "utf8");
  // The generated working copy embeds the entire specification verbatim; scanning it would
  // "verify" thousands of self-referential quotes and say nothing about the engineering docs. The
  // boundary is not guessed: the header records the offset it measured on write ("source line N =
  // line N + 128 of this file"), and the verbatim body is independently located by matching the
  // source file's own first three lines. The two measurements must agree, and the scan stops at the
  // body — so the original's YAML front matter, whose `title:` lines are the Owner's words and not
  // this repository's, is never mistaken for an uncited quotation here.
  let scanText = text;
  if (f === "MASTER_SPECIFICATION.md") {
    const lines = text.split(/\r?\n/);
    const row = lines.find((l) =>
      /^\| Line offset inside this copy \|/.test(l),
    );
    const m = row && row.match(/line N \+ (\d+) of this file/);
    const measured = m ? Number(m[1]) + 1 : null;
    const master = loaded.find((s) => s.key === "master");
    const probe = master.lines.slice(0, 3).join("\n");
    const found = lines.findIndex(
      (l, i, a) => i > 0 && a.slice(i, i + 3).join("\n") === probe,
    );
    if (found < 0 || (measured !== null && measured !== found + 1)) {
      console.error(
        `${f}: verbatim body boundary unresolved (measured ${measured}, located ${found + 1}) — refusing to scan an unknown window`,
      );
      process.exitCode = 1;
      continue;
    }
    scanText = lines.slice(0, found).join("\n");
  }
  const docLines = scanText.split("\n");

  summary.files++;
  const fileResult = {
    file: `docs/${f}`,
    checks: [],
    refChecks: [],
    counts: {
      verified: 0,
      drifted: 0,
      drifted_other_source: 0,
      notFound: 0,
      self_recording: 0,
      project_record: 0,
      defined_term: 0,
      noReference: 0,
      uncitedVerbatim: 0,
      ref_ok: 0,
      ref_defects: 0,
    },
  };
  // A document must not verify its own quotations: the sibling-doc sources above would
  // match a paraphrase back to the very line it sits on and report it as an attribution. Excluding
  // the file under scan is what makes a cross-document citation mean something.
  const sourcesHere = loaded.filter((s) => s.rel !== `docs/${f}`);

  // Attribution unit: a markdown table row is its own unit (rows sit on consecutive lines and
  // each carries its own citation). A run of non-table lines is one prose block, so a quotation
  // wrapped across lines of the same paragraph still sees the paragraph's citation.
  const isRow = (l) => /^\s*\|/.test(l);
  const blockOf = (i) => {
    if (isRow(docLines[i])) return [i, i];
    let a = i;
    let b = i;
    while (
      a > 0 &&
      docLines[a - 1].trim() !== "" &&
      !isRow(docLines[a - 1]) &&
      !/^#{1,6}\s/.test(docLines[a - 1])
    )
      a--;
    while (
      b + 1 < docLines.length &&
      docLines[b + 1].trim() !== "" &&
      !isRow(docLines[b + 1]) &&
      !/^#{1,6}\s/.test(docLines[b + 1])
    )
      b++;
    return [a, b];
  };

  // references and source hints on one line's citation text
  const collect = (s) => {
    const refs = [...s.matchAll(REF_RE)].map((r) => ({
      at: r.index,
      raw: r[0],
      from: Number(r[1]),
      to: Number(r[2] ?? r[1]),
      form: "line",
    }));
    for (const r of s.matchAll(BARE_REF_RE)) {
      const from = Number(r[1]);
      refs.push({
        at: r.index,
        raw: r[0],
        from,
        to: r[2] ? Number(r[2]) : from,
        form: "bare",
      });
    }
    // House-style citations carry no `line` keyword and no parentheses, so they are harvested here.
    // `r.index` points at the locator, which is what a file label governs from: `Standard §12 281`
    // binds 281 to the Standard because "Standard" precedes the locator, not the number.
    for (const r of s.matchAll(HOUSE_REF_RE)) {
      const from = Number(r[1]);
      refs.push({
        at: r.index,
        raw: r[0],
        from,
        to: r[2] ? Number(r[2]) : from,
        form: "house",
      });
    }
    // The number's own position, whichever citation form wrote it. `r.at` is the start of the match,
    // which for the house style is the locator rather than the number, so the digits are located
    // inside the match text: `G.7 line 3790` and `§11.9 1613` both put 3790 / 1613 after the label.
    for (const r of refs) {
      r.numAt = r.at + (r.raw ?? "").indexOf(String(r.from));
      r.sec = sectionIdOf(s, r);
    }
    const hints = [];
    for (const src of sourcesHere) {
      for (const hm of s.matchAll(new RegExp(src.hintRe.source, "gi")))
        hints.push({ at: hm.index, key: src.key });
    }
    return {
      text: s,
      refs: refs.filter((r) => r.from > 1).sort((a, b) => a.at - b.at),
      hints,
    }; // "line 1" matches are prose
  };

  // A citation can wrap between its label and its number — `§13.2 (lines` / `1846–1866) adds: …`,
  // which is one citation spread over two markdown lines. When a line ends with nothing but the
  // label, the number that opens the next line is that citation's, so the pair is harvested as one
  // text. Deliberately narrower than a paragraph-wide pool: it fires only on the exact
  // `line(s)` + wrap + number shape, so it cannot borrow a number from an unrelated sentence.
  const LABEL_WRAP = /(?:^|[|(,:;\s])lines?\s*[:#]?\s*$/i;
  const ctxAt = (n, bb) => {
    const s = docLines[n] ?? "";
    const next = n + 1 <= bb ? docLines[n + 1] : "";
    return collect(
      LABEL_WRAP.test(s) && /^\s*-?\d/.test(next ?? "")
        ? `${s} ${next.trim()}`
        : s,
    );
  };

  // Only a hint that PRECEDES a number binds it — and only when that number follows it
  // directly. `Standard §7 line 206 "Record AI configuration…"` binds 206 to the Standard, but a
  // later `§16.19 line 2660` on the same line is a fresh citation with no file label of its own;
  // binding it back to that earlier "Standard" turned a correct Master-Specification reference
  // into a reported drift. A number with no directly preceding hint is checked against every
  // source, because four reference files share the `line N` syntax and the tool must not invent
  // an attribution the author did not write.
  const governingOf = (ref) => {
    const cand = ref.ctx.hints
      .filter((h) => h.at <= ref.at)
      .sort((a, b) => b.at - a.at)[0];
    if (!cand) return null;
    return ref.ctx.refs.some((r) => r.at > cand.at && r.at < ref.at)
      ? null
      : cand;
  };
  const namedBy = (ref) => {
    const governing = governingOf(ref);
    if (governing) return sourcesHere.filter((s) => s.key === governing.key);
    // An unlabeled number is a requirement line number. Sibling documents and the root
    // configuration are consulted only when the line names them: two files sharing the number
    // 301 says nothing about the other's content, and letting them match invented citations
    // that no author wrote.
    return sourcesHere.filter(
      (s) => !s.key.startsWith("doc:") && !NON_REQUIREMENT_KEYS.has(s.key),
    );
  };

  // Every (source, line) pair this document cites anywhere in itself. This is what turns a quoted
  // controlled-vocabulary label into a DEFINED_TERM rather than a missing citation: the label is
  // cited once, at its definition, and repeating `"Implemented and Verified"` down the register is
  // using a term the document has already anchored — see the note in the classifier below.
  const anchors = new Map();
  for (let k = 0; k < docLines.length; k++) {
    const ctx = ctxAt(k, blockOf(k)[1]);
    for (const r of ctx.refs) {
      const ref = { ...r, ctx };
      for (const src of namedBy(ref)) {
        for (let n = ref.from; n <= Math.min(ref.to, ref.from + 50); n++) {
          const list = anchors.get(`${src.key}:${n}`) ?? [];
          if (!list.includes(k + 1)) list.push(k + 1);
          anchors.set(`${src.key}:${n}`, list);
        }
      }
    }
  }

  // ── references that carry no quotation (H-8) ─────────────────────────────────
  // The pass below is driven by quotation marks: `if (!/["“”]/.test(line)) continue`. A line without
  // them was never read at all, so a bare citation — a section, a number, and a paraphrase instead of
  // a quotation — could point at anything and nothing would say so. Measured before this block
  // existed: 867 of the 1,646 line references in docs/ sat on quote-less lines, unvalidated.
  //
  // A quotation is verified by finding its text. A bare number has no text to find, so what is checked
  // here is the claims a line number makes on its own, each of which is mechanical:
  //
  //   REF_PAST_END         the named line is beyond the end of every source the citation can bind to —
  //                        the reference points at a line that does not exist;
  //   REF_BLANK_TARGET     every candidate source has an empty line there — a citation cannot be a
  //                        reading of a line that carries nothing;
  //   REF_SECTION_MISMATCH the citation also names a section, and some candidate source *has* that
  //                        section, but the cited line falls outside its range — the label and the
  //                        number disagree, which is how a stale number or a mislabelled section
  //                        becomes visible with no quotation to compare against;
  //   REF_SECTION_UNKNOWN  the citation names a section that no candidate source contains, while the
  //                        candidates are structured documents — the section it points into is absent.
  //
  // What is deliberately NOT claimed: that the surrounding paraphrase faithfully summarises the line.
  // That needs either the quoted text or a human reader, and an earlier version of this tool guessed at
  // things it could not see and reported defects that were its own.
  //
  // Two exclusions, stated rather than assumed:
  //   - fenced code blocks, because a shell transcript may contain `# 3. …` headings and numbers that
  //     are not citations;
  //   - the bare parenthesised form `(1259)`. Beside a quotation the parentheses read as a citation
  //     because the quotation is what makes the sentence a citation; alone, `(2026)` in a roadmap line
  //     is indistinguishable from a year. It stays checked by the quotation pass.
  const inFence = (() => {
    const f = new Array(docLines.length).fill(false);
    let open = false;
    for (let i = 0; i < docLines.length; i++) {
      if (/^\s*(```|~~~)/.test(docLines[i])) {
        open = !open;
        f[i] = true;
        continue;
      }
      f[i] = open;
    }
    return f;
  })();

  for (let i = 0; i < docLines.length; i++) {
    const line = docLines[i];
    if (inFence[i] || /["“”]/.test(line)) continue;
    const ctxBare = ctxAt(i, blockOf(i)[1]);
    for (const base of ctxBare.refs) {
      if (base.form === "bare") continue;
      // Requirement sources first, exactly as house rule 4 says: an unlabelled number is a requirement
      // line number. A file label joins the set only when the citation itself writes it, and then
      // replaces it — `Standard §10 line 241` is a claim about the Standard, and nothing else.
      const key = labelKeyOf(ctxBare.text, base, sourcesHere);
      const cands = key
        ? sourcesHere.filter((s) => s.key === key)
        : sourcesHere.filter(
            (s) =>
              !s.key.startsWith("doc:") && !NON_REQUIREMENT_KEYS.has(s.key),
          );
      summary.bareRefs++;
      const cited = `${base.from}${base.to !== base.from ? `–${base.to}` : ""}`;
      const longEnough = cands.filter((s) => s.lines.length >= base.to);
      let defect = null;
      if (!longEnough.length) {
        defect = {
          status: "REF_PAST_END",
          source: null,
          detail:
            `no source this citation can bind to reaches line ${base.to}` +
            ` (${cands.map((s) => `${s.key} ${s.lines.length}L`).join(", ") || "no source resolved for this number"})`,
        };
      } else if (
        longEnough.every(
          (s) =>
            !String(s.lines[base.from - 1] ?? "").trim() &&
            !String(s.lines[base.to - 1] ?? "").trim(),
        )
      ) {
        defect = {
          status: "REF_BLANK_TARGET",
          source: longEnough[0].rel,
          detail: `line ${cited} is empty in ${longEnough.map((s) => s.key).join(", ")} — nothing is being cited`,
        };
      } else if (base.sec) {
        const span = sectionSpanOf(ctxBare.text, base);
        const inRange = (s, id, lo, hi) =>
          (SECTIONS.get(s.key) ?? []).some(
            (x) => x.id === id && lo >= x.line && hi <= x.end,
          );
        const holders = longEnough.filter((s) =>
          (SECTIONS.get(s.key) ?? []).some((x) => x.id === base.sec),
        );
        const structured = longEnough.filter(
          (s) => (SECTIONS.get(s.key) ?? []).length > 0,
        );
        // A span cites the envelope of two sections, so the first id is part of the claim too.
        const covered = holders.some((s) => {
          if (inRange(s, base.sec, base.from, base.to)) return true;
          if (!span || span.last !== base.sec) return false;
          const first = (SECTIONS.get(s.key) ?? []).find(
            (x) => x.id === span.first,
          );
          const last = (SECTIONS.get(s.key) ?? []).find(
            (x) => x.id === span.last,
          );
          return (
            !!first && !!last && base.from >= first.line && base.to <= last.end
          );
        });
        if (!covered && holders.length) {
          const h = holders[0];
          const x = (SECTIONS.get(h.key) ?? []).find((y) => y.id === base.sec);
          defect = {
            status: "REF_SECTION_MISMATCH",
            source: h.rel,
            detail:
              `§${base.sec} is ${h.key} lines ${x.line}–${x.end}, but the citation points at line ${cited}` +
              (span
                ? ` (span §${span.first}–§${span.last} also unreadable there)`
                : ""),
          };
        } else if (!holders.length && structured.length) {
          defect = {
            status: "REF_SECTION_UNKNOWN",
            source: structured[0].rel,
            detail:
              `section §${base.sec} does not exist in ${structured.map((s) => s.key).join(", ")}, ` +
              `the sources this citation can bind to`,
          };
        }
      }
      if (!defect) {
        fileResult.counts.ref_ok++;
        continue;
      }
      fileResult.counts.ref_defects++;
      summary.bareRefDefects++;
      fileResult.refChecks.push({
        docLine: i + 1,
        cited,
        citation: (base.raw ?? "").trim(),
        ...defect,
      });
    }
  }

  for (let i = 0; i < docLines.length; i++) {
    const line = docLines[i];
    if (!/["“”]/.test(line)) continue;
    const [ba, bb] = blockOf(i);
    const own = ctxAt(i, bb);

    // A table row often carries several citations and several quotations, so pairing each quote with
    // one number is guesswork — and an earlier version of this tool guessed wrong, attributing a
    // quotation to whichever number sat nearest mid-row, sometimes a neighbouring row's, and
    // reporting defects that were the checker's own.
    for (const q of quotations(line)) {
      const frag = q.raw
        .replace(/\s*\|\s*/g, " | ")
        .trim()
        .replace(/^["'”]|[，“"]$/g, "")
        .trim();
      const chunks = chunksOf(frag);
      if (!chunks.length) {
        summary.unmatched++;
        continue;
      }
      summary.fragments++;

      // A quotation is covered if ANY line reference in its sentence puts it there. A finding then
      // asserts something a reviewer can act on, without the tool ever claiming which number
      // "belonged" to which quote. (An earlier version guessed by nearest number mid-row and
      // reported defects that were the checker's own.)
      //
      // The sentence, not the markdown line, is the unit. Prose wraps:
      //
      //   2. **Audit-record integrity ...** Master Spec §8.16 line 1356
      //      ("Audit records are protected from ordinary editing") and §16.19 line 2664 ...
      //
      // so the candidate pool is the quotation's own line plus the one line before and after it
      // inside the same block. Each reference carries the context it was harvested from, because a
      // file label governs a number only within that number's own line.
      const citations = own.refs.map((r) => ({ ...r, ctx: own }));
      for (const j of [i - 1, i + 1]) {
        if (j < ba || j > bb || j < 0 || j >= docLines.length) continue;
        const c = ctxAt(j, bb);
        citations.push(...c.refs.map((r) => ({ ...r, ctx: c })));
      }
      const scope = own.refs.length
        ? "own-line"
        : citations.length
          ? "adjacent-line"
          : "none";
      if (!citations.length) {
        summary.noReference++;
        fileResult.counts.noReference++;
        // An uncited quotation is not a defect by itself — most of them are this document's own
        // vocabulary put in quotes for emphasis. But some are verbatim requirement text that lost
        // its citation in editing, and those should be attributed. Reporting which ones the
        // requirement files contain turns an untriageable pile into a short actionable list.
        const where = [];
        for (const src of sourcesHere.filter(
          (s) => !s.key.startsWith("doc:") && !NON_REQUIREMENT_KEYS.has(s.key),
        )) {
          const at = findAnywhere(src, chunks);
          if (at) where.push({ key: src.key, rel: src.rel, line: at });
        }
        // DEFINED_TERM: a short label that is verbatim requirement vocabulary, where this very
        // document cites the exact line the vocabulary is defined on. `"Implemented and Verified"`
        // appears down the register dozens of times because it is the status axis the Directive
        // mandates at §15 line 288; the register anchors that line once, and re-quoting the label
        // 23 times is using a defined term, not 23 missing citations. Requiring the anchor to be the
        // same (source, line) the term was found on is what keeps this from excusing an uncited
        // sentence: a full requirement sentence is never ≤ 8 tokens, and an unanchored term stays
        // reported as uncited verbatim text.
        const termTokens = toks(frag).split(" ").filter(Boolean).length;
        const anchored = where.filter((w) => anchors.get(`${w.key}:${w.line}`));
        if (anchored.length && termTokens <= 8) {
          summary.definedTerm++;
          fileResult.counts.defined_term++;
          fileResult.checks.push({
            docLine: i + 1,
            fragment: frag.slice(0, 110),
            status: "DEFINED_TERM",
            verbatimIn: anchored.map((w) => `${w.rel}:${w.line}`),
            anchoredAt: anchored.map(
              (w) =>
                `${w.key}:${w.line}, cited by this document on line ${anchors.get(`${w.key}:${w.line}`).join(", ")}`,
            ),
            note: "controlled-vocabulary label: this document cites the source line it comes from, so repeating the label is not a missing citation",
          });
          continue;
        }
        if (where.length) {
          summary.uncitedVerbatim++;
          fileResult.counts.uncitedVerbatim++;
        }
        fileResult.checks.push({
          docLine: i + 1,
          fragment: frag.slice(0, 110),
          status: "NO_LINE_REFERENCE",
          verbatimIn: where.map((w) => `${w.rel}:${w.line}`),
          note: "quoted with no numeric line reference on its line or in its prose block; this document's own vocabulary is quoted this way, so it is not an error — it is simply not a citation",
        });
        continue;
      }

      let out = null;
      // tier 1 — some citation on this line places the quotation at its own line number
      for (const ref of citations) {
        const window = Math.max(4, ref.to - ref.from + 4);
        let hit = null;
        for (const src of namedBy(ref)) {
          hit = occursNear(src, chunks, ref.from, window);
          if (hit) {
            out = {
              status: "VERIFIED",
              source: src.rel,
              cited: ref.from,
              actual: hit,
            };
            break;
          }
        }
        if (out) break;
      }
      // tier 2 — right file, wrong number
      if (!out) {
        for (const ref of citations) {
          for (const src of namedBy(ref)) {
            const anywhere = findAnywhere(src, chunks, ref.from);
            if (anywhere) {
              out = {
                status: "LINE_OFF",
                source: src.rel,
                cited: ref.from,
                actual: anywhere,
                occurrences: occurrences(src, chunks).length,
              };
              break;
            }
          }
          if (out) break;
        }
      }
      // tier 3 — a number on the line is right for a file the line never named
      if (!out) {
        const named = new Set(
          citations.flatMap((ref) => namedBy(ref).map((s) => s.key)),
        );
        for (const ref of citations) {
          for (const src of sourcesHere.filter(
            (s) => !named.has(s.key) && !s.key.startsWith("doc:"),
          )) {
            const window = Math.max(4, ref.to - ref.from + 4);
            const hit = occursNear(src, chunks, ref.from, window);
            if (hit) {
              out = {
                status: "LINE_OFF_OTHER_SOURCE",
                source: src.rel,
                cited: ref.from,
                actual: hit,
                near: true,
              };
              break;
            }
            const anywhere = findAnywhere(src, chunks, ref.from);
            if (anywhere) {
              out = {
                status: "LINE_OFF_OTHER_SOURCE",
                source: src.rel,
                cited: ref.from,
                actual: anywhere,
              };
              break;
            }
          }
          if (out) break;
        }
      }

      if (!out) {
        // Before calling a quotation unfounded, check the registers that record this project's own
        // observations — the asset audit CSV/summary and the Owner's gap-closure register. Their
        // values are quoted constantly (`72 × "Original (no derivatives produced)"`) and carry no
        // requirement line number, so a requirement-file search cannot classify them. Reporting
        // them as NOT_FOUND would bury the findings that are real.
        for (const src of RECORDED) {
          const anywhere = findAnywhere(src, chunks);
          if (anywhere) {
            out = {
              status: "SELF_RECORDING",
              source: src.rel,
              cited: citations[0].from,
              actual: anywhere,
            };
            break;
          }
        }
      }
      if (!out) {
        // A deliverable's Status line is quoted as evidence elsewhere: the traceability register
        // records that `docs/ARCHITECTURE.md` "declares the application layer a contract only, with
        // zero implementation", which is a quotation of this repository's own document, not of a
        // requirement. Such a row carries two citations at once — a Directive line for the
        // requirement and a quoted declaration for the evidence — so a requirement-source search
        // cannot see the second one. This tier never uses the line number: it reports where the
        // words actually are, which is what makes the citation checkable rather than unfounded.
        const ownRecords = sourcesHere.filter(
          (s) => s.key.startsWith("doc:") || NON_REQUIREMENT_KEYS.has(s.key),
        );
        for (const src of ownRecords) {
          const anywhere = findAnywhere(src, chunks);
          if (anywhere) {
            out = {
              status: "PROJECT_RECORD",
              source: src.rel,
              cited: citations[0].from,
              actual: anywhere,
            };
            break;
          }
        }
      }

      if (!out)
        out = {
          status: "NOT_FOUND",
          source: null,
          cited: citations[0].from,
          actual: null,
        };
      out.citationsOnLine = citations.map((r) =>
        r.to !== r.from ? `${r.from}-${r.to}` : String(r.from),
      );
      out.namedSources = [
        ...new Set(citations.map((r) => governingOf(r)?.key ?? "any")),
      ];

      summary[
        out.status === "LINE_OFF_OTHER_SOURCE"
          ? "driftedOtherSource"
          : out.status === "LINE_OFF"
            ? "drifted"
            : out.status === "SELF_RECORDING"
              ? "selfRecording"
              : out.status === "PROJECT_RECORD"
                ? "projectRecord"
                : out.status === "DEFINED_TERM"
                  ? "definedTerm"
                  : out.status === "NOT_FOUND"
                    ? "notFound"
                    : "verified"
      ]++;
      const bucket =
        out.status === "LINE_OFF_OTHER_SOURCE"
          ? "drifted_other_source"
          : out.status === "LINE_OFF"
            ? "drifted"
            : out.status === "SELF_RECORDING"
              ? "self_recording"
              : out.status === "PROJECT_RECORD"
                ? "project_record"
                : out.status === "NOT_FOUND"
                  ? "notFound"
                  : "verified";
      fileResult.counts[bucket]++;

      fileResult.checks.push({
        docLine: i + 1,
        fragment: frag.slice(0, 110),
        refScope: scope,
        ...out,
      });
    }
  }
  results.push(fileResult);
}

const report = {
  generatedAt: new Date().toISOString(),
  tool: "scripts/verify-citations.mjs",
  sources: loaded.map((s) => `${s.key} = ${s.rel} (${s.lines.length} lines)`),
  recordedSources: RECORDED.map(
    (s) => `${s.key} = ${s.rel} (${s.lines.length} lines)`,
  ),
  summary,
  interpretation:
    "VERIFIED = the quotation occurs at (or within a few lines of) a line reference written on the quotation's own markdown line or on the line above/below it inside the same block. Both citation styles are read: `line N` / `(N)` and the registers' declared house style `§11.9 1613–1617`, `G.2 3672`, `Directive 194`. LINE_OFF = genuine quotation, right file, wrong line number. LINE_OFF_OTHER_SOURCE = the quotation exists in a different reference file than the line attributes it to. SELF_RECORDING = the quoted text is a value this project recorded in its own audit registers, or a cell of the Owner's gap-closure register; those carry no requirement line number, so this is a class, not a defect. DEFINED_TERM = a short (≤ 8 token) controlled-vocabulary label with no nearby number, where this same document cites the exact source line the label was found on — the term is anchored once at its definition and repeated as vocabulary, which is not a missing citation. NOT_FOUND = no requirement source contains the quotation; treat as suspect and either restore the source wording or rewrite it as a paraphrase without quotation marks. NO_LINE_REFERENCE = quoted material with no nearby line number, which includes this repository's own vocabulary and is not a citation; when it is verbatim requirement text it is additionally listed as uncited verbatim. Elided quotations (ellipsis or bracketed note) are matched by their surviving runs in order inside a three-line window, so an honest truncated quote is not mistaken for a fabricated one. Quoted strings of fewer than three tokens are skipped (summary.unmatched). " +
    "SEPARATELY, summary.bareRefs counts the line references that sit on lines carrying no quotation at all — citations made by paraphrase plus number, which the quotation pass cannot see. Each is tested for the claims a number makes without any text to match: REF_PAST_END (no bindable source is that long), REF_BLANK_TARGET (the line named is empty in every candidate), REF_SECTION_MISMATCH (the citation names a section that its source has, and the line lies outside it), REF_SECTION_UNKNOWN (the citation names a section absent from every bindable structured source). These are defects, not classes: a line reference that does not resolve, or that puts a line inside the wrong section, is a citation this repository cannot stand behind. What no check here asserts is that the paraphrase summarises the line correctly — that needs the text or a reader, and neither is simulated. A bare parenthesised `(N)` is excluded from this pass on quote-less lines, where it is indistinguishable from a year or a quantity.",
  files: results,
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n", "utf8");

// NOTE ON THE PRINTED COUNTS, added 31 Oct 2026 because a reader tried to sum them and got 489 from 485.
// `summary.fragments` is the whole scanned population of quoted strings of >= 3 tokens — the phrase
// "carrying a line reference" in the sentence below is looser than the variable, and the string is kept
// byte-identical because `docs/` records past runs verbatim. The classes are mutually exclusive EXCEPT
// `DEFINED_TERM`, which is incremented inside the no-reference branch and is therefore a SUBSET of
// `NO_LINE_REF`. The identity that holds is:
//     VERIFIED + SELF_RECORDING + PROJECT_RECORD + NO_LINE_REF == fragments   (425 + 10 + 9 + 41 = 485)
// and adding DEFINED_TERM to that sum double-counts. Line 41's "(of which 0 are verbatim requirement
// text)" is `uncitedVerbatim`, the only no-reference class that is actionable.
console.log(
  `scanned ${summary.files} docs/ markdown files, ${summary.fragments} quoted fragments carrying a line reference (skipped ${summary.unmatched} quoted strings shorter than 3 tokens)`,
);
console.log(
  `VERIFIED ${summary.verified} | LINE_OFF ${summary.drifted} | LINE_OFF_OTHER_SOURCE ${summary.driftedOtherSource} | SELF_RECORDING ${summary.selfRecording} | PROJECT_RECORD ${summary.projectRecord} | DEFINED_TERM ${summary.definedTerm} | NOT_FOUND ${summary.notFound} | NO_LINE_REF ${summary.noReference} (of which ${summary.uncitedVerbatim} are verbatim requirement text with no citation)`,
);
// The H-8 population, reported apart because it is a different kind of count: these are references,
// not quotations, and `summary.fragments` does not include them. Do not add the two sums together.
console.log(
  `BARE REFERENCES (no quotation on the line): ${summary.bareRefs} checked, ${summary.bareRefDefects} defect(s) ` +
    `[${results.reduce((a, r) => a + r.counts.ref_ok, 0)} resolve]`,
);
for (const r of results) {
  const bad = r.checks.filter(
    (x) =>
      x.status === "LINE_OFF" ||
      x.status === "LINE_OFF_OTHER_SOURCE" ||
      x.status === "NOT_FOUND",
  );
  if (!bad.length) continue;
  console.log(
    `\n${r.file}: VERIFIED ${r.counts.verified} | LINE_OFF ${r.counts.drifted} | OTHER_SRC ${r.counts.drifted_other_source} | NOT_FOUND ${r.counts.notFound} | SELF_REC ${r.counts.self_recording} | NO_REF ${r.counts.noReference}`,
  );
  for (const chk of bad) {
    console.log(
      `  [${chk.status}] doc:${chk.docLine} cited ${chk.cited}${chk.actual ? " actual " + chk.actual : ""} in ${chk.source ?? "-"} :: "${chk.fragment}"`,
    );
  }
}
for (const r of results) {
  const uncited = r.checks.filter(
    (x) => x.status === "NO_LINE_REFERENCE" && x.verbatimIn?.length,
  );
  if (!uncited.length) continue;
  console.log(
    `\n${r.file}: ${uncited.length} quotation(s) are verbatim requirement text but carry no line reference`,
  );
  for (const chk of uncited)
    console.log(
      `  doc:${chk.docLine} ${chk.verbatimIn.join(", ")} :: "${chk.fragment}"`,
    );
}
for (const r of results) {
  if (!r.refChecks.length) continue;
  console.log(
    `\n${r.file}: ${r.refChecks.length} reference(s) with no quotation that do not resolve as written`,
  );
  for (const chk of r.refChecks) {
    console.log(
      `  [${chk.status}] doc:${chk.docLine} "${chk.citation}" — ${chk.detail}`,
    );
  }
}

// ── the verdict ───────────────────────────────────────────────────────────────
// Until H-8 this script had exactly one failure path: a single early `process.exitCode = 1` for an
// unresolved MASTER_SPECIFICATION.md boundary. Nothing else could make it fail. A run that printed
// "LINE_OFF 3" or "NOT_FOUND 2" still exited 0, so `node scripts/verify-citations.mjs` in CI reported
// success on a document set the tool itself had just declared untrustworthy — the finding existed and
// the gate did not. Exit 1 is now reserved for the classes this tool treats as defects:
//
//   LINE_OFF · LINE_OFF_OTHER_SOURCE · NOT_FOUND     — a quotation not where it says it is
//   uncitedVerbatim                                  — verbatim requirement text with no citation
//   REF_*                                            — a bare reference that does not resolve
//   boundary unresolved                              — the spec-copy guard (unchanged)
//
// and NOT for SELF_RECORDING, PROJECT_RECORD, DEFINED_TERM or NO_LINE_REFERENCE, which are declared
// classes rather than defects in the header: legitimate quotations of this repository's own registers,
// and controlled-vocabulary labels whose anchor was cited once. Making those fail would train the next
// engineer to reach for `|| true`.
const actionable = [];
for (const r of results) {
  for (const chk of r.checks) {
    if (
      chk.status === "LINE_OFF" ||
      chk.status === "LINE_OFF_OTHER_SOURCE" ||
      chk.status === "NOT_FOUND"
    )
      actionable.push(`${r.file}:${chk.docLine} ${chk.status}`);
    if (chk.status === "NO_LINE_REFERENCE" && chk.verbatimIn?.length)
      actionable.push(`${r.file}:${chk.docLine} uncited verbatim`);
  }
  for (const chk of r.refChecks)
    actionable.push(`${r.file}:${chk.docLine} ${chk.status}`);
}
console.log(`\nwrote docs/CITATION_VERIFICATION.json`);
if (actionable.length) {
  console.log(
    `CITATION GATE FAILED: ${actionable.length} actionable defect(s) (exit 1)`,
  );
  process.exitCode = 1;
} else {
  console.log(
    "CITATION GATE PASSED: every quotation is where its line reference says, and every bare reference resolves",
  );
}
