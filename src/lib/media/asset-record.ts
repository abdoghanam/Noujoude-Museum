/**
 * src/lib/media/asset-record.ts — the audit row, read as a governance record.
 *
 * `docs/ASSET_INVENTORY_AUDIT.csv` is the delivered physical inventory of the 82 catalogued assets:
 * one row per asset, 20 columns, produced by `scripts/audit-assets.mjs`. Until now nothing in the
 * application could read it, which is why `src/app/[locale]/layout.tsx` states the rights position as
 * a sentence in a footer. This module turns the row into the typed decision `src/domain/rights.ts`
 * consumes, so the footer sentence becomes an enforced branch instead of a claim.
 *
 * Two rules decide the shape of this file.
 *
 * 1. **Rights and approval are separate dimensions, and existence is neither of them.** A.9 requires
 *    that "referenced, present, rights-cleared, approved, optimized, integrated, and verified are
 *    different states" and §23 bars a file in a library from counting as cleared. So `physicalStatus`
 *    is carried as its own field and never consulted by `toMediaRecord()`.
 * 2. **Unmapped text denies; it does not allow.** Every status string in the CSV is mapped through an
 *    explicit vocabulary. A string the map does not know returns the most restrictive value the type
 *    can express, because a parser that defaults to permissive is a gate with a hole cut in it. This
 *    mirrors `decidePublicServing`, where an unrecognised state denies rather than allows.
 */

import type { CuratorialApproval, MediaRecord, RightsState } from "@/domain/rights";

/** The allowed `Physical Status` values, verbatim from the asset requirements' audit deliverable. */
export const PHYSICAL_STATUSES = [
  "PRESENT",
  "MISSING",
  "DUPLICATE",
  "WRONG_FORMAT",
  "CORRUPT",
  "UNREADABLE",
  "NOT_APPLICABLE",
] as const;

export type PhysicalStatus = (typeof PHYSICAL_STATUSES)[number];

/** The 20 delivered columns, in order. A row that does not match this header is a parse failure. */
export const AUDIT_COLUMNS = [
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
] as const;

export interface AssetRecord extends MediaRecord {
  readonly assetId: string;
  readonly filename: string;
  readonly category: string;
  readonly physicalStatus: PhysicalStatus;
  /** Path relative to `Noujoude.photo/`, as the audit recorded it. */
  readonly libraryPath: string;
  readonly mime: string;
  /** Decoded from the container, never inferred from the name. */
  readonly width: number;
  readonly height: number;
  readonly bytes: number;
  readonly checksum: string;
  readonly sourceCreator: string;
  readonly rightsStatement: string;
  readonly approvalStatement: string;
  /** The `role | surfaces` shape the Appendix A catalog carries in `Intended Usage`. */
  readonly role: string;
  readonly surfaces: readonly string[];
  readonly usageStatement: string;
  readonly derivativeStatus: string;
  readonly altTextStatus: string;
  readonly notes: string;
  /** Non-null when the filename self-declares a size the measured pixels contradict (R-04). */
  readonly declaration: string | null;
}

/** Raised when the register itself is unreadable, so a page cannot render a half-parsed inventory. */
export class AssetRegistryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AssetRegistryError";
  }
}

/**
 * The wording-to-state vocabulary, supplied explicitly rather than read from module constants.
 *
 * Four questions decide a register row: is the rights statement cleared, is it pending review, is the
 * curatorial approval granted, and has the asset been published. Each one used to be answered by a
 * constant in this file, which made the evaluator untestable in the only way that matters — a test could
 * check what the production vocabulary says, but could not check what the *evaluation* does when a
 * vocabulary is armed, because arming it meant editing this file.
 *
 * `PRODUCTION_RIGHTS_VOCABULARY` is the same three empty whitelists and the same one pending statement,
 * gathered into one value that is passed by default. Every production caller — `readAssetRegister`, the
 * audit, the preflight gate, the HTTP path — resolves it exactly as before, and an armed vocabulary exists
 * only inside a test fixture that names it. The lists stay whitelists rather than heuristics: a future
 * row reads as cleared only when a human writes a marker into the production value in advance, which is a
 * visible edit and not an accident of string matching.
 */
export interface RightsVocabulary {
  /** `Rights Status` prefixes that mean cleared. Empty in production. */
  readonly clearedMarkers: readonly string[];
  /** Exact `Rights Status` values that mean a human is reviewing this now. */
  readonly pendingStatements: readonly string[];
  /** `Brand/Curatorial Approval` prefixes that mean granted. Empty in production. */
  readonly grantedApprovalMarkers: readonly string[];
  /** `Actual Usage` prefixes that mean a publication transaction exists. Empty in production. */
  readonly publishedMarkers: readonly string[];
}

