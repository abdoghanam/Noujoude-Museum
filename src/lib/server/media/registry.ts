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
export function readAssetRegister(root = process.cwd()): readonly AssetRecord[] {
  const file = path.join(root, ASSET_REGISTER_PATH);
  let text: string;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    throw new AssetRegistryError(
      `the asset register at ${ASSET_REGISTER_PATH} could not be read; media slots cannot decide without it`,
    );
  }
  return registryFromText(text);
}

let cache: readonly AssetRecord[] | null = null;

/** The register, read once per process. A cold failure is thrown, never cached as empty. */
export function assetRegister(): readonly AssetRecord[] {
  if (cache === null) cache = readAssetRegister();
  return cache;
}

export function assetById(assetId: string): AssetRecord | null {
  return assetRegister().find((asset) => asset.assetId === assetId) ?? null;
}

export function assetByFilename(filename: string): AssetRecord | null {
  return (
    assetRegister().find((asset) => asset.filename === filename) ?? null
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
export function assetsForSurface(surface: string): readonly AssetRecord[] {
  const wanted = surface.trim().toLowerCase();
  return assetRegister().filter(
    (asset) =>
      asset.surfaces.length > 0 &&
      asset.surfaces.some((s) => s.toLowerCase() === wanted),
  );
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
): readonly AssetRecord[] {
  const surfaces = bindingsForRoute(route, slug);
  const bySurface = indexBySurface();
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
      if (!matched.some((seen) => seen.assetId === asset.assetId)) matched.push(asset);
    }
  }
  return matched;
}

let surfaceIndex: Map<string, readonly AssetRecord[]> | null = null;

/** One pass over the register, keyed by the lower-cased surface name. */
function indexBySurface(): Map<string, readonly AssetRecord[]> {
  if (surfaceIndex === null) {
    const index = new Map<string, AssetRecord[]>();
    for (const asset of assetRegister()) {
      for (const surface of asset.surfaces) {
        const key = surface.toLowerCase();
        const bucket = index.get(key);
        if (bucket === undefined) index.set(key, [asset]);
        else bucket.push(asset);
      }
    }
    surfaceIndex = index;
  }
  return surfaceIndex;
}

/** Clear every cache the registry holds. Exists for tests and for a re-audit inside one process. */
export function resetAssetRegisterCache(): void {
  cache = null;
  surfaceIndex = null;
}

/** Assets that a public page may render *right now*. Measured: this is the empty set. */
export function publiclyServeableAssets(): readonly AssetRecord[] {
  return assetRegister().filter((asset) => decidePublicServing(asset).serve);
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
