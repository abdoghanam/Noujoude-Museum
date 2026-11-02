/**
 * src/lib/media/slot.test.ts — the slot decision table, proved reason by reason.
 *
 * `decideMediaSlot` is the only thing standing between the register and an `<img>` element, so its
 * tests are not "does the function return something" but "does every failure produce the *named*
 * failure, in the right order, with nothing extra attached". The component in
 * `src/ui/media-slot.tsx` has no `src` prop, which means the union returned here is the sole source of
 * pixels — so each branch's exact shape is asserted, not sampled.
 *
 * The cases are written as a `Record<WithheldReason, …>`. That is deliberate: TypeScript refuses to
 * compile the object if a reason is added to the union without a case, and the test body then proves
 * each declared case is actually *reachable* through its own inputs. A reason that no input can produce
 * would otherwise sit in the type, and in `WITHHELD_COPY`, untested forever.
 */

import { describe, expect, it } from "vitest";

import {
  type SlotFacts,
  type SlotRecord,
  type WithheldReason,
  decideMediaSlot,
} from "@/lib/media/slot";

/** The only record in this file that the rights gate lets through. Everything else is a variation. */
const SERVABLE: SlotRecord = {
  assetId: "NDM-TEST-001",
  rights: "cleared",
  approval: "approved",
  published: true,
  width: 1200,
  height: 800,
};

/** Facts a slot can actually draw with: a located served copy and real recorded alt text. */
const READY: SlotFacts = {
  src: "/api/media/NDM-TEST-001",
  altText: "Silver dinar, obverse and reverse, catalogued under NDM-AST-080",
};

/**
 * A state the vocabulary does not contain. The cast is the point: the register's parser can never
 * produce this, but the gate takes `MediaRecord` from any caller, and a caller that hands it something
 * outside the union must be refused rather than served.
 */
const UNRECOGNISED: SlotRecord = {
  ...SERVABLE,
  rights: "revoked",
} as unknown as SlotRecord;

const CASES: Record<
  WithheldReason,
  { readonly record: SlotRecord; readonly facts: SlotFacts }
> = {
  // Step 1 — the legal question, answered by `src/domain/rights.ts`.
  rights_not_cleared: {
    record: { ...SERVABLE, rights: "unknown" },
    facts: READY,
  },
  approval_not_granted: {
    record: { ...SERVABLE, approval: "not_approved" },
    facts: READY,
  },
  not_published: {
    record: { ...SERVABLE, published: false },
    facts: READY,
  },
  unrecognised_state: { record: UNRECOGNISED, facts: READY },
  // Step 2 — cleared, but there is nothing to load.
  no_image_source: { record: SERVABLE, facts: { ...READY, src: null } },
  // Step 3 — cleared and locatable, but no alt text has been recorded.
  alt_text_not_recorded: {
    record: SERVABLE,
    facts: { ...READY, altText: null },
  },
  // Step 4 — everything else passed and the pixels were never measured.
  dimensions_not_measured: { record: { ...SERVABLE, width: 0 }, facts: READY },
};

const ALL_REASONS: readonly WithheldReason[] = Object.keys(
  CASES,
) as WithheldReason[];

/**
 * Indexing a `Record` under `noUncheckedIndexedAccess` yields `| undefined`, and a test that quietly
 * skipped an undefined case would quietly assert nothing. Naming the miss is what makes the case list
 * and the assertions move together.
 */
function caseFor(reason: WithheldReason): {
  readonly record: SlotRecord;
  readonly facts: SlotFacts;
} {
  const entry = CASES[reason];
  if (entry === undefined) throw new Error(`no case is declared for ${reason}`);
  return entry;
}