/** Rights statements that count as cleared. **Deliberately empty.** */
const CLEARED_RIGHTS_MARKERS: readonly string[] = [];

/** The one statement that means "a human is looking at this", per §13.3's state name. */
const PENDING_RIGHTS_STATEMENTS: readonly string[] = ["Awaiting Rights Review"];

/** Approval markers that count as granted. **Also deliberately empty.** All 82 rows carry `Not Approved — no approval record supplied`, and the brand marks are gated by OID-18. */
const GRANTED_APPROVAL_MARKERS: readonly string[] = [];

/** Publication markers. **Empty, because no publication transaction exists yet**: no `MediaAsset` collection, no publish route, no record with a publish date. */
const PUBLISHED_MARKERS: readonly string[] = [];

/**
 * What production honours. The three whitelists are empty by decision, and §23 bars a file in a library
 * from counting as cleared, so nothing a row can say on its own is evidence of a right or an approval.
 * A test that needs armed lists passes its own `RightsVocabulary`; it does not edit this one.
 */
export const PRODUCTION_RIGHTS_VOCABULARY: RightsVocabulary = {
  clearedMarkers: CLEARED_RIGHTS_MARKERS,
  grantedApprovalMarkers: GRANTED_APPROVAL_MARKERS,
  pendingStatements: PENDING_RIGHTS_STATEMENTS,
  publishedMarkers: PUBLISHED_MARKERS,
};

export function rightsStateFrom(
  statement: string,
  policy: RightsVocabulary = PRODUCTION_RIGHTS_VOCABULARY,
): RightsState {
  const value = statement.trim();
  if (policy.clearedMarkers.some((marker) => value.startsWith(marker))) {
    return "cleared";
  }
  if (policy.pendingStatements.some((s) => value === s)) return "pending";
  return "unknown";
}

/**
 * `unknown` is returned for anything unrecognised: absence of a record is not a grant, and it is not a
 * plain "no" either — it is unrecorded, which the gate treats the same way (deny) while the register keeps
 * the distinction the audit insists on.
 */
export function approvalFrom(
  statement: string,
  policy: RightsVocabulary = PRODUCTION_RIGHTS_VOCABULARY,
): CuratorialApproval {
  const value = statement.trim();
  if (policy.grantedApprovalMarkers.some((marker) => value.startsWith(marker))) {
    return "approved";
  }
  if (value.startsWith("Not Approved")) return "not_approved";
  return "unknown";
}

/**
 * Publication is a server-side transaction that does not exist yet, so the production vocabulary has no
 * marker for it and every row answers `false`. It is a function over the vocabulary rather than a literal
 * so that the day a publication register exists, the place that changed is named — and so a test can
 * establish that the *evaluation* works without anyone arming the production list.
 */
export function publishedFrom(
  statement: string,
  policy: RightsVocabulary = PRODUCTION_RIGHTS_VOCABULARY,
): boolean {
  const value = statement.trim();
  return policy.publishedMarkers.some((marker) => value.startsWith(marker));
}

/** Split the catalog's `role | surfaces` convention into its two parts. */
export function parseIntendedUsage(usage: string): {
  role: string;
  surfaces: readonly string[];
} {
  const [role, surfaces] = usage.split("|");
  return {
    role: (role ?? usage).trim(),
    surfaces: (surfaces ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0),
  };
}

function requiredColumn(header: readonly string[], name: string): number {
  const index = header.indexOf(name);
  if (index === -1) {
    throw new AssetRegistryError(
      `the asset register has no "${name}" column; refusing to read a header it does not know`,
    );
  }
  return index;
}

function positiveInteger(raw: string, field: string, assetId: string): number {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new AssetRegistryError(
      `${assetId}: ${field} is "${raw}", which is not a positive integer — the register is malformed`,
    );
  }
  return value;
}

function physicalStatusFrom(raw: string, assetId: string): PhysicalStatus {
  const known: readonly string[] = PHYSICAL_STATUSES;
  if (!known.includes(raw)) {
    // A status outside the delivered vocabulary is a register defect, not a judgement call: guessing
    // "PRESENT" for an unparseable value would make an unreadable row look like a verified one.
    throw new AssetRegistryError(
      `${assetId}: Physical Status "${raw}" is outside the allowed set`,
    );
  }
  return raw as PhysicalStatus;
}

