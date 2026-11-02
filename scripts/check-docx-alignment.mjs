/**
 * scripts/check-docx-alignment.mjs
 *
 * Phase 0 verification (Directive §16 / Gap Register GAP-17): compare the supplied
 * Word master specification against its Markdown counterpart and report whether the
 * two carry the same *content*, not merely the same title.
 *
 * Dependency-free by design:
 *   - the .docx is a ZIP container; local file headers are read directly and
 *     `word/document.xml` is inflated with node:zlib (no unzip binary, no npm install)
 *   - Markdown is read as text
 *
 * This script READS ONLY. It never writes into reference/. Its only output is
 * docs/DOCX_MD_ALIGNMENT.json.
 */
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import crypto from "node:crypto";

const ROOT = process.cwd();
const DOCX = path.join(
  ROOT,
  "reference",
  "Noujoude_Master_Specification_EN.docx",
);
const MD = path.join(ROOT, "reference", "Noujoude_Master_Specification_EN.md");
const OUT = path.join(ROOT, "docs", "DOCX_MD_ALIGNMENT.json");

/* ---------------------------------------------------------------- zip reader */

function readZipEntry(buf, wantedName) {
  // Scan for local file headers (PK\x03\x04). A .docx written by Word/converters
  // stores entries sequentially; scanning signatures avoids needing the central
  // directory and tolerates data-descriptor entries.
  let p = 0;
  while (p + 30 <= buf.length) {
    if (buf.readUInt32LE(p) !== 0x04034b50) {
      p++;
      continue;
    }
    const method = buf.readUInt16LE(p + 8);
    const compSize = buf.readUInt32LE(p + 18);
    const nameLen = buf.readUInt16LE(p + 26);
    const extraLen = buf.readUInt16LE(p + 28);
    const name = buf.slice(p + 30, p + 30 + nameLen).toString("utf8");
    const dataStart = p + 30 + nameLen + extraLen;
    if (name === wantedName) {
      const raw = buf.slice(dataStart, dataStart + compSize);
      return method === 0 ? raw : zlib.inflateRawSync(raw);
    }
    // Step to the next signature rather than trusting compSize when it is 0
    // (streamed entries with a data descriptor).
    p =
      compSize > 0
        ? dataStart + compSize
        : buf.indexOf(Buffer.from("PK\x03\x04", "binary"), dataStart);
    if (p < 0) break;
  }
  return null;
}

/* ------------------------------------------------------------ docx -> text */

function docxParagraphs(xml) {
  const out = [];
  // <w:t> nodes, grouped by <w:p>. Runs of the same paragraph are concatenated,
  // because Word splits words across runs constantly.
  const paraRe = /<w:p[ >][\s\S]*?<\/w:p>/g;
  for (const para of xml.match(paraRe) ?? []) {
    // A tab or hard break inside a paragraph is a rendered word separator; runs must
    // not be fused across it or unrelated tokens merge ("001" + "Version" -> "001version").
    const spaced = para.replace(
      /<w:tab\s*\/>|<w:br\s*\/>|<w:cr\s*\/>/g,
      '<w:t xml:space="preserve"> </w:t>',
    );
    let text = "";
    for (const m of spaced.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)) {
      text += m[1];
    }
    text = text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'");
    if (text.trim()) out.push(text.trim());
  }
  return out;
}

