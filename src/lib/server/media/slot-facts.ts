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

import type { Locale } from "@/domain/locale";
import type { AssetRecord } from "@/lib/media/asset-record";
import type { SlotFacts, SlotRecord } from "@/lib/media/slot";
import { decidePublicServing } from "@/domain/rights";

import {
  type DerivativeLineage,
  type DerivativeManifest,
  derivativeUrl,
  readDerivativeManifest,
} from "@/lib/server/media/derivative-store";

let manifestCache: DerivativeManifest | null | undefined;

/** The lineage record, read once per process. `undefined` means not yet read, `null` means absent. */
export function derivativeManifest(): DerivativeManifest | null {
  if (manifestCache === undefined) manifestCache = readDerivativeManifest();
  return manifestCache;
}

export function resetDerivativeManifestCache(): void {
  manifestCache = undefined;
}

/** Supply a manifest explicitly — for a test, or for a build that has the record in memory. */
export function setDerivativeManifest(
  manifest: DerivativeManifest | null,
): void {
  manifestCache = manifest;
}

export function lineageFor(assetId: string): DerivativeLineage | null {
  return derivativeManifest()?.derivatives.find((row) => row.assetId === assetId) ?? null;
}

/**
 * The URL a served derivative answers on, or null.
 *
 * Null is returned for an asset the gate has not cleared even when a derivative file exists, so a
 * lineage record that got built by hand cannot become a public URL by being noticed. The route re-runs
 * the same decision; this is the second of two gates, not a substitute for the first.
 */
export function servedSrcFor(asset: AssetRecord): string | null {
  if (!decidePublicServing(asset).serve) return null;
  const lineage = lineageFor(asset.assetId);
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
export function altTextFor(_asset: AssetRecord, _locale: Locale): string | null {
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
): {
  readonly record: SlotRecord;
  readonly facts: SlotFacts;
} {
  const lineage = lineageFor(asset.assetId);
  return {
    record: {
      assetId: asset.assetId,
      rights: asset.rights,
      approval: asset.approval,
      published: asset.published,
      width: lineage?.width ?? asset.width,
      height: lineage?.height ?? asset.height,
    },
    facts: { src: servedSrcFor(asset), altText: altTextFor(asset, locale) },
  };
}
