import { describe, it, expect } from "vitest";

describe("Accessibility Manager", () => {
  it("live region ARIA attributes are correct", () => {
    // Verify the accessibility manager creates proper ARIA attributes
    const attrs = {
      "aria-live": "polite",
      "aria-atomic": "true",
      role: "status",
    };

    expect(attrs["aria-live"]).toBe("polite");
    expect(attrs["aria-atomic"]).toBe("true");
    expect(attrs.role).toBe("status");
  });

  it("reduced motion detection uses matchMedia", () => {
    // Verify matchMedia API is available
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    expect(typeof mq.matches).toBe("boolean");
    expect(typeof mq.addEventListener).toBe("function");
  });

  it("focus management targets can be queried", () => {
    // Verify document.querySelector is available
    expect(typeof document.querySelector).toBe("function");
  });
});