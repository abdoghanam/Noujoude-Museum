/**
 * src/lib/server/media/slots.ts — the only place a page asks what media belongs on it.
 *
 * A page component must not read the filesystem: `src/ui/**` is inside the eslint client-boundary
 * scope, `src/app/**\/page.tsx` is exempted only because a page is genuinely server-side, and even there
 * the rule in `src/README.md` is that asset data is reached through the media layer. So this file is the
 * seam. It joins three things that each own one question — the usage map (which surfaces bind here), the
 * register (what the catalog says about that asset), and the slot decision (what may be drawn) — and
 * hands the page plain data it can render without knowing any of them exist.
 *
 * The result is deliberately not filtered by rights. A page has to be able to say "this route has four
 * catalogued surfaces and none of them is servable", which is a measured statement about the build; a
 * list silently emptied by the gate would render the same page as one the catalog never placed anything
 * on, and the difference between those two is the whole content of RB-01.
 */

import type { Locale } from "@/domain/locale";
import type { RouteKey } from "@/domain/routes";
import type { AssetRecord } from "@/lib/media/asset-record";
import {
  type MediaSlotView,
  type WithheldReason,
  decideMediaSlot,
} from "@/lib/media/slot";
import { bindingsForRoute } from "@/lib/media/usage-map";
import {
  assetRegister,
  assetsBoundToRoute,
  publiclyServeableAssets,
} from "@/lib/server/media/registry";
import { slotInputFor } from "@/lib/server/media/slot-facts";

/**
 * One asset, one locale: the data a slot needs.
 *
 * The surface named is the first of the asset's own declared surfaces that this route actually binds,
 * so the label under a refusal is the catalog's word for the placement rather than a route key. Falling
 * back to the first declared surface keeps the label honest when a caller passes a record directly.
 */
export function viewFor(
  asset: AssetRecord,
  locale: Locale,
  bindingSurfaces?: readonly string[],
): MediaSlotView {
  const wanted = new Set(
    (bindingSurfaces ?? []).map((surface) => surface.toLowerCase()),
  );
  const surface =
    asset.surfaces.find((candidate) => wanted.has(candidate.toLowerCase())) ??
    asset.surfaces[0] ??
    "undeclared";
  const { record, facts } = slotInputFor(asset, locale);
  return { assetId: asset.assetId, surface, record, facts };
}

/** Every asset the catalog binds to this route, in binding order, as slot data. */
export function slotViewsFor(
  route: RouteKey | "global",
  locale: Locale,
  slug?: string,
): readonly MediaSlotView[] {
  const bindingSurfaces = bindingsForRoute(route, slug).map(
    (binding) => binding.surface,
  );
  return assetsBoundToRoute(route, slug).map((asset) =>
    viewFor(asset, locale, bindingSurfaces),
  );
}

/**
 * The register's four public-serving numbers.
 *
 * The shape carries the dimensions separately on purpose — `cleared` and `approved` are legal states in
 * their own right, and `gatePassed` is the intersection the gate draws from them plus publication. A.9
 * forbids collapsing those into one completion figure, so there is no `percentComplete` here.
 */
export interface PublicServingSummary {
  readonly total: number;
  readonly cleared: number;
  readonly approved: number;
  readonly gatePassed: number;
}

/**
 * The register's four public numbers, recomputed per call rather than restated in prose.
 *
 * The name of the last field is deliberate: `gatePassed` counts the assets that clear
 * `decidePublicServing`, which is *not* the same as the assets a slot will draw. A slot additionally
 * needs a served copy and recorded alt text, so the two numbers can differ, and a footer that conflated
 * them would be reporting RB-01 and RB-03 as one fact when A.9 says they are separate states.
 */
export function publicServingSummary(): PublicServingSummary {
  const records = assetRegister();
  return {
    total: records.length,
    cleared: records.filter((asset) => asset.rights === "cleared").length,
    approved: records.filter((asset) => asset.approval === "approved").length,
    gatePassed: publiclyServeableAssets().length,
  };
}

/**
 * The footer's media claim, built from a summary instead of typed into a template.
 *
 * This sentence is a release condition, so it has to be a function of the numbers the audit writes. The
 * only way to prove a piece of output is computed rather than remembered is to call it with numbers the
 * register does not have today and show the wording moves — which is what
 * `src/lib/server/media/slots.test.ts` does. A hard-coded "82 catalogued assets, 0 pass" would survive
 * a re-audit that changed both figures, and then the page would be asserting a state the register no
 * longer records.
 */
export function servingFooterSentence(serving: PublicServingSummary): string {
  const measured = `Pre-publication shell. ${String(serving.total)} catalogued assets, ${String(
    serving.gatePassed,
  )} pass the public-serving gate`;
  return serving.gatePassed === 0
    ? `${measured}, so no imagery is rendered anywhere in this build.`
    : `${measured}; every other asset is withheld by its slot.`;
}

/**
 * The single outcome a caller needs when it is not drawing the slot itself — the masthead band, which
 * shows the name in text and must say *why* it shows text rather than the monogram.
 */
export function slotOutcome(view: MediaSlotView): "image" | WithheldReason {
  const decision = decideMediaSlot(view.record, view.facts);
  return decision.kind === "image" ? "image" : decision.reason;
}
