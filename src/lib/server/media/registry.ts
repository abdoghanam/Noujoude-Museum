/**
 * src/lib/server/media/registry.ts — the server-side reader of the asset register.
 *
 * Server-only by location: `eslint.config.mjs` exempts `src/lib/server/**` from the client-boundary
 * guard precisely because this is where Node reads happen. `src/README.md` sets the rule this file
 * obeys — "Application code may read asset data only through the media/rights layer, never by reaching
 * into the original library at runtime" — so the registry reads `docs/ASSET_INVENTORY_AUDIT.csv`, which
 * is a *record about* the library, and never opens a file under `Noujoude.photo/`. The originals stay
 * read-only inputs, and a page that needed a byte from them would be a page that bypassed the gate.
 *
 * The CSV parser and the filename self-declaration rule are imported from `scripts/lib/`, not
 * reimplemented. That is deliberate: the preflight gate's own test asserts the gate and the audit
 * report the same mismatch count because they call one function, and H-7 was a column-shift caused by
 * a second parser. A third copy in `src/` would recreate both.
 */

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { declarationMismatch } from "../../../../scripts/lib/asset-declarations.mjs";
import { parseCsv } from "../../../../scripts/lib/csv.mjs";

import {
  type AssetRecord,
  AssetRegistryError,
  type DeclarationRule,
  PRODUCTION_RIGHTS_VOCABULARY,
  recordsFromRows,
  type RightsVocabulary,
} from "@/lib/media/asset-record";
import { bindingsForRoute } from "@/lib/media/usage-map";
import type { RouteKey } from "@/domain/routes";
import { decidePublicServing, type MediaRecord } from "@/domain/rights";

/** Default location of the delivered register, relative to the repository root. */
export const ASSET_REGISTER_PATH = path.join(
  "docs",
  "ASSET_INVENTORY_AUDIT.csv",
);

/**
 * Parse register text into records with the repository's one CSV reader and the audit's own
 * filename self-declaration rule.
 *
 * Exported separately from `readAssetRegister` so a test can feed known bytes through the same path a
 * page uses. The declaration rule is the shared `declarationMismatch`, which is what makes R-04 — "no
 * code trusts a filename" — one rule with three callers instead of three restatements of it.
 *
 * The `vocabulary` is the wording-to-state policy and defaults to the production one, whose clearance
 * whitelists are empty. `readAssetRegister` never passes one, so the delivered register — and every page
 * and every request built on it — is evaluated under the production policy and nothing else. A fixture
 * that needs an armed policy supplies its own here, in a test file.
 */
export function registryFromText(
  text: string,
  rule: DeclarationRule = declarationMismatch as DeclarationRule,
  vocabulary: RightsVocabulary = PRODUCTION_RIGHTS_VOCABULARY,
): readonly AssetRecord[] {
  return recordsFromRows(parseCsv(text), rule, vocabulary);
}

/** Read the register from disk. A missing file is a thrown failure, never an empty inventory. */
export function readAssetRegister(
  root = process.cwd(),
): readonly AssetRecord[] {
  return parseRegister(readRegisterBytes(root));
}

function readRegisterBytes(root: string): Buffer {
  const file = path.join(path.resolve(root), ASSET_REGISTER_PATH);
  try {
    return readFileSync(file);
  } catch {
    throw new AssetRegistryError(
      `the asset register at ${ASSET_REGISTER_PATH} could not be read; media slots cannot decide without it`,
    );
  }
}

function parseRegister(bytes: Buffer): readonly AssetRecord[] {
  return registryFromText(bytes.toString("utf8"));
}

/**
 * The cached register plus the digest of the bytes it was parsed from.
 *
 * `surfaceIndex` lives here rather than in its own module-level variable so the two cannot be at
 * different versions of the file: the index used to be cleared only by an explicit reset, which meant a
 * refreshed register could still answer a surface lookup from the previous one.
 */
interface RegisterCacheEntry {
  /** Resolved directory the bytes came from, so a second root cannot be served the first root's rows. */
  readonly root: string;
  readonly stamp: string;
  readonly records: readonly AssetRecord[];
  readonly surfaceIndex: Map<string, readonly AssetRecord[]>;
}

let cache: RegisterCacheEntry | null = null;

/**
 * The register, revalidated against the file on every call.
 *
 * It used to be read once per process, and that was a security defect rather than an optimisation
 * (SR-08, and the reason `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §20.4 cannot be enforced by a cache): a
 * revocation written into the register — a right withdrawn, an approval rescinded, an asset pulled from
 * publication — only became visible at the next process start, so a long-lived server could keep serving
 * an asset for as long as it stayed up. The gate itself re-runs per request, but it was re-running over
 * remembered rows.
 *
 * The fix keys the cache on the SHA-256 of the register bytes instead of on "have I read yet". Every call
 * reads the file and hashes it (the delivered register is 55,941 bytes measured on 2 November 2026, so
 * the cost is a small read plus one hash); the CSV is re-parsed and the surface index rebuilt only when
 * the digest moved. That keeps the expensive part cached and the security-relevant part fresh, and it
 * makes the failure mode honest: a register that cannot be read throws on the next call instead of being
 * answered from memory.
 */
export function assetRegister(root = process.cwd()): readonly AssetRecord[] {
  return registerSnapshot(root).records;
}

/**
 * The cache lookup itself: hash what is on disk, reuse the parse only when the digest did not move.
 *
 * A cold or changed register is parsed here; a register that cannot be read throws from
 * `readRegisterBytes` before any remembered rows can be returned. That is the fail-closed property the
 * old code could not guarantee after its first read.
 */
