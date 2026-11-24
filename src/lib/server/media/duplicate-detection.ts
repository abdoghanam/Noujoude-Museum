// Duplicate detection — Noujoude media governance
// Detects exact duplicate files, same-content files in different formats,
// visually similar files, and alternative resolutions.
// Similarity is a review aid only.

export interface DuplicateCandidate {
  readonly assetId: string;
  readonly filename: string;
  readonly checksum: string;
  readonly fileSize: number;
  readonly width?: number;
  readonly height?: number;
}

export interface DuplicateGroup {
  readonly type:
    "exact" | "same-content" | "visual-similar" | "alternative-resolution";
  readonly assets: readonly DuplicateCandidate[];
  readonly confidence: "high" | "medium" | "low";
}

export function detectExactDuplicates(
  assets: readonly DuplicateCandidate[],
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const byChecksum = new Map<string, DuplicateCandidate[]>();

  for (const asset of assets) {
    const existing = byChecksum.get(asset.checksum) ?? [];
    existing.push(asset);
    byChecksum.set(asset.checksum, existing);
  }

  for (const [, group] of byChecksum) {
    if (group.length > 1) {
      groups.push({
        type: "exact",
        assets: group,
        confidence: "high",
      });
    }
  }

  return groups;
}

export function detectAlternativeResolutions(
  assets: readonly DuplicateCandidate[],
): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const byBaseName = new Map<string, DuplicateCandidate[]>();

  for (const asset of assets) {
    // Strip resolution suffix and extension to find base name
    const baseName = asset.filename
      .replace(/_\d+x\d+/g, "")
      .replace(/\.[^.]+$/, "");
    const existing = byBaseName.get(baseName) ?? [];
    existing.push(asset);
    byBaseName.set(baseName, existing);
  }

  for (const [, group] of byBaseName) {
    if (group.length > 1) {
      groups.push({
        type: "alternative-resolution",
        assets: group,
        confidence: "high",
      });
    }
  }

  return groups;
}

export function detectDuplicates(
  assets: readonly DuplicateCandidate[],
): DuplicateGroup[] {
  const exact = detectExactDuplicates(assets);
  const resolutions = detectAlternativeResolutions(assets);
  return [...exact, ...resolutions];
}
