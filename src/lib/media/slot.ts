/**
 * src/lib/media/slot.ts — what a media slot may render, as a pure decision.
 *
 * `src/domain/rights.ts` answers one question: may this asset be served publicly. That is necessary
 * and not sufficient. A slot that passes the rights gate can still be handed nothing to load, no alt
 * text, and no measured size — and each of those failures, rendered as an `<img>`, produces a different
 * kind of wrong page: a broken element, an inaccessible image, or a layout that jumps. Standard §13
 * line 306 sets the rule this file exists to follow: "Implement the required workflows and placeholders;
 * keep unapproved facts out of public output."
 *
 * So the slot composes four checks in a fixed order and returns a discriminated union. The component in
 * `src/ui/media-slot.tsx` cannot reach an `<img>` except through the `image` branch of that union, which
 * is what "refuses by construction" means here: there is no prop that forces a render, and no default
 * that stands in for a missing fact.
 *
 * The four dimensions stay separate on purpose (Master Spec A.9: "referenced, present, rights-cleared,
 * approved, optimized, integrated, and verified are different states"). Passing the rights gate says
 * nothing about alt text, and having alt text says nothing about rights.
 */

import {
  type MediaRecord,
  type ServingDenial,
  decidePublicServing,
  placeholderFor,
} from "@/domain/rights";

/**
 * A withheld slot's reason. The first four values are the domain gate's, verbatim; the last three are
 * slot-level failures that `decidePublicServing` cannot see because they are not legal states.
 *
 * `SlotPlaceholder` from `src/domain/rights.ts` remains the shape of a rights denial — the three keys it
 * carries are asserted by `src/domain/rights.test.ts` and widening them there would move the gate. These
 * extra reasons are therefore expressed in a superset with identical keys, so a placeholder is assignable
 * to a withheld slot and the domain contract is untouched.
 */
export type WithheldReason =
  | ServingDenial
  | "no_image_source"
  | "alt_text_not_recorded"
  | "dimensions_not_measured";

export interface WithheldSlot {
  readonly kind: "unpopulated";
  readonly assetId: string;
  readonly reason: WithheldReason;
}

export interface ImageSlot {
  readonly kind: "image";
  readonly assetId: string;
  /** Only ever a URL the serving layer verified exists; never derived from a filename. */
  readonly src: string;
  /** Only ever a supplied string. An empty string is a claim of decorativeness, so it is not a default. */
  readonly alt: string;
  /** Decoded from the container by the audit, carried through the register. */
  readonly width: number;
  readonly height: number;
}

export type SlotDecision = ImageSlot | WithheldSlot;

/**
 * A record plus the two facts the register cannot carry.
 *
 * `src` is the served URL of an existing derivative, and `altText` is editorial text. Neither is a
 * column in `docs/ASSET_INVENTORY_AUDIT.csv`: the file has an `Alt Text Status` column, not an Alt Text
 * column, so a CSV-sourced asset can never supply alt text at all and the text has to arrive with the
 * record that owns it. Both are required rather than optional because an omitted question is how a gate
 * ends up answering for itself.
 */
export interface SlotFacts {
  readonly src: string | null;
  readonly altText: string | null;
}

/** The narrowest shape the slot needs: a gate input, plus the pixels the container was measured at. */
export interface SlotRecord extends MediaRecord {
  readonly width: number;
  readonly height: number;
}

/**
 * One slot, fully resolved: what the gate sees, what the facts are, and which catalog surface put it
 * here. Built by `src/lib/server/media/slots.ts` and passed to the component as plain data, so no
 * rendering component ever reads a file — the page asks, the server layer answers, the UI draws.
 */
export interface MediaSlotView {
  readonly assetId: string;
  readonly surface: string;
  readonly record: SlotRecord;
  readonly facts: SlotFacts;
}

function withheld(record: MediaRecord, reason: WithheldReason): WithheldSlot {
  // When the reason *is* a rights denial, hand back the domain's own placeholder object so there is one
  // definition of that shape rather than two that happen to match.
  const placeholder = placeholderFor(record);
  if (placeholder !== null && placeholder.reason === reason) return placeholder;
  return { kind: "unpopulated", assetId: record.assetId, reason };
}

/**
 * The decision, in order.
 *
 * 1. Rights and approval — the legal question, answered by the one gate in `src/domain/rights.ts`.
 * 2. Is there anything to serve? A cleared asset with no derivative is not a renderable image.
 * 3. Is there alt text? Without it, an `<img>` either fails §8.14 or silently claims "decorative".
 * 4. Are the dimensions measured? R-04 forbids a filename standing in for a pixel count, and 18 of the
 *    82 catalogued files are smaller than their own names claim.
 *
 * The first failure is reported rather than all of them, because the reason a visitor sees nothing is the
 * reason the build stopped. Which step that is has to be measured rather than asserted here: the gate stops
 * some rows, a cleared row can still be missing its derivative, its label or its measured pixels, and the
 * rows that survive all four are the pictures. `src/lib/server/media/slots.test.ts` derives the counts from
 * the register and the store on every run, which is what keeps this ordering honest as the governance data
 * moves.
 */
export function decideMediaSlot(
  record: SlotRecord,
  facts: SlotFacts,
): SlotDecision {
  const serving = decidePublicServing(record);
  if (!serving.serve)
    return withheld(record, serving.denial ?? "unrecognised_state");
  if (facts.src === null || facts.src.trim() === "")
    return withheld(record, "no_image_source");
  if (facts.altText === null || facts.altText.trim() === "")
    return withheld(record, "alt_text_not_recorded");
  if (!Number.isInteger(record.width) || record.width <= 0)
    return withheld(record, "dimensions_not_measured");
  if (!Number.isInteger(record.height) || record.height <= 0)
    return withheld(record, "dimensions_not_measured");
  return {
    kind: "image",
    assetId: record.assetId,
    src: facts.src,
    alt: facts.altText,
    width: record.width,
    height: record.height,
  };
}
