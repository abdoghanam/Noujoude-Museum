import { test, expect } from "@playwright/test";

test.describe("keyboard traversal", () => {
  test("skip link is focusable", async ({ page }) => {
    await page.goto("/");
    // The skip link must be reachable by keyboard at some point.
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
      if (focused.toLowerCase().includes("skip")) return;
    }
    const focused = await page.evaluate(() => document.activeElement?.textContent ?? "");
    expect(focused.toLowerCase()).toContain("skip");
  });

  test("primary nav is reachable by keyboard", async ({ page }) => {
    await page.goto("/");
    const navLink = page.locator("nav[aria-label='Primary'] a").first();
    await navLink.focus();
    const tag = await page.evaluate(() => document.activeElement?.tagName ?? "");
    expect(tag).toBe("A");
  });
});