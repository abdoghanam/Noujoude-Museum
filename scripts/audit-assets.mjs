#!/usr/bin/env node
/**
 * Noujoude — Phase 0 physical asset audit.
 *
 * Produces docs/ASSET_INVENTORY_AUDIT.csv exactly as required by
 *   reference/Noujoude_Asset_and_Brand_Requirements_EN.md §10
 * with one row per catalog entry from
 *   reference/Noujoude_Master_Specification_EN.md Appendix A (A.2-A.8).
 *
 * READ-ONLY with respect to reference/ and Noujoude.photo/.
 * It never writes into either directory. Only docs/ output is written.
 *
 * Usage:  node scripts/audit-assets.mjs [--root <workspace>]
 * No third-party dependencies: image dimensions come from container headers.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import path from "node:path";
import { parseCsv } from "./lib/csv.mjs";
import { sniffFormat, readDimensions } from "./lib/image-signature.mjs";
import { declarationMismatch } from "./lib/asset-declarations.mjs";
import "./lib/ts-module-hooks.mjs";

// Resolved after the alias hook above has run, so the audit can ask the usage map the one question it owns:
// "does a §4.2 route carry this asset's declared surfaces?" Restating the surface table in JavaScript here is
// the H-7 shape — two implementations that agree until one is edited — and this column has already shipped a
// stale literal once.
const { describeUsage } = await import("@/lib/media/usage-map");
const derivativeStoreModule = await import(
  "@/lib/server/media/derivative-store"
);

// ---------------------------------------------------------------- paths

const ROOT = path.resolve(
  process.argv.indexOf("--root") >= 0
    ? process.argv[process.argv.indexOf("--root") + 1]
    : process.cwd(),
);

const SPEC_MD = path.join(
  ROOT,
  "reference",
  "Noujoude_Master_Specification_EN.md",
);
const PHOTOS = path.join(ROOT, "Noujoude.photo");
const AI_MANIF = path.join(
  PHOTOS,
  "_pending_review_AI_generated",
  "_manifest.json",
);
const OUT_DIR = path.join(ROOT, "docs");
const OUT_CSV = path.join(OUT_DIR, "ASSET_INVENTORY_AUDIT.csv");
const OUT_JSON = path.join(OUT_DIR, "asset-audit-summary.json");

// Asset ID scheme is NOT defined by the specification (A.10 requires an
// "Asset ID" field but never assigns values). Assigned here deterministically
// by catalog order and documented in docs/ARCHITECTURE.md.
const ASSET_ID_PREFIX = "NDM-AST";

// ------------------------------------------------------------ utilities

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const md5 = (buf) => createHash("md5").update(buf).digest("hex");

const csvCell = (v) => {
  const s = v === null || v === undefined ? "" : String(v);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// ---------------------------------------------------------- governance input
/*
 * Until 4 November 2026 this script wrote three columns from a constant: `UNKNOWN — no rights statement
 * supplied in reference/`, `Not Approved — no approval record supplied`, `Not Recorded`. Those were the
 * truth of the workspace then, and the script was right to refuse to guess. They are no longer the truth,
 * because the Owner supplied a declaration.
 *
 * The Owner's Master Autonomous Completion Mandate of 4 November 2026, §2, states: "The Owner authorizes
 * the use of photographs, images, graphics, logos, design materials, and fonts that the Owner has supplied
 * or explicitly identified as owned by the Owner. Treat the Owner's explicit ownership declaration as
 * authorization to use those identified materials in this project."
 *
 * That is permission to *use*, and nothing more. So the governance overlay below is read from
 * docs/asset-governance/, where the declaration, its scope, its exclusions and its limits are recorded as
 * data a reviewer can check — not inferred by this script from the fact that a file exists. A row that the
 * overlay does not name keeps the old denial cells, unchanged, which is why `gift_boutique.webp` and the
 * other reference-only images can be cleared for use and still not be presented as holdings.
 *
 * Absent overlay files are not an error: the audit degrades to exactly what it wrote before, because a
 * missing governance record is a statement that nothing has been authorised.
 */
const GOVERNANCE_DIR = path.join(OUT_DIR, "asset-governance");

