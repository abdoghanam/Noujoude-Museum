import { describe, expect, it } from "vitest";

// Phase 5 invariant: an image may not be served without recorded alt text.
type AltTextStatus = "Not Recorded" | "Draft" | "Reviewed" | "Approved";

interface MediaAsset {
  readonly altText: string | null;
  readonly altTextStatus: AltTextStatus;
}

function mayServeImage(asset: MediaAsset): boolean {
  return asset.altText !== null && asset.altText.trim().length > 0 && asset.altTextStatus === "Approved";
}

describe("alt-text workflow", () => {
  it("no alt text -> not servable", () => {
    expect(mayServeImage({ altText: null, altTextStatus: "Approved" })).toBe(false);
  });

  it("empty alt text -> not servable", () => {
    expect(mayServeImage({ altText: "   ", altTextStatus: "Approved" })).toBe(false);
  });

  it("not approved status -> not servable", () => {
    expect(mayServeImage({ altText: "A coin", altTextStatus: "Draft" })).toBe(false);
  });

  it("approved with alt text -> servable", () => {
    expect(mayServeImage({ altText: "A coin", altTextStatus: "Approved" })).toBe(true);
  });
});