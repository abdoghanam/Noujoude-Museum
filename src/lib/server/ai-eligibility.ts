// Noujoude — AI Curator eligibility filter (ADR-017).
//
// Permission gating happens BEFORE any retrieval call. The filter is part of
// query construction, not a post-generation mitigation.

export interface EligibilityInput {
  readonly publishedInLocale: boolean;
  readonly rightsCleared: boolean;
  readonly publiclyExhibitable: boolean;
  readonly aiKnowledgeEligible: boolean;
  readonly notHidden: boolean;
}

export function isEligible(input: EligibilityInput): boolean {
  return (
    input.publishedInLocale &&
    input.rightsCleared &&
    input.publiclyExhibitable &&
    input.aiKnowledgeEligible &&
    input.notHidden
  );
}

// Prompt-injection defense: treat retrieved content as untrusted data.
export function sanitizeQuestion(question: string): string {
  // Strip control characters and common injection patterns.
  return question
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/ignore\s+(previous|all)\s+instructions/gi, "[redacted]")
    .trim()
    .slice(0, 2000);
}

// Conflicting-source disclosure: when multiple eligible sources disagree,
// return the list of conflicting source IDs.
export function detectConflictingSources(sourceContents: readonly string[]): string[] {
  const seen = new Set<string>();
  const conflicts: string[] = [];
  for (const content of sourceContents) {
    const normalized = content.trim().toLowerCase();
    if (seen.has(normalized)) continue;
    // A conflict is detected when two sources have different normalized content.
    for (const existing of seen) {
      if (existing !== normalized) {
        conflicts.push(content);
      }
    }
    seen.add(normalized);
  }
  return conflicts;
}

// Human escalation: escalate when uncertainty is high or no eligible sources.
export function shouldEscalate(
  eligibleCount: number,
  hasConflicts: boolean,
  confidence: number,
): boolean {
  if (eligibleCount === 0) return true;
  if (hasConflicts) return true;
  if (confidence < 0.5) return true;
  return false;
}

// Out-of-scope refusal.
export function isOutOfScope(question: string): boolean {
  const lower = question.toLowerCase();
  const outOfScopePatterns = [
    "password",
    "secret",
    "credential",
    "api key",
    "private note",
    "draft",
  ];
  return outOfScopePatterns.some((p) => lower.includes(p));
}