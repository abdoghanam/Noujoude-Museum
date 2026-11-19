import { describe, expect, it } from "vitest";

import { NoopAiGateway } from "./ai-gateway";

describe("AI gateway", () => {
  const eligible = {
    publishedInLocale: true,
    rightsCleared: true,
    publiclyExhibitable: true,
    aiKnowledgeEligible: true,
    notHidden: true,
  };

  it("noop gateway reports unavailable", async () => {
    const gw = new NoopAiGateway();
    const res = await gw.answer({
      locale: "en",
      question: "test",
      contextEntityIds: [],
      eligibility: eligible,
    });
    expect(res.available).toBe(false);
    expect(res.answer).toBeNull();
    expect(res.citations).toEqual([]);
  });
});
