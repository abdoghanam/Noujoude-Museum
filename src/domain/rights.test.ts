import { describe, expect, it } from "vitest";

import {
  type MediaRecord,
  decidePublicServing,
  placeholderFor,
} from "@/domain/rights";

const record = (over: Partial<MediaRecord> = {}): MediaRecord => ({
  // The defaults below are the measured state of all 82 catalogued assets in
  // `docs/ASSET_INVENTORY_AUDIT.csv` (columns 12 and 13): rights unknown, approval not granted.
  assetId: "NDM-AST-001",
  rights: "unknown",
  approval: "not_approved",
  published: false,
  ...over,
});

describe("STT-002: uncleared media may not be served publicly (§20.4, line 3086)", () => {
  it("denies the current real state of the library", () => {
    expect(decidePublicServing(record())).toEqual({
      serve: false,
      denial: "rights_not_cleared",
    });
  });

  it("denies pending rights and unknown rights alike", () => {
    expect(decidePublicServing(record({ rights: "pending" })).denial).toBe(
      "rights_not_cleared",
    );
    expect(decidePublicServing(record({ rights: "unknown" })).denial).toBe(
      "rights_not_cleared",
    );
  });

  it("denies cleared rights that no one has approved", () => {
    expect(decidePublicServing(record({ rights: "cleared" })).denial).toBe(
      "approval_not_granted",
    );
  });

  it("denies an approved, cleared asset that is not published", () => {
    expect(
      decidePublicServing(record({ rights: "cleared", approval: "approved" }))
        .denial,
    ).toBe("not_published");
  });

  it("serves only the conjunction of cleared, approved and published", () => {
    expect(
      decidePublicServing(
        record({ rights: "cleared", approval: "approved", published: true }),
      ),
    ).toEqual({ serve: true, denial: null });
  });

  // Fail-closed: a value outside the enum must not fall through to `serve: true`.
  it("denies an unrecognised state instead of allowing it", () => {
    const smuggled = {
      ...record(),
      rights: "probably_fine",
    } as unknown as MediaRecord;
    expect(decidePublicServing(smuggled)).toEqual({
      serve: false,
      denial: "unrecognised_state",
    });
  });
});

describe("a blocked slot renders a reason, never a fabricated object (§6.1 acceptance criteria)", () => {
  it("returns no placeholder for a serveable record", () => {
    expect(
      placeholderFor(
        record({ rights: "cleared", approval: "approved", published: true }),
      ),
    ).toBeNull();
  });

  it("carries the asset identity and the denial, and nothing that reads as content", () => {
    expect(placeholderFor(record())).toEqual({
      kind: "unpopulated",
      assetId: "NDM-AST-001",
      reason: "rights_not_cleared",
    });
  });

  it("has no count, caption or alt text to invent", () => {
    const slot = placeholderFor(record());
    expect(Object.keys(slot ?? {})).toEqual(["kind", "assetId", "reason"]);
  });
});