/**
 * Turn register rows into records.
 *
 * This function takes cells, not text, and that is the whole design decision. The repository has one
 * CSV reader — `scripts/lib/csv.mjs` — shared by the audit, the preflight gate and the media registry,
 * because H-7 was a second parser whose regex dropped empty cells and shifted every later column left.
 * A third parser here, even a correct one, is the shape that defect took: two implementations that
 * agree today drift the day one of them is edited. So the register is parsed once, upstream, and this
 * module's job starts at the cells.
 *
 * The header is matched cell-for-cell against `AUDIT_COLUMNS` before any row is read. A mismatch is
 * fatal rather than recovered, because the same column shift would decide publication from the wrong
 * cell.
 *
 * The `vocabulary` argument is the wording-to-state policy described above. It defaults to
 * `PRODUCTION_RIGHTS_VOCABULARY`, so every caller that reads the delivered register — the audit, the
 * preflight gate, `src/lib/server/media/registry.ts` and therefore every page and every HTTP request —
 * evaluates rows exactly as it did before. A test that needs an armed vocabulary passes one; nothing
 * routes a synthetic approval into the production path, because the production path never supplies one.
 */
export function recordsFromRows(
  rows: readonly (readonly string[])[],
  declarationRule: DeclarationRule = ignoreDeclarations,
  vocabulary: RightsVocabulary = PRODUCTION_RIGHTS_VOCABULARY,
): readonly AssetRecord[] {
  const header = rows[0];
  if (header === undefined || header.length !== AUDIT_COLUMNS.length) {
    throw new AssetRegistryError(
      `expected a ${String(AUDIT_COLUMNS.length)}-column header, found ${String(header?.length)}`,
    );
  }
  for (let i = 0; i < AUDIT_COLUMNS.length; i += 1) {
    if (header[i] !== AUDIT_COLUMNS[i]) {
      throw new AssetRegistryError(
        `column ${String(i)} is "${String(header[i])}", expected "${String(AUDIT_COLUMNS[i])}"`,
      );
    }
  }
  const at = {
    assetId: requiredColumn(header, "Asset ID"),
    filename: requiredColumn(header, "Filename"),
    category: requiredColumn(header, "Expected Category"),
    physical: requiredColumn(header, "Physical Status"),
    path: requiredColumn(header, "Actual Path"),
    mime: requiredColumn(header, "MIME Type"),
    width: requiredColumn(header, "Width"),
    height: requiredColumn(header, "Height"),
    size: requiredColumn(header, "File Size"),
    sha: requiredColumn(header, "SHA-256"),
    source: requiredColumn(header, "Source/Creator"),
    rights: requiredColumn(header, "Rights Status"),
    approval: requiredColumn(header, "Brand/Curatorial Approval"),
    usage: requiredColumn(header, "Intended Usage"),
    actual: requiredColumn(header, "Actual Usage"),
    derivative: requiredColumn(header, "Derivative Status"),
    alt: requiredColumn(header, "Alt Text Status"),
    notes: requiredColumn(header, "Notes"),
  };

  const records: AssetRecord[] = [];
  for (const row of rows.slice(1)) {
    if (row.length === 1 && row[0] === "") continue; // trailing newline
    if (row.length !== AUDIT_COLUMNS.length) {
      throw new AssetRegistryError(
        `a register row has ${String(row.length)} cells, expected ${String(AUDIT_COLUMNS.length)}`,
      );
    }
    const assetId = String(row[at.assetId]);
    const filename = String(row[at.filename]);
    const width = positiveInteger(String(row[at.width]), "Width", assetId);
    const height = positiveInteger(String(row[at.height]), "Height", assetId);
    const { role, surfaces } = parseIntendedUsage(String(row[at.usage]));
    records.push({
      assetId,
      filename,
      category: String(row[at.category]),
      physicalStatus: physicalStatusFrom(String(row[at.physical]), assetId),
      libraryPath: String(row[at.path]),
      mime: String(row[at.mime]),
      width,
      height,
      bytes: positiveInteger(String(row[at.size]), "File Size", assetId),
      checksum: String(row[at.sha]),
      sourceCreator: String(row[at.source]),
      rightsStatement: String(row[at.rights]),
      approvalStatement: String(row[at.approval]),
      role,
      surfaces,
      usageStatement: String(row[at.actual]),
      derivativeStatus: String(row[at.derivative]),
      altTextStatus: String(row[at.alt]),
      notes: String(row[at.notes]),
      // R-04: the pixels are the register's measurement, the filename is a claim about them.
      declaration: declarationRule(filename, width, height),
      rights: rightsStateFrom(String(row[at.rights]), vocabulary),
      approval: approvalFrom(String(row[at.approval]), vocabulary),
      published: publishedFrom(String(row[at.actual]), vocabulary),
    });
  }
  return records;
}

/**
 * The filename-vs-pixels rule, injected rather than imported so this module has no dependency on
 * Node-only tooling. `src/lib/server/media/registry.ts` supplies the same function the audit and the
 * preflight gate use, so the count in a page and the count in the register cannot drift apart.
 */
export type DeclarationRule = (
  filename: string,
  width: number,
  height: number,
) => string | null;

const ignoreDeclarations: DeclarationRule = () => null;
