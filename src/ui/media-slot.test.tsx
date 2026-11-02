/**
 * src/ui/media-slot.test.tsx — the component cannot be talked into drawing a pixel.
 *
 * The decision table itself lives in `src/lib/media/slot.test.ts`; this file is about the one thing
 * that table cannot prove: that no input reaching `MediaSlot` produces an `<img>` except the `image`
 * branch. That is the Phase 3 deliverable — "an image component that refuses any asset whose rights
 * state is not cleared" — and a component test is the only place the claim can be checked, because the
 * claim is about markup.
 *
 * The fixture table below repeats the seven reasons on purpose. It duplicates *inputs*, not logic: each
 * file's `Record<WithheldReason, …>` is checked against the type by the compiler, so the two stay
 * honest with the vocabulary rather than with each other.
 */

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type {
  MediaSlotView,
  SlotFacts,
  SlotRecord,
  WithheldReason,
} from "@/lib/media/slot";
import { MediaSlot, MediaSlotGroup, type MediaSlotProps } from "@/ui/media-slot";

const BASE: SlotRecord = {
  assetId: "NDM-TEST-001",
  rights: "cleared",
  approval: "approved",
  published: true,
  width: 1200,
  height: 800,
};

const READY: SlotFacts = {
  src: "/api/media/NDM-TEST-001",
  altText: "Silver dinar, obverse and reverse",
};

const UNRECOGNISED = { ...BASE, rights: "revoked" } as unknown as SlotRecord;

const WITHHELD_CASES: Record<
  WithheldReason,
  { readonly record: SlotRecord; readonly facts: SlotFacts }
> = {
  rights_not_cleared: { record: { ...BASE, rights: "pending" }, facts: READY },
  approval_not_granted: { record: { ...BASE, approval: "not_approved" }, facts: READY },
  not_published: { record: { ...BASE, published: false }, facts: READY },
  unrecognised_state: { record: UNRECOGNISED, facts: READY },
  no_image_source: { record: BASE, facts: { ...READY, src: null } },
  alt_text_not_recorded: { record: BASE, facts: { ...READY, altText: null } },
  dimensions_not_measured: { record: { ...BASE, width: 0 }, facts: READY },
};

const REASONS = Object.keys(WITHHELD_CASES) as WithheldReason[];

function caseFor(reason: WithheldReason): {
  readonly record: SlotRecord;
  readonly facts: SlotFacts;
} {
  const entry = WITHHELD_CASES[reason];
  if (entry === undefined) throw new Error(`no fixture for ${reason}`);
  return entry;
}

function view(
  assetId: string,
  surface: string,
  record: SlotRecord,
  facts: SlotFacts,
): MediaSlotView {
  return { assetId, facts, record, surface };
}

/** The visible sentence of a rendered paragraph, without any attribute noise. */
function sentenceOf(html: string): string {
  const match = /<p[^>]*>([\s\S]*?)<\/p>/.exec(html);
  // `exec` returns `null` on a miss and the captured group is `| undefined` under
  // `noUncheckedIndexedAccess`, so both are named rather than asserted away.
  if (match === null || match[1] === undefined)
    throw new Error(`no paragraph was rendered: ${html}`);
  return match[1];
}

/*
 * SR-02 as a matcher rather than three string checks: the attributes a refusal used to publish were
 * `data-asset-id`, `data-surface` and `data-reason`, and a class match means a reintroduction under any of
 * the three names — or a new `data-*` identity attribute invented for the same purpose — is red without
 * this file being edited again. The requirement is "the page discloses nothing about which asset is
 * withheld or why", not "these three spelled attributes are absent".
 */
const DISCLOSURE_ATTRIBUTE = /\sdata-(?:asset-id|surface|reason)=/;

describe("MediaSlot — the withheld branch", () => {
  it.each(REASONS)("renders a labelled refusal, and no image, for %s", (reason) => {
    const { record, facts } = caseFor(reason);
    const html = renderToStaticMarkup(<MediaSlot facts={facts} record={record} />);
    expect(html).not.toContain("<img");
    expect(html).not.toContain('as="image"');
    expect(html).toContain('data-slot="media-withheld"');
    // Structural labels are English and say so; §4.2 makes the shell bilingual and the Arabic
    // editorial copy has not been supplied.
    expect(html).toContain('lang="en"');
    // The reason is a value the decision carries (`src/lib/media/slot.test.ts` asserts the union per
    // reason); the id and the placement are register facts. None of the three reaches a browser.
    expect(html).not.toMatch(DISCLOSURE_ATTRIBUTE);
    expect(html).not.toContain(reason);
    expect(html).not.toContain("NDM-TEST-001");
    const sentence = sentenceOf(html);
    expect(sentence.length).toBeGreaterThan(20);
    expect(sentence.endsWith(".")).toBe(true);
  });

  it("renders no dimensions and no caption into a refusal", () => {
    const { record, facts } = caseFor("rights_not_cleared");
    const html = renderToStaticMarkup(<MediaSlot facts={facts} record={record} />);
    expect(html).not.toContain("width=");
    expect(html).not.toContain("height=");
    expect(html).not.toContain("Silver dinar");
  });

  it("ignores a source smuggled in as an extra prop", () => {
    // There is no `src` on MediaSlotProps, so a caller cannot pass one legitimately. This checks the
    // runtime claim as well: an untyped caller that spreads hostile keys still gets a sentence, because
    // the component reads its pixels out of the decision and nothing else.
    //
    // The annotation is load-bearing twice over: it keeps `"unknown"` inside `RightsState` instead of
    // widening it to `string`, and it says out loud that `alt`, `src` and `surface` are extras the
    // component's own type does not accept — `surface` stopped being a prop exactly because there is no
    // longer anywhere in this component that may print it.
    const hostile: MediaSlotProps & {
      readonly alt: string;
      readonly src: string;
      readonly surface: string;
    } = {
      alt: "invented caption",
      facts: READY,
      record: { ...BASE, rights: "unknown" },
      src: "/api/media/NDM-TEST-001",
      surface: "Coins",
    };
    const html = renderToStaticMarkup(<MediaSlot {...hostile} />);
    expect(html).not.toContain("<img");
    expect(html).not.toContain('as="image"');
    expect(html).toContain('data-slot="media-withheld"');
    expect(html).not.toMatch(DISCLOSURE_ATTRIBUTE);
    expect(html).not.toContain("invented caption");
    expect(html).not.toContain("Coins");
  });
});