describe("decideMediaSlot — the withheld branch", () => {
  it.each(ALL_REASONS)("returns %s for its own inputs", (reason) => {
    const { record, facts } = caseFor(reason);
    expect(decideMediaSlot(record, facts)).toEqual({
      kind: "unpopulated",
      assetId: "NDM-TEST-001",
      reason,
    });
  });

  it("covers every reason the union can express", () => {
    // The `Record<WithheldReason, …>` above is what makes this statement compile-checked; the length is
    // the measured count of the vocabulary, so a merged or renamed reason is noticed here.
    expect([...ALL_REASONS].sort()).toEqual([
      "alt_text_not_recorded",
      "approval_not_granted",
      "dimensions_not_measured",
      "no_image_source",
      "not_published",
      "rights_not_cleared",
      "unrecognised_state",
    ]);
  });

  it("carries exactly three keys, never pixels, a caption or a count", () => {
    for (const reason of ALL_REASONS) {
      const { record, facts } = caseFor(reason);
      const decision = decideMediaSlot(record, facts);
      expect(Object.keys(decision).sort()).toEqual([
        "assetId",
        "kind",
        "reason",
      ]);
      if (decision.kind !== "unpopulated")
        throw new Error(`${reason} must not be an image branch`);
      expect(decision).not.toHaveProperty("src");
      expect(decision).not.toHaveProperty("width");
      expect(decision).not.toHaveProperty("height");
    }
  });

  it("asks the legal question first", () => {
    // Every later step is also failing here, and only step 1 is reported: what a visitor sees is the
    // reason the build stopped, not a list of everything else that would also have stopped it.
    const decision = decideMediaSlot(
      {
        ...SERVABLE,
        rights: "pending",
        approval: "unknown",
        width: 0,
        height: -3,
      },
      { src: null, altText: null },
    );
    expect(decision).toEqual({
      kind: "unpopulated",
      assetId: "NDM-TEST-001",
      reason: "rights_not_cleared",
    });
  });

  it("treats a whitespace-only source as no source", () => {
    for (const src of ["", " ", "\n\t"]) {
      const decision = decideMediaSlot(SERVABLE, { ...READY, src });
      expect(decision).toEqual({
        kind: "unpopulated",
        assetId: "NDM-TEST-001",
        reason: "no_image_source",
      });
    }
  });

  /*
   * `alt=""` is HTML's way of asserting that a picture is decorative. This build has no field that
   * records such an assertion — `docs/ASSET_INVENTORY_AUDIT.csv` has an `Alt Text Status` column, not a
   * decorative flag — so an empty string here is an unrecorded label, not a claim of decorativeness, and
   * is refused. The honest fix is a `decorative` field on the record that a human sets; it is not a
   * default in this function. This test is the place that decision becomes visible.
   */
  it("refuses an empty alt string rather than reading it as decorative", () => {
    for (const altText of ["", " "]) {
      expect(decideMediaSlot(SERVABLE, { ...READY, altText })).toEqual({
        kind: "unpopulated",
        assetId: "NDM-TEST-001",
        reason: "alt_text_not_recorded",
      });
    }
  });

  it("refuses dimensions that were never measured, in either axis", () => {
    for (const record of [
      { ...SERVABLE, width: 0 },
      { ...SERVABLE, width: -1 },
      { ...SERVABLE, width: 1.5 },
      { ...SERVABLE, width: Number.NaN },
      { ...SERVABLE, height: 0 },
      { ...SERVABLE, height: Number.NaN },
    ]) {
      expect(decideMediaSlot(record, READY)).toEqual({
        kind: "unpopulated",
        assetId: "NDM-TEST-001",
        reason: "dimensions_not_measured",
      });
    }
  });
});

describe("decideMediaSlot — the image branch", () => {
  it("is reachable only with a cleared, approved, published record plus a source, alt text and pixels", () => {
    expect(decideMediaSlot(SERVABLE, READY)).toEqual({
      kind: "image",
      assetId: "NDM-TEST-001",
      src: "/api/media/NDM-TEST-001",
      alt: "Silver dinar, obverse and reverse, catalogued under NDM-AST-080",
      width: 1200,
      height: 800,
    });
  });

  it("carries exactly the six keys and no more", () => {
    const decision = decideMediaSlot(SERVABLE, READY);
    expect(Object.keys(decision).sort()).toEqual([
      "alt",
      "assetId",
      "height",
      "kind",
      "src",
      "width",
    ]);
  });

  it("reports the reason it stopped rather than serving a best guess", () => {
    // One input changed per case, and each change moves the branch. A gate whose failures all look the
    // same cannot be audited, which is why the reason is part of the contract.
    const failures: readonly [string, SlotRecord, SlotFacts][] = [
      ["rights", { ...SERVABLE, rights: "pending" }, READY],
      ["approval", { ...SERVABLE, approval: "unknown" }, READY],
      ["publication", { ...SERVABLE, published: false }, READY],
      ["source", SERVABLE, { ...READY, src: null }],
      ["alt text", SERVABLE, { ...READY, altText: null }],
      ["pixels", { ...SERVABLE, height: 0 }, READY],
    ];
    const reasons = failures.map(([, record, facts]) => {
      const decision = decideMediaSlot(record, facts);
      return decision.kind === "image" ? "image" : decision.reason;
    });
    expect(reasons).toEqual([
      "rights_not_cleared",
      "approval_not_granted",
      "not_published",
      "no_image_source",
      "alt_text_not_recorded",
      "dimensions_not_measured",
    ]);
  });
});