function readGovernance(file) {
  try {
    return JSON.parse(readFileSync(path.join(GOVERNANCE_DIR, file), "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw new Error(
      `audit-assets: ${file} is present but unreadable — ${error.message}`,
      { cause: error },
    );
  }
}

const AUTHORIZATION = readGovernance("owner-authorization.json");
const PUBLICATION = readGovernance("publication-register.json");
const LABELS = readGovernance("descriptive-labels.json");

/** filename → the rights/approval statements the Owner's declaration supports. */
const AUTHORIZED = new Map(
  (AUTHORIZATION?.assets ?? []).map((filename) => [
    filename.toLowerCase(),
    AUTHORIZATION.generatedBy?.includes(filename)
      ? AUTHORIZATION.statements.generated
      : AUTHORIZATION.statements.library,
  ]),
);

/** filename → the surfaces this project actually publishes it on, per the publication register. */
const PUBLISHED = new Map(
  (PUBLICATION?.entries ?? []).map((entry) => [
    entry.filename.toLowerCase(),
    entry,
  ]),
);

/** filename → authored alt text in both locales. */
const LABELLED = new Map(
  (LABELS?.labels ?? []).map((entry) => [entry.file.toLowerCase(), entry]),
);

/**
 * The `Actual Usage` cell, in three states that §13.3 refuses to collapse.
 *
 * Published (the register names it, with a date and the paths), cleared-but-unused (the map binds it and the
 * publication register does not name it — `Approved but Unused`, a real state the baseline enumerates), and
 * not-bound (no §4.2 route carries it, which is a fact about the baseline rather than a deferral). The last two
 * are `describeUsage`'s own words, so this column and the module that decides placement cannot disagree.
 */
function actualUsageCell(filename, surfaces) {
  const published = PUBLISHED.get(filename.toLowerCase());
  if (published)
    return `${AUTHORIZATION.publication.actualUsage} — ${published.publishedAt} on ${published.paths.join(", ")}`;
  const usage = describeUsage(surfaces);
  if (usage.state === "bound")
    return `Not published — ${usage.text} is where the usage map binds it; docs/asset-governance/publication-register.json names no entry, which is the Approved-but-unused state, not a missing permission`;
  return usage.text;
}

/**
 * The `Derivative Status` cell, read from the lineage record rather than asserted.
 *
 * Until 4 November 2026 this column carried a literal about what the *delivered* file is — true of the ten
 * generated webps, and the only sentence the generator could write when no derivative had ever been produced.
 * Now a derivative can exist, so the cell has to say which of the two facts it is reporting. It reports both:
 * what was delivered, and whether `media-derivatives/lineage.json` records an optimised render of it.
 *
 * The lineage file is read as the store reads it — `src/lib/server/media/derivative-store.ts` owns the path —
 * so a manifest that has moved on disk is reflected here rather than cached, and a malformed one fails the
 * audit the same way it fails a request instead of being reported as "no derivatives".
 */
const LINEAGE = (() => {
  const { readDerivativeManifestSource } = derivativeStoreModule;
  const { manifest } = readDerivativeManifestSource(ROOT);
  const byAsset = new Map();
  for (const row of manifest?.derivatives ?? []) byAsset.set(row.assetId, row);
  return byAsset;
})();

// The store path is recorded with forward slashes on every platform, because this cell lands in a CSV that
// developers and tools on three operating systems read, and `path.join` gives a Windows separator to nobody's
// benefit.
const derivativeStoreNote = derivativeStoreModule.DERIVATIVE_MANIFEST_PATH.split(
  path.sep,
).join("/");

function derivativeStatusCell(assetId, isGenerated) {
  const delivered = isGenerated
    ? "Delivered file is itself a DERIVATIVE (webp) from a PNG original that is not retained"
    : "Delivered file is the Original";
  const row = LINEAGE.get(assetId);
  if (row === undefined)
    return `${delivered}; no optimised render is recorded in ${derivativeStoreNote}`;
  return `${delivered}; optimised render ${row.file} (${row.profile}, ${String(row.width)}x${String(row.height)}, ${row.mime}, sha-256 ${row.sha256.slice(0, 12)}…) recorded in ${derivativeStoreNote}`;
}


function parseCatalog() {
  const md = readFileSync(SPEC_MD, "utf8").split(/\r?\n/);
  const start = md.findIndex((l) => l.startsWith("# Appendix A"));
  const end = md.findIndex((l) => l.startsWith("# Appendix B"));
  if (start < 0 || end < 0)
    throw new Error("Appendix A boundaries not found in Master Specification.");

  const catalog = [];
  let category = null;
  const chunkHeaders = new Map(); // for A.8 subsections

  for (let i = start; i < end; i++) {
    const line = md[i];
    // "## A.2 Brand Identity Assets — 12"  /  "### A.8.1 Country World Hero Assets — 6"
    const h = line.match(
      /^#{2,3}\s+(A\.\d+(?:\.\d+)?)\s+(.+?)\s+—\s+(\d+)\s*$/,
    );
    if (h) {
      category = { id: h[1], name: h[2], expected: Number(h[3]) };
      chunkHeaders.set(category.id, category);
      continue;
    }
    const row = line.match(
      /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*$/,
    );
    if (row && category) {
      catalog.push({
        assetId: `${ASSET_ID_PREFIX}-${String(catalog.length + 1).padStart(3, "0")}`,
        filename: row[2].trim(),
        sourceLineRef: row[1],
        role: row[3].trim(),
        association: row[4].trim(),
        category: `${category.id} ${category.name}`,
        categoryId: category.id,
        isAdditional: category.id.startsWith("A.8"),
      });
    }
  }
  const perCategory = {};
  for (const c of catalog)
    perCategory[c.categoryId] = (perCategory[c.categoryId] || 0) + 1;
  return { catalog, perCategory, chunks: chunkHeaders };
}

// ----------------------------------------------- physical filesystem scan

function walk(dir, rel = "") {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(abs, r));
    else if (entry.isFile()) out.push({ abs, rel: r });
  }
  return out;
}

