import type { WithheldReason } from "@/lib/media/slot";
import {
  type MediaSlotView,
  type SlotFacts,
  type SlotRecord,
  decideMediaSlot,
} from "@/lib/media/slot";
import styles from "@/ui/media-slot.module.css";

/**
 * `src/ui/media-slot.tsx` — the one image element in the application, and it cannot be forced open.
 *
 * The Phase 3 deliverable is "an image component that refuses any asset whose rights state is not
 * cleared". Refusal by prop convention is not refusal: a caller could pass `force` or omit a field and
 * get pixels anyway. So the shape here is structural. There is no `src` prop. The only `<img>` in this
 * file draws its `src`, `alt`, `width` and `height` out of the `image` branch of `decideMediaSlot`'s
 * union, and that branch exists only when the rights gate, the served-copy check, the alt-text check
 * and the measured-pixels check have all passed. Everything else returns a sentence.
 *
 * Plain `<img>` rather than `next/image` is the same decision the shell already made: `next.config.mjs`
 * carries no `images` key on purpose, because an image optimiser that fetches from a remote source is a
 * second path to the original library that bypasses this component. When derivatives exist they are
 * served by `src/app/api/media/[assetId]/route.ts`, which re-runs `decidePublicServing` per request.
 *
 * English-only copy, marked `lang="en"`, follows the convention the layout sets for structural labels:
 * Arabic editorial copy is an Owner input that has not been supplied, and writing it here would be
 * inventing content in the other language rather than labelling a state.
 */

export interface MediaSlotProps {
  /** The asset as the register recorded it, with the pixels decoded from its container. */
  readonly record: SlotRecord;
  /** The served copy and the alt text, resolved by `src/lib/server/media/slot-facts.ts`. */
  readonly facts: SlotFacts;
  /** Which §6.1 surface this slot sits in — recorded so the usage map is a fact, not a memory. */
  readonly surface: string;
}

const WITHHELD_COPY: Readonly<Record<WithheldReason, string>> = {
  rights_not_cleared:
    "This asset is not rights-cleared, so no copy of it is served here.",
  approval_not_granted:
    "This asset has no curatorial or brand approval on record, so it is withheld.",
  not_published: "This asset has no publication record, so it is withheld.",
  unrecognised_state:
    "This asset's rights state is not one the gate recognises, so it is withheld.",
  no_image_source:
    "No served copy of this asset exists; nothing has been produced or approved for delivery.",
  alt_text_not_recorded:
    "This asset carries no recorded alt text, and an unlabelled image would claim a meaning no one supplied.",
  dimensions_not_measured:
    "This asset has no measured pixel dimensions, so its shape would have to be guessed from its filename.",
};

export function MediaSlot({ record, facts, surface }: MediaSlotProps) {
  const decision = decideMediaSlot(record, facts);

  if (decision.kind === "image") {
    return (
      <img
        alt={decision.alt}
        className={styles.image}
        data-asset-id={decision.assetId}
        data-surface={surface}
        height={decision.height}
        src={decision.src}
        width={decision.width}
      />
    );
  }

  /*
   * The withheld branch carries no dimensions, no count and no caption — §6.1 requires that "Empty or
   * unavailable sections do not render fabricated counts or objects", and the domain's placeholder shape
   * (`{kind, assetId, reason}`) is deliberately three keys wide. The machine-readable `data-reason` is
   * the operator-facing audit trail; the sentence is what a visitor reads.
   */
  return (
    <p
      className={styles.withheld}
      data-asset-id={decision.assetId}
      data-reason={decision.reason}
      data-slot="media-withheld"
      data-surface={surface}
      lang="en"
    >
      {WITHHELD_COPY[decision.reason]}
    </p>
  );
}

export interface MediaSlotGroupProps {
  /** The views built by `src/lib/server/media/slots.ts`, in binding order. */
  readonly views: readonly MediaSlotView[];
}

/**
 * A route's slots, with the one number a section is allowed to print: the count of catalogued surfaces
 * bound here and the count of them the gate lets through, both computed from the views in front of it.
 *
 * §6.1 bars *fabricated* counts, and "Of 4 catalogued surfaces bound to this route, 0 are cleared for
 * public serving" is the opposite of fabricated — it is measured from the views array and states the
 * release condition where a visitor would otherwise have to guess that the dashed boxes are refusals
 * rather than a page that has no imagery by design. A route the catalog never placed anything on renders
 * nothing at all, because there is no measured number to say.
 */
export function MediaSlotGroup({ views }: MediaSlotGroupProps) {
  if (views.length === 0) return null;
  const decisions = views.map((view) =>
    decideMediaSlot(view.record, view.facts),
  );
  const served = decisions.filter((decision) => decision.kind === "image").length;
  return (
    <div className={styles.group}>
      <p className={styles.tally} data-slot="media-tally" lang="en">
        {`Of ${String(views.length)} catalogued surface${
          views.length === 1 ? "" : "s"
        } bound to this route, ${String(served)} ${
          served === 1 ? "is" : "are"
        } cleared for public serving.`}
      </p>
      <ul className={styles.list}>
        {views.map((view) => (
          <li className={styles.entry} key={`${view.assetId}:${view.surface}`}>
            <MediaSlot
              facts={view.facts}
              record={view.record}
              surface={view.surface}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