function registerSnapshot(root: string): RegisterCacheEntry {
  const resolved = path.resolve(root);
  const bytes = readRegisterBytes(resolved);
  const stamp = createHash("sha256").update(bytes).digest("hex");
  const cached = cache;
  if (cached !== null && cached.root === resolved && cached.stamp === stamp)
    return cached;
  const records = parseRegister(bytes);
  const entry: RegisterCacheEntry = {
    root: resolved,
    stamp,
    records,
    surfaceIndex: indexBySurface(records),
  };
  cache = entry;
  return entry;
}

export function assetById(
  assetId: string,
  root = process.cwd(),
): AssetRecord | null {
  return assetRegister(root).find((asset) => asset.assetId === assetId) ?? null;
}

export function assetByFilename(
  filename: string,
  root = process.cwd(),
): AssetRecord | null {
  return (
    assetRegister(root).find((asset) => asset.filename === filename) ?? null
  );
}

/**
 * The assets whose catalogued surface names this route.
 *
 * Matching is on the `Intended Usage` column's surface list, which is the catalog's own words
 * ("Homepage hero", "Morocco World", "Coins"), not a guessed convention. Returns every candidate for
 * the caller to resolve against the gate; it does not filter by rights, because "which assets belong
 * here" and "which assets may be served here" are different questions with different owners.
 */
export function assetsForSurface(
  surface: string,
  root = process.cwd(),
): readonly AssetRecord[] {
  const wanted = surface.trim().toLowerCase();
  return registerSnapshot(root).surfaceIndex.get(wanted) ?? [];
}

/**
 * The assets whose catalogued surfaces bind to one route, in binding order.
 *
 * The binding table is `src/lib/media/usage-map.ts`, not a guess made here: a route asks for the
 * surfaces that map names for it, and the register answers with the assets that declare them. Two
 * questions stay separate on purpose — which assets *belong* on a route is the usage map's, which may
 * be *served* there is the rights gate's — so this function does not filter by rights and a caller
 * that wants pixels has to go through `src/ui/media-slot.tsx`.
 */
export function assetsBoundToRoute(
  route: RouteKey | "global",
  slug?: string,
  root = process.cwd(),
): readonly AssetRecord[] {
  const surfaces = bindingsForRoute(route, slug);
  const bySurface = registerSnapshot(root).surfaceIndex;
  const matched: AssetRecord[] = [];
  for (const binding of surfaces) {
    const assets = bySurface.get(binding.surface.toLowerCase());
    // A surface the map binds to a route but no asset declares is a defect in the map, and it fails
    // here rather than rendering a page that quietly has one fewer slot than the baseline asked for.
    if (assets === undefined || assets.length === 0) {
      throw new AssetRegistryError(
        `the usage map binds "${binding.surface}" to ${String(route)}, but no asset in the register declares that surface`,
      );
    }
    for (const asset of assets) {
      if (!matched.some((seen) => seen.assetId === asset.assetId))
        matched.push(asset);
    }
  }
  return matched;
}

/**
 * One pass over one version of the register, keyed by the lower-cased surface name.
 *
 * Pure, and called from `registerSnapshot` rather than from a lookup: an index that cached itself in a
 * module variable could outlive the records it was built from, which is the same staleness SR-08 is about
 * — a surface pulled from the catalog would still resolve to the asset that used to declare it.
 */
function indexBySurface(
  records: readonly AssetRecord[],
): Map<string, readonly AssetRecord[]> {
  const index = new Map<string, AssetRecord[]>();
  for (const asset of records) {
    for (const surface of asset.surfaces) {
      const key = surface.toLowerCase();
      const bucket = index.get(key);
      if (bucket === undefined) index.set(key, [asset]);
      else bucket.push(asset);
    }
  }
  return index;
}

/**
 * Drop the cached parse and index.
 *
 * Kept for a re-audit inside one process and for tests. It is no longer the *only* way a change becomes
 * visible — that is the point of the digest key above — so the security property does not depend on
 * someone remembering to call it.
 */
export function resetAssetRegisterCache(): void {
  cache = null;
}

/** Assets that a public page may render *right now*. Measured: this is the empty set. */
export function publiclyServeableAssets(
  root = process.cwd(),
): readonly AssetRecord[] {
  return assetRegister(root).filter(
    (asset) => decidePublicServing(asset).serve,
  );
}

/**
 * Counts broken out per dimension, never merged.
 *
 * A.9 requires technical and legal status to be tracked separately and forbids combining distinct
 * states into one completion percentage, so there is no `percentComplete` in this shape on purpose.
 */
export interface RegisterTally {
  readonly total: number;
  readonly present: number;
  readonly notPresent: number;
  readonly declarationMismatch: number;
  readonly rightsCleared: number;
  readonly rightsPending: number;
  readonly rightsUnknown: number;
  readonly approved: number;
  readonly notApproved: number;
  readonly approvalUnknown: number;
  readonly serveable: number;
}

export function registerTally(
  records: readonly AssetRecord[] = assetRegister(),
): RegisterTally {
  const decisionCount = (predicate: (record: MediaRecord) => boolean): number =>
    records.filter((record) => predicate(record)).length;
  return {
    total: records.length,
    present: records.filter((r) => r.physicalStatus === "PRESENT").length,
    notPresent: records.filter((r) => r.physicalStatus !== "PRESENT").length,
    declarationMismatch: records.filter((r) => r.declaration !== null).length,
    rightsCleared: records.filter((r) => r.rights === "cleared").length,
    rightsPending: records.filter((r) => r.rights === "pending").length,
    rightsUnknown: records.filter((r) => r.rights === "unknown").length,
    approved: records.filter((r) => r.approval === "approved").length,
    notApproved: records.filter((r) => r.approval === "not_approved").length,
    approvalUnknown: records.filter((r) => r.approval === "unknown").length,
    serveable: decisionCount((record) => decidePublicServing(record).serve),
  };
}