function physicalIndex() {
  const files = walk(PHOTOS);
  const byName = new Map();
  const records = [];
  for (const f of files) {
    const buf = readFileSync(f.abs);
    const mime = sniffFormat(buf);
    const dims = mime ? readDimensions(buf, mime) : null;
    const rec = {
      rel: f.rel,
      abs: f.abs.replace(/\\/g, "/"),
      bytes: buf.length,
      sha256: sha256(buf),
      md5: md5(buf),
      mime,
      width: dims ? dims.width : null,
      height: dims ? dims.height : null,
    };
    records.push(rec);
    if (!byName.has(f.rel)) byName.set(f.rel, []);
    byName.get(f.rel).push(rec);
  }
  return { byName, records };
}

// ------------------------------------------------------------- AI manifest

function loadAiManifest() {
  try {
    const arr = JSON.parse(readFileSync(AI_MANIF, "utf8"));
    const m = new Map();
    for (const e of arr) m.set(e.file, e);
    return { map: m, present: true };
  } catch {
    return { map: new Map(), present: false };
  }
}

// --------------------------------- cross-check against the original source

/**
 * Appendix A's "Source line" column points at logical lines of the original
 * source document (`Pasted text(20261030-163919).txt`, 8,174 lines per
 * Appendix B.1) — that file is NOT supplied in reference/. The nearest
 * faithful surrogate is Noujoude_Line_by_Line_Traceability_EN.csv, whose
 * "Original Text (Preserved)" column carries the source line verbatim.
 * This check proves the catalog transcription against the original wording
 * rather than trusting the Markdown copy alone.
 */
const TRACE_CSV = path.join(
  ROOT,
  "reference",
  "Noujoude_Line_by_Line_Traceability_EN.csv",
);

function sourceLineIndex() {
  try {
    const rows = parseCsv(readFileSync(TRACE_CSV, "utf8"));
    const head = rows[0].map((h) => h.trim());
    const li = head.indexOf("Source Line");
    const ti = head.indexOf("Original Text (Preserved)");
    if (li < 0 || ti < 0)
      return { available: false, reason: "expected columns not found" };
    const map = new Map();
    for (let r = 1; r < rows.length; r++) {
      const n = Number((rows[r][li] || "").trim());
      if (!Number.isFinite(n)) continue;
      if (!map.has(n)) map.set(n, rows[r][ti] || "");
    }
    return { available: true, map, dataRows: rows.length - 1 };
  } catch (e) {
    return { available: false, reason: e.message };
  }
}

