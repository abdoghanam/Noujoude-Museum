/**
 * src/lib/server/media/slot-facts.ts — the server-side facts a media slot needs and cannot invent.
 *
 * `src/lib/media/slot.ts` deliberately takes `src` and `altText` as inputs, because a pure module that
 * read the filesystem or defaulted a caption would be a gate that supplies its own evidence. This file
 * is where those inputs are produced or honestly reported as absent, and it is the only place a page is
 * allowed to ask.
 *
 * Both answers today are "there is none", and neither is a stub:
 *
 * - **Source.** No derivative has ever been produced. The pipeline cannot run for any asset while RB-01
 *   stands, because producing a derivative from an uncleared original would create a second copy of
 *   material with no rights statement — `docs/MEDIA_AND_RIGHTS_GOVERNANCE.md` §8 says the fix "cannot
 *   precede the clearance" in exactly these words.
 * - **Alt text.** The register has an `Alt Text Status` column and no Alt Text column, so 82/82 rows read
 *   `Not Recorded` and no amount of parsing the delivered file can yield a description. Text has to
 *   arrive with the record that owns it. Writing one would be the fabricated content §6.1 forbids.
 */

import path from "node:path";

import type { Locale } from "@/domain/locale";
import type { AssetRecord } from "@/lib/media/asset-record";
import type { SlotFacts, SlotRecord } from "@/lib/media/slot";
import { decidePublicServing } from "@/domain/rights";

import {
  type DerivativeLineage,
  type DerivativeManifest,
  derivativeUrl,
  readDerivativeManifestSource,
} from "@/lib/server/media/derivative-store";

interface ManifestCacheEntry {
  /** Resolved directory the bytes came from, so a second root cannot be served the first root's record. */
  readonly root: string;
  /** SHA-256 of the manifest file, or null when there is no file. */
  readonly stamp: string | null;
  readonly manifest: DerivativeManifest | null;
}

let sourceCache: ManifestCacheEntry | null = null;

/**
 * A record a caller supplied instead of the one on disk.
 *
 * `undefined` means "nothing was injected", which is why the variable is not simply the manifest type:
 * injecting `null` is a meaningful state (a page that must render the no-lineage refusal) and has to be
 * distinguishable from "not injected, go and look". Production code never sets it; `setDerivativeManifest`
 * is the seam a test or an in-memory build uses, and SR-10 is the open item that makes it throw under
 * `NODE_ENV=production`.
 */
let injected: DerivativeManifest | null | undefined;

/**
 * The lineage record, revalidated against the file on every call.
 *
 * It used to be read once per process, and that made the cache part of the trust decision: a lineage row
 * rewritten on disk — a derivative swapped for different bytes, an asset removed from the record — could
 * not be seen until a restart. Same defect class as SR-08 in `registry.ts`, same fix: hash the bytes,
 * reuse the parsed manifest only when the digest did not move, and let a corrupt record throw on the read
 * rather than being answered from memory. Absent answers `null`, which is the state a page renders a
 * refusal from.
 */
export function derivativeManifest(
  root = process.cwd(),
): DerivativeManifest | null {
  if (injected !== undefined) return injected;
  return manifestSnapshot(root).manifest;
}

function manifestSnapshot(root: string): ManifestCacheEntry {
  const resolved = path.resolve(root);
  const { manifest, stamp } = readDerivativeManifestSource(resolved);
  const cached = sourceCache;
  if (cached !== null && cached.root === resolved && cached.stamp === stamp)
    return cached;
  const entry: ManifestCacheEntry = { manifest, root: resolved, stamp };
  sourceCache = entry;
  return entry;
}

/** Discard both the injected record and the disk cache, so the next call reads the file. */
export function resetDerivativeManifestCache(): void {
  injected = undefined;
  sourceCache = null;
}

/** Supply a manifest explicitly — for a test, or for a build that has the record in memory. */
export function setDerivativeManifest(
  manifest: DerivativeManifest | null,
): void {
  injected = manifest;
}

export function lineageFor(
  assetId: string,
  root = process.cwd(),
): DerivativeLineage | null {
  return (
    derivativeManifest(root)?.derivatives.find(
      (row) => row.assetId === assetId,
    ) ?? null
  );
}

/**
 * The URL a served derivative answers on, or null.
 *
 * Null is returned for an asset the gate has not cleared even when a derivative file exists, so a
 * lineage record that got built by hand cannot become a public URL by being noticed. The route re-runs
 * the same decision; this is the second of two gates, not a substitute for the first.
 */
export function servedSrcFor(
  asset: AssetRecord,
  root = process.cwd(),
): string | null {
  if (!decidePublicServing(asset).serve) return null;
  const lineage = lineageFor(asset.assetId, root);
  if (lineage === null) return null;
  return derivativeUrl(lineage.assetId);
}

/**
 * Alt text for a register-sourced asset: always null, because the register carries a status, not a
 * description.
 *
 * The locale is part of the signature because §8.14's field table asks for `alt_text_en` and
 * `alt_text_ar` as two required localized values, not one — so the lookup has to be per-locale from the
 * first day, and a slot that asked for "the alt text" would end up shipping English text into an Arabic
 * page. A future CMS record supplies the strings and this is where they are read.
 *
 * Until then the slot refuses, which is the correct outcome for an image that would otherwise ship with
 * an invented caption or an empty `alt=""` asserting that the picture is decorative.
 */
export function altTextFor(
  _asset: AssetRecord,
  _locale: Locale,
): string | null {
  return null;
}

/**
 * Everything `decideMediaSlot` needs, resolved from the register and the private store.
 *
 * The dimensions reported are the derivative's when a derivative exists — those are the bytes that will
 * be fetched, so they are the bytes whose aspect ratio the layout must reserve. When none exists the
 * register's measured originals are reported, decoded from container headers by the audit rather than
 * read out of the filename.
 */
export function slotInputFor(
  asset: AssetRecord,
  locale: Locale,
  root = process.cwd(),
): {
  readonly record: SlotRecord;
  readonly facts: SlotFacts;
} {
  const lineage = lineageFor(asset.assetId, root);
  return {
    record: {
      assetId: asset.assetId,
      rights: asset.rights,
      approval: asset.approval,
      published: asset.published,
      width: lineage?.width ?? asset.width,
      height: lineage?.height ?? asset.height,
    },
    facts: {
      src: servedSrcFor(asset, root),
      altText: altTextFor(asset, locale),
    },
  };
}
