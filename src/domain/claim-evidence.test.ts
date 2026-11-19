import { describe, expect, it } from "vitest";

// Phase 5 invariant: every factual claim must link to >=1 evidence record
// with a reviewer and approval state. This pure helper enforces the shape.

interface Claim {
  readonly text: string;
  readonly evidenceIds: readonly string[];
  readonly reviewer: string | null;
  readonly approvalState:
    "Unreviewed" | "In Review" | "Approved" | "Disputed" | "Rejected";
}

function isClaimPublishable(claim: Claim): boolean {
  return (
    claim.evidenceIds.length >= 1 &&
    claim.reviewer !== null &&
    claim.approvalState === "Approved"
  );
}

describe("claim-evidence linkage", () => {
  it("a claim with no evidence is not publishable", () => {
    const claim: Claim = {
      text: "Some claim",
      evidenceIds: [],
      reviewer: "reviewer-1",
      approvalState: "Approved",
    };
    expect(isClaimPublishable(claim)).toBe(false);
  });

  it("a claim without reviewer is not publishable", () => {
    const claim: Claim = {
      text: "Some claim",
      evidenceIds: ["src-1"],
      reviewer: null,
      approvalState: "Approved",
    };
    expect(isClaimPublishable(claim)).toBe(false);
  });

  it("a claim not approved is not publishable", () => {
    const claim: Claim = {
      text: "Some claim",
      evidenceIds: ["src-1"],
      reviewer: "reviewer-1",
      approvalState: "In Review",
    };
    expect(isClaimPublishable(claim)).toBe(false);
  });

  it("a fully evidenced and approved claim is publishable", () => {
    const claim: Claim = {
      text: "Some claim",
      evidenceIds: ["src-1", "src-2"],
      reviewer: "reviewer-1",
      approvalState: "Approved",
    };
    expect(isClaimPublishable(claim)).toBe(true);
  });
});