const trace = sourceLineIndex();
const sourceChecks = { verified: 0, mismatched: [], unavailable: [] };

// ------------------------------------------------------------------ audit

const { catalog, perCategory } = parseCatalog();
const { byName, records } = physicalIndex();
const ai = loadAiManifest();

// ------------------------------------------------------ usage column wording
// This column used to carry a hardcoded sentence — "None — no application code
// exists yet (src/ is empty)" — on all 82 rows. That sentence stopped being true on
// 2 November 2026, when the application was initialised under `src/`, and because the
// audit rewrote it on every run no document edit could repair it: the generator had to
// stop asserting a fact it never measured. The comment that replaced it ended with
// "If the register ever gains a usage column fed from the map, this note is the thing to
// delete." On 4 November 2026 it did: `actualUsageCell()` above asks `src/lib/media/
// usage-map.ts` where each asset's own declared surfaces are bound, and
// `docs/asset-governance/publication-register.json` for what has actually been published,
// so there is nothing left for a note to stand in for.
function surfacesOf(entry) {
  return String(entry.association ?? "")
    .split(",")
    .map((surface) => surface.trim())
    .filter((surface) => surface.length > 0);
}

const expectedCounts = {
  "A.2": 12,
  "A.3": 18,
  "A.4": 3,
  "A.5": 11,
  "A.6": 10,
  "A.7": 18,
  // A.8 "Additional Requested Assets — 10" is declared as 10 at the parent
  // heading but catalogued in two subsections; check the subsections.
  "A.8.1": 6,
  "A.8.2": 4,
};
const countDrift = Object.entries(expectedCounts)
  .filter(([id, n]) => (perCategory[id] || 0) !== n)
  .map(([id, n]) => `${id}: spec says ${n}, parsed ${perCategory[id] || 0}`);

const catalogNames = new Set(catalog.map((c) => c.filename.toLowerCase()));
const rows = [];
const problems = [];
const selfDeclarationMismatches = [];

