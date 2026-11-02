/**
 * src/domain/rights.ts — the public-serving gate for media, as a pure decision.
 *
 * Source of truth: `reference/Noujoude_Master_Specification_EN.md` §20.4 (gate row STT-002, line
 * 3086), which bars uncleared media from public serving, and §13 (lines 1829–1944) for the rights
 * and approval dimensions. `docs/ASSET_INVENTORY_AUDIT.csv` records the current state of all 82
 * catalogued assets: rights `UNKNOWN` / awaiting review and approval `Not Approved` — so under this
 * function every one of them is refused, which is the point of writing the rule as code.
 *
 * Fail-closed is the required direction: an unrecognised state denies rather than allows, because a
 * default-allow gate is a gate that lets whatever it cannot classify through.
 */

export type RightsState = "cleared" | "pending" | "unknown";
export type CuratorialApproval = "approved" | "not_approved" | "unknown";

export interface MediaRecord {
  readonly assetId: string;
  readonly rights: RightsState;
  readonly approval: CuratorialApproval;
  readonly published: boolean;
}

export type ServingDenial =
  | "rights_not_cleared"
  | "approval_not_granted"
  | "not_published"
  | "unrecognised_state";

export interface ServingDecision {
  readonly serve: boolean;
  readonly denial: ServingDenial | null;
}

const RIGHTS_STATES: readonly string[] = ["cleared", "pending", "unknown"];
const APPROVAL_STATES: readonly string[] = [
  "approved",
  "not_approved",
  "unknown",
];

/** The one place the gate is expressed. Every public media surface calls this. */
export function decidePublicServing(record: MediaRecord): ServingDecision {
  if (
    !RIGHTS_STATES.includes(record.rights) ||
    !APPROVAL_STATES.includes(record.approval)
  ) {
    return { serve: false, denial: "unrecognised_state" };
  }
  if (record.rights !== "cleared")
    return { serve: false, denial: "rights_not_cleared" };
  if (record.approval !== "approved")
    return { serve: false, denial: "approval_not_granted" };
  if (!record.published) return { serve: false, denial: "not_published" };
  return { serve: true, denial: null };
}

/**
 * What a blocked slot renders instead of media. §6.1's acceptance criteria require that "Empty or
 * unavailable sections do not render fabricated counts or objects", so the placeholder carries no
 * count, no caption and no implied image — only the reason, for the operator-facing audit trail.
 */
export interface SlotPlaceholder {
  readonly kind: "unpopulated";
  readonly assetId: string;
  readonly reason: ServingDenial;
}

export function placeholderFor(record: MediaRecord): SlotPlaceholder | null {
  const decision = decidePublicServing(record);
  if (decision.serve || decision.denial === null) return null;
  return {
    kind: "unpopulated",
    assetId: record.assetId,
    reason: decision.denial,
  };
}