describe("MediaSlot — the image branch", () => {
  it("draws exactly the served copy, the recorded alt text and the measured pixels", () => {
    const html = renderToStaticMarkup(<MediaSlot facts={READY} record={BASE} />);
    expect(html).toContain("<img");
    expect(html).toContain('src="/api/media/NDM-TEST-001"');
    expect(html).toContain('alt="Silver dinar, obverse and reverse"');
    expect(html).toContain('width="1200"');
    expect(html).toContain('height="800"');
    // The served asset's id is in its locator by design — `/api/media/<id>` is the address the manifest
    // gives it — but it is not additionally stamped on the element, and the placement never is.
    expect(html).not.toMatch(DISCLOSURE_ATTRIBUTE);
    expect(html).not.toContain("media-withheld");
  });

  it("is the only branch that can carry a source at all", () => {
    const served = renderToStaticMarkup(<MediaSlot facts={READY} record={BASE} />);
    const withheld = renderToStaticMarkup(
      <MediaSlot facts={{ ...READY, src: null }} record={BASE} />,
    );
    expect(served.match(/<img/g)?.length).toBe(1);
    expect(withheld.includes("<img")).toBe(false);
  });
});

describe("MediaSlotGroup", () => {
  it("renders nothing at all for a route the catalog never bound", () => {
    // An empty list is not a section with zero claims in it: there is no measured number to state, and
    // a heading about servable assets on a page that has no assets would be a fabricated count.
    expect(renderToStaticMarkup(<MediaSlotGroup views={[]} />)).toBe("");
  });

  it("states the two counts it can measure, in the grammar the numbers require", () => {
    const single = view("NDM-TEST-001", "Coins", caseFor("rights_not_cleared").record, READY);
    expect(
      renderToStaticMarkup(<MediaSlotGroup views={[single]} />),
    ).toContain(
      "Of 1 catalogued surface bound to this route, 0 are cleared for public serving.",
    );

    const views = [
      single,
      view("NDM-TEST-002", "Heritage objects", BASE, {
        ...READY,
        src: "/api/media/NDM-TEST-002",
      }),
      view("NDM-TEST-003", "Stories", caseFor("alt_text_not_recorded").record, {
        ...READY,
        altText: null,
      }),
    ];
    const html = renderToStaticMarkup(<MediaSlotGroup views={views} />);
    expect(html).toContain(
      "Of 3 catalogued surfaces bound to this route, 1 is cleared for public serving.",
    );
    expect(html.match(/<img/g)?.length).toBe(1);
    expect(html.match(/media-withheld/g)?.length).toBe(2);
    /*
     * `<li ` with the space, not `<li`: React 19's static renderer emits a
     * `<link rel="preload" as="image">` hint beside an `<img>` it draws, and a bare `<li` matches that
     * element too. Measured, not guessed — the first run of this assertion counted four list items in a
     * three-view group, and the extra one was the preload hint. It is also why the refusal tests assert
     * the absence of `as="image"` alongside `<img`: a leaked picture would leak its prefetch hint too,
     * and a guard that only looks for one of the two is a guard with a hole in it.
     */
    expect(html.match(/<li /g)?.length).toBe(3);
    expect(html).toContain('data-slot="media-tally"');
  });

  it("keeps two placements of one asset as two slots, and names neither placement", () => {
    const views = [
      view("NDM-TEST-001", "Homepage hero", caseFor("not_published").record, READY),
      view("NDM-TEST-001", "Museum entrance", caseFor("not_published").record, READY),
    ];
    const html = renderToStaticMarkup(<MediaSlotGroup views={views} />);
    // The surface still separates the two items — that is what the React key is for, and a group that
    // collapsed them would report one refusal where the catalog bound two. It no longer appears in the
    // markup (SR-02): the tally counts surfaces without naming them.
    expect(html.match(/media-withheld/g)?.length).toBe(2);
    expect(html).not.toMatch(DISCLOSURE_ATTRIBUTE);
    expect(html).not.toContain("Homepage hero");
    expect(html).not.toContain("Museum entrance");
    expect(html).toContain("Of 2 catalogued surfaces bound to this route, 0 are cleared");
  });
});