for (const c of catalog) {
  const hits = byName.get(c.filename) || [];
  // case-insensitive fallback
  let used = hits;
  if (!used.length) {
    used = records.filter(
      (r) => r.rel.split("/").pop().toLowerCase() === c.filename.toLowerCase(),
    );
  }

  let status,
    actualPath = "",
    mime = null,
    width = "",
    height = "",
    bytes = "",
    sha = "";
  let chosen = null;
  const noteBits = [];

  if (!used.length) {
    status = "MISSING";
  } else {
    const rootLevel = used.filter((r) => !r.rel.includes("/"));
    const nested = used.filter((r) => r.rel.includes("/"));
    const pick = rootLevel[0] || nested[0] || used[0];
    chosen = pick;
    status = "PRESENT";
    actualPath = pick.rel;
    mime = pick.mime;
    width = pick.width ?? "";
    height = pick.height ?? "";
    bytes = pick.bytes;
    sha = pick.sha256;

    if (rootLevel.length && nested.length) {
      status = "DUPLICATE";
      noteBits.push(
        `present both at root and at ${nested.map((n) => n.rel).join(", ")}`,
      );
    } else if (used.length > 1 && !rootLevel.length) {
      status = "DUPLICATE";
      noteBits.push(
        `${used.length} copies: ${used.map((u) => u.rel).join(", ")}`,
      );
    }
    if (!rootLevel.length && nested.length) {
      noteBits.push(
        "ONLY INSIDE _pending_review_AI_generated — not in the primary library folder",
      );
    }
    if (pick.bytes === 0) {
      status = "CORRUPT";
      noteBits.push("zero bytes");
    } else if (!mime) {
      status = "UNREADABLE";
      noteBits.push("magic bytes unrecognised");
    } else if (
      pick.width === null ||
      pick.width === undefined ||
      pick.width === ""
    ) {
      // Deliberately NOT marked CORRUPT: a healthy container with dimensions
      // this dependency-free tool cannot decode is not evidence of damage.
      // Claiming CORRUPT here would be an unverified assertion.
      noteBits.push(
        "dimensions not decoded by this tool — confirm with sharp at integration time",
      );
    } else {
      const ext = c.filename.split(".").pop().toLowerCase();
      const want = {
        webp: "image/webp",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        svg: "image/svg+xml",
      }[ext];
      if (want && mime !== want) {
        status = "WRONG_FORMAT";
        noteBits.push(`extension .${ext} but container is ${mime}`);
      }
    }
  }

  const isAi = ai.map.has(c.filename);
  // Filename self-declaration check: the catalog encodes size/ratio in the
  // name (_1024, _16x9, _4x3, _9x16, _1024x1536). A file that does not match
  // its own name is an integration risk and must be recorded, not ignored.
  if (chosen && chosen.width) {
    const mismatch = declarationMismatch(
      c.filename,
      chosen.width,
      chosen.height,
    );
    if (mismatch) {
      noteBits.push(`NAME/PIXEL MISMATCH — ${mismatch}`);
      selfDeclarationMismatches.push(
        `${c.assetId} ${c.filename} → ${mismatch}`,
      );
    }
  }
  if (isAi)
    noteBits.push(
      "AI-GENERATED per _manifest.json (ai_generated=true); never present as documentary photography",
    );
  if (
    isAi &&
    ai.map.get(c.filename).source_png &&
    !byName.has(ai.map.get(c.filename).source_png)
  ) {
    noteBits.push(
      `lineage broken: manifest names source PNG "${ai.map.get(c.filename).source_png}" which is absent from the workspace`,
    );
  }
  if (status === "MISSING")
    noteBits.push("do not generate silently; record as missing");

  // Verify the catalog entry against the original source wording, using the
  // line-by-line traceability CSV as the surrogate for the unsupplied source
  // txt. Kept out of the CSV column set (spec §10 fixes those 20 columns) and
  // recorded in Notes + the JSON summary instead.
  if (trace.available) {
    const ref = Number(c.sourceLineRef);
    const txt = trace.map.get(ref);
    if (txt === undefined) {
      sourceChecks.unavailable.push(
        `${c.assetId} ${c.filename}: no traceability row for source line ${ref}`,
      );
      noteBits.push(
        `SOURCE CHECK IMPOSSIBLE — traceability CSV has no row for source line ${ref}`,
      );
    } else if (txt.includes(c.filename)) {
      sourceChecks.verified++;
      noteBits.push(`source line ${ref} confirms this entry verbatim`);
    } else {
      sourceChecks.mismatched.push(
        `${c.assetId} ${c.filename}: source line ${ref} reads "${txt.slice(0, 120)}"`,
      );
      noteBits.push(
        `SOURCE MISMATCH — line ${ref} does not contain this filename`,
      );
    }
  } else {
    noteBits.push("source cross-check skipped: traceability CSV unreadable");
  }

  if (status !== "PRESENT")
    problems.push(`${c.assetId} ${c.filename} → ${status}`);

  const rightsStatement = AUTHORIZED.get(c.filename.toLowerCase())
    ? AUTHORIZED.get(c.filename.toLowerCase()).rightsStatus
    : isAi
      ? "Awaiting Rights Review"
      : "UNKNOWN — no rights statement supplied in reference/";

  const approvalStatement = AUTHORIZED.get(c.filename.toLowerCase())
    ? AUTHORIZED.get(c.filename.toLowerCase()).approval
    : "Not Approved — no approval record supplied";

  const label = LABELLED.get(c.filename.toLowerCase());
  const altTextStatus =
    label && label.en.trim() && label.ar.trim()
      ? "Recorded — EN and AR from docs/asset-governance/descriptive-labels.json"
      : "Not Recorded";

  rows.push([
    c.assetId,
    c.filename,
    c.category,
    status,
    actualPath,
    mime || "",
    width,
    height,
    bytes,
    sha,
    isAi
      ? "AI-generated (Qwen ImageGen tooling), generator recorded in _manifest.json"
      : "Not supplied in any reference document",
    rightsStatement,
    approvalStatement,
    `${c.role} | ${c.association}`,
    actualUsageCell(c.filename, surfacesOf(c)),
    derivativeStatusCell(c.assetId, isAi),
    altTextStatus,
    noteBits.join(" ; "),
    "scripts/audit-assets.mjs (automated physical verification)",
    new Date().toISOString().slice(0, 10),
  ]);
}