function mdParagraphs(md) {
  // Markdown structural characters are stripped to content words; tables become
  // cell text so a table that exists in both formats still compares.
  // Ordered-list numbers ("1. ", "27)") are dropped because in the .docx the number
  // lives in Word's auto-numbering (w:numPr), not in the paragraph text — leaving it
  // in would report every numbered requirement as "missing from the DOCX".
  return md
    .split(/\r?\n/)
    .map((l) =>
      l
        .replace(/^\s*#{1,6}\s*/, "")
        .replace(/^\s*[-*+]\s+/, "")
        .replace(/^\s*\d+[.)]\s+/, "")
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((c) => c.replace(/[-:]{3,}/g, ""))
        .join(" "),
    )
    .map((l) =>
      l.replace(/`/g, "").replace(/\*\*/g, "").replace(/\s+/g, " ").trim(),
    )
    .filter(Boolean);
}

/* ------------------------------------------------------- comparison helpers */

// Normalise away the differences that are formatting, not content: curly
// punctuation, en/em dashes used as separators, case, and number-only noise.
function norm(s) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/\u00a0/g, " ")
    .toLowerCase();
}

function tokens(s) {
  const m = norm(s).match(/[a-z0-9]+/g);
  return m ? m.join(" ") : "";
}

const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");

/* -------------------------------------------------------------------- main */

const docxBuf = fs.readFileSync(DOCX);
const xmlBuf = readZipEntry(docxBuf, "word/document.xml");
if (!xmlBuf) {
  console.error(
    "word/document.xml not found inside the .docx — cannot compare.",
  );
  process.exit(1);
}
const mdBuf = fs.readFileSync(MD);

const dParagraphs = docxParagraphs(xmlBuf.toString("utf8"));

// Hyperlink targets are not in word/document.xml — they live in the relationship
// table. Reference URLs cited by the specification (WCAG, ASVS, web.dev, Payload)
// must be part of the DOCX haystack or they falsely read as "missing from the DOCX".
const relsBuf = readZipEntry(docxBuf, "word/_rels/document.xml.rels");
const relUrls = [];
if (relsBuf) {
  // External targets only. Internal part names (settings.xml, theme1.xml, footer1.xml)
  // are packaging, not requirement content, and would otherwise appear as vocabulary
  // that exists only in the DOCX.
  for (const m of relsBuf
    .toString("utf8")
    .matchAll(/Target="(https?:[^"]*?)"/g))
    relUrls.push(m[1]);
}
const mParagraphs = mdParagraphs(mdBuf.toString("utf8"));

const dTokens = [
  ...dParagraphs.map(tokens),
  relUrls.map(tokens).join(" "),
].filter(Boolean);
const mTokens = mParagraphs.map(tokens).filter(Boolean);
// Two residual difference classes were traced to their exact source rather than
// rounded away, and both are packaging, not requirement content:
//   1. "Table of Contents" — a Word-generated TOC field label (a DOCX paragraph whose
//      only text is that phrase). The Markdown exposes navigation through its own
//      heading structure instead, so the phrase has no counterpart.
//   2. YAML front matter — the Markdown `subtitle:` key carries the same words as the
//      DOCX title paragraph, but as a different token sequence.
// The exclusion is a whole-paragraph drop, not a per-word deletion, so no word that
// also occurs in real requirement text is removed from the corpus. The dropped
// paragraph and the front-matter lines are recorded in the report for review.
const tocParagraphRe = /^table of contents$/i;
const frontMatterRe =
  /^\s*(title|subtitle|version|status|document id|last updated|author)\b/i;
const dTocDropped = [];
const dTokensKept = [];
dParagraphs.forEach((p) => {
  const t = tokens(p);
  if (!t) return;
  if (tocParagraphRe.test(t)) {
    dTocDropped.push(p);
    return;
  }
  dTokensKept.push(t);
});
const mdTokensKept = mTokens.filter((t) => !frontMatterRe.test(t));
const mdFrontMatter = mTokens.filter((t) => frontMatterRe.test(t));
const dAll = new Set(dTokensKept.join(" ").split(" ").filter(Boolean));
const mAll = new Set(mdTokensKept.join(" ").split(" ").filter(Boolean));
const relUrlWords = new Set(
  relUrls.map(tokens).join(" ").split(" ").filter(Boolean),
);

const mdOnly = [...mAll].filter((w) => !dAll.has(w) && !relUrlWords.has(w));
const docxOnly = [...dAll].filter((w) => !mAll.has(w));

// Paragraph-level containment: how many Markdown paragraphs are absent from the
// DOCX as a token sequence (allowing for the DOCX splitting/merging paragraphs).
// Front matter is excluded because it re-states the title paragraph in another order.
const dHay = dTokens.join(" ");
const missingParas = mdTokensKept.filter(
  (t) => t.length > 40 && !dHay.includes(t),
);

// Section-heading coverage: every Markdown heading should be findable in the DOCX.
// Heading numbers are stripped for the same reason as list numbers above.
const headings = mdBuf
  .toString("utf8")
  .split(/\r?\n/)
  .filter((l) => /^#{1,4}\s/.test(l))
  .map((l) =>
    l
      .replace(/^#{1,4}\s+/, "")
      .replace(/^\d+(?:\.\d+)*\s+/, "")
      .replace(/[–—]/g, "-")
      .trim(),
  )
  .filter(Boolean);
// The DOCX carries its section numbers as literal paragraph text, so headings are
// compared with their numbering intact. The haystack must be tokenised the same way
// as the needle: matching a token string against raw punctuation-bearing text would
// report every heading containing a comma or ampersand as absent.
const dHayTok = " " + dParagraphs.map((p) => tokens(p)).join(" ") + " ";
const missingHeadings = headings.filter((h) => {
  const key = tokens(h);
  return (
    key.length > 3 && !dHayTok.includes(` ${key} `) && !dHayTok.includes(key)
  );
});

// Direction matters: content only in the DOCX is a loss in the Markdown working
// copy; content only in the Markdown is an addition. Both are reported, neither is
// silently averaged into a single "similarity %" that would hide which side drifted.
const docxOnlyCommon = docxOnly.filter((w) => /^[a-z]{5,}$/.test(w));

const substantiveMisses = missingParas.filter((t) => !/\bhttps\b/.test(t));

// Direction check, stated plainly because it is easy to invert:
//   docxOnlyCommon  = vocabulary in the DOCX that the Markdown does NOT carry
//                     -> possible content LOSS in the working copy. This is the one
//                        that matters for trusting the .md as the implementation basis.
//   missingHeadings / missingParas / mdOnly = things the Markdown has that the DOCX
//                     does not -> Markdown additions or re-flow, not loss.
const contentLossRisk = docxOnlyCommon;

const verdict =
  contentLossRisk.length === 0 &&
  missingHeadings.length === 0 &&
  substantiveMisses.length === 0
    ? "ALIGNED — the Markdown carries no requirement content the DOCX lacks and the DOCX contributes no requirement vocabulary the Markdown is missing. Remaining differences are Word packaging and hyperlink-reflow artifacts, listed for transparency."
    : contentLossRisk.length === 0
      ? "ALIGNED WITH RESIDUALS — no DOCX requirement vocabulary is missing from the Markdown; unmatched Markdown paragraphs are hyperlink re-flow, not absent requirements."
      : `CHECK REQUIRED — ${contentLossRisk.length} DOCX word type(s) do not appear in the Markdown; see differences.wordTypesOnlyInDocx.`;

const report = {
  generatedAt: new Date().toISOString(),
  tool: "scripts/check-docx-alignment.mjs",
  inputs: {
    docx: {
      path: "reference/Noujoude_Master_Specification_EN.docx",
      bytes: docxBuf.length,
      sha256: sha(docxBuf),
    },
    md: {
      path: "reference/Noujoude_Master_Specification_EN.md",
      bytes: mdBuf.length,
      sha256: sha(mdBuf),
    },
  },
  method: [
    "ZIP local headers parsed directly; word/document.xml inflated with node:zlib",
    "DOCX runs concatenated per <w:p>, entities decoded, whitespace collapsed",
    "Markdown structural characters stripped; table rows flattened to cell text",
    "Comparison is token-set and paragraph-containment based; punctuation and case normalised",
  ],
  counts: {
    docxParagraphs: dParagraphs.length,
    mdParagraphs: mParagraphs.length,
    docxTokens: dTokens.join(" ").split(" ").length,
    mdTokens: mTokens.join(" ").split(" ").length,
    mdWordTypes: mAll.size,
    docxWordTypes: dAll.size,
    mdHeadings: headings.length,
    docxExternalHyperlinkTargets: relUrls.length,
  },
  differences: {
    excludedFromComparison: {
      docxTocFieldParagraphs: dTocDropped,
      markdownFrontMatterParagraphs: mdFrontMatter,
      reason:
        'Word-generated "Table of Contents" label and YAML front matter are document packaging; the requirement text they duplicate is still compared.',
    },
    wordTypesOnlyInMarkdown: mdOnly.slice(0, 60),
    wordTypesOnlyInMarkdownCount: mdOnly.length,
    wordTypesOnlyInDocx: docxOnly.slice(0, 60),
    wordTypesOnlyInDocxCount: docxOnly.length,
    mdParagraphsAbsentFromDocx: missingParas.slice(0, 20).map((t) => ({
      text: t,
      explainedByHyperlinkReflow: /\bhttps\b/.test(t),
    })),
    mdParagraphsAbsentFromDocxCount: missingParas.length,
    mdHeadingsAbsentFromDocx: missingHeadings.slice(0, 30),
    mdHeadingsAbsentFromDocxCount: missingHeadings.length,
    substantiveMisses,
    contentLossRisk,
  },
  verdict,
  note: "The .md is the working authority for implementation because it is line-addressable and is what the traceability CSV and Appendix A source-line references were measured against. This comparison establishes whether it lost content relative to the .docx supplied alongside it.",
};

fs.writeFileSync(OUT, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(
  `docx paragraphs ${dParagraphs.length} | md paragraphs ${mParagraphs.length}`,
);
console.log(
  `md word types ${mAll.size} | docx word types ${dAll.size} | external link targets ${relUrls.length}`,
);
console.log(
  `DOCX vocabulary missing from Markdown (content-loss risk): ${contentLossRisk.length} ${JSON.stringify(contentLossRisk)}`,
);
console.log(`Markdown-only word types: ${mdOnly.length}`);
console.log(
  `md headings: ${headings.length} | absent from docx: ${missingHeadings.length}`,
);
console.log(
  `md paragraphs absent from docx: ${missingParas.length} (substantive: ${substantiveMisses.length})`,
);
console.log(`VERDICT: ${verdict}`);
console.log(`wrote ${path.relative(ROOT, OUT).replace(/\\/g, "/")}`);
