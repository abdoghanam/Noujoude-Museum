// Noujoude — AI Curator gateway (Phase 7).
//
// Governance: retrieval is permission-gated BEFORE any model call (ADR-017).
// Eligibility filter: published-in-locale ∧ rights-cleared ∧ publicly-exhibitable
// ∧ ai-knowledge-eligible ∧ not Hidden/Not Public.

import { isEligible, sanitizeQuestion, isOutOfScope } from "./ai-eligibility";

export interface AiGatewayRequest {
  readonly locale: "en" | "ar";
  readonly question: string;
  readonly contextEntityIds: readonly string[];
  readonly eligibility: {
    readonly publishedInLocale: boolean;
    readonly rightsCleared: boolean;
    readonly publiclyExhibitable: boolean;
    readonly aiKnowledgeEligible: boolean;
    readonly notHidden: boolean;
  };
}

export interface AiGatewayResponse {
  readonly available: boolean;
  readonly answer: string | null;
  readonly citations: readonly string[];
  readonly uncertainty: string;
  readonly refused: boolean;
  readonly refusalReason?: string;
  readonly conflictingSources: readonly string[];
  readonly escalation: "none" | "human_review";
}

export interface AiGateway {
  answer(request: AiGatewayRequest): Promise<AiGatewayResponse>;
}

// Evaluation classes (S-13, 9 classes).
export type EvaluationClass =
  | "Factual Accuracy"
  | "Citation Presence"
  | "Citation Correctness"
  | "Uncertainty Handling"
  | "Out-of-Scope Refusal"
  | "Prompt Injection Resistance"
  | "Unauthorized Disclosure"
  | "Conflicting Source Handling"
  | "Misstates Uncertainty";

export class NoopAiGateway implements AiGateway {
  async answer(request: AiGatewayRequest): Promise<AiGatewayResponse> {
    const sanitized = sanitizeQuestion(request.question);

    if (isOutOfScope(sanitized)) {
      return {
        available: false,
        answer: null,
        citations: [],
        uncertainty:
          "This question is outside the scope of the museum's published knowledge.",
        refused: true,
        refusalReason: "out_of_scope",
        conflictingSources: [],
        escalation: "none",
      };
    }

    if (!isEligible(request.eligibility)) {
      return {
        available: false,
        answer: null,
        citations: [],
        uncertainty:
          "No eligible knowledge sources are available for this question.",
        refused: true,
        refusalReason: "ineligible",
        conflictingSources: [],
        escalation: "human_review",
      };
    }

    return {
      available: false,
      answer: null,
      citations: [],
      uncertainty:
        "The AI Curator is not configured. No inference provider is active, so no answer is generated.",
      refused: false,
      conflictingSources: [],
      escalation: "none",
    };
  }
}

// Default gateway: no-op until a provider is configured (OID-19).
export const defaultAiGateway: AiGateway = new NoopAiGateway();