const uncatalogued = records.filter((r) => {
  const base = r.rel.split("/").pop();
  return !catalogNames.has(base.toLowerCase());
});

const COLS = [
  "Asset ID",
  "Filename",
  "Expected Category",
  "Physical Status",
  "Actual Path",
  "MIME Type",
  "Width",
  "Height",
  "File Size",
  "SHA-256",
  "Source/Creator",
  "Rights Status",
  "Brand/Curatorial Approval",
  "Intended Usage",
  "Actual Usage",
  "Derivative Status",
  "Alt Text Status",
  "Notes",
  "Verified By",
  "Verified Date",
];

const csv =
  [COLS, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";

const tally = {};
for (const r of rows) tally[r[3]] = (tally[r[3]] || 0) + 1;
const orig = rows.filter((r, i) => !catalog[i].isAdditional);
const addl = rows.filter((r, i) => catalog[i].isAdditional);

const summary = {
  generatedAt: new Date().toISOString(),
  tool: "scripts/audit-assets.mjs",
  workspaceRoot: ROOT.replace(/\\/g, "/"),
  catalogTotal: catalog.length,
  original72: {
    parsed: orig.length,
    present: orig.filter((r) => r[3] === "PRESENT").length,
    byStatus: countBy(orig),
  },
  additional10: {
    parsed: addl.length,
    present: addl.filter((r) => r[3] === "PRESENT").length,
    byStatus: countBy(addl),
  },
  perCategoryExpected: expectedCounts,
  perCategoryParsed: perCategory,
  catalogParseDrift: countDrift,
  physicalFileCount: records.length,
  physicalBytesTotal: records.reduce((a, r) => a + r.bytes, 0),
  uncataloguedFiles: uncatalogued.map((u) => ({
    path: u.rel,
    bytes: u.bytes,
    sha256: u.sha256,
    mime: u.mime,
  })),
  dimensionDecodeFailures: rows
    .filter((r) => r[3] === "PRESENT" && r[6] === "")
    .map((r) => ({ file: r[1], mime: r[5], bytes: Number(r[8]) })),
  namePixelMismatches: selfDeclarationMismatches,
  traceabilityCsv: trace.available
    ? {
        available: true,
        dataRows: trace.dataRows,
        distinctSourceLines: trace.map.size,
      }
    : { available: false, reason: trace.reason },
  sourceVerification: {
    verifiedAgainstSource: sourceChecks.verified,
    of: catalog.length,
    mismatched: sourceChecks.mismatched,
    unavailable: sourceChecks.unavailable,
  },
  systematicCatalogFinding:
    'Appendix A "Source line" values are locators into the original source document Pasted text(20261030-163919).txt (8,174 logical lines per Appendix B.1), which is NOT supplied in reference/. Line 3779 of the .md itself falls in Appendix G and is unrelated to the asset catalog, so .md line numbers must never be used to resolve those references.',
  problems,
};

function countBy(list) {
  const t = {};
  for (const r of list) t[r[3]] = (t[r[3]] || 0) + 1;
  return t;
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_CSV, csv, "utf8");
writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2), "utf8");

console.log(
  JSON.stringify(
    {
      catalogTotal: catalog.length,
      original72: summary.original72,
      additional10: summary.additional10,
      physicalFileCount: records.length,
      physicalBytesTotal: summary.physicalBytesTotal,
      uncatalogued: summary.uncataloguedFiles.map((u) => ({
        path: u.path,
        mime: u.mime,
        bytes: u.bytes,
      })),
      catalogParseDrift: countDrift,
      nonPresent: rows
        .filter((r) => r[3] !== "PRESENT")
        .map((r) => `${r[0]} ${r[1]} → ${r[3]}`),
      dimensionDecodeFailures: summary.dimensionDecodeFailures,
      namePixelMismatchCount: selfDeclarationMismatches.length,
      sourceVerification: {
        verifiedAgainstSource: sourceChecks.verified,
        of: catalog.length,
        mismatched: sourceChecks.mismatched.slice(0, 12),
        unavailable: sourceChecks.unavailable.slice(0, 12),
      },
      csv: OUT_CSV.replace(/\\/g, "/"),
    },
    null,
    2,
  ),
);
