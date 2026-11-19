import { test, expect } from "@playwright/test";

test.describe("Phase 4 invariants", () => {
  test("withheld markers present on detail pages", async ({ page }) => {
    await page.goto("/en/artifacts/example");
    const body = await page.content();
    expect(body).toMatch(/No artifact records have been published|withheld/i);
  });

  test("no commerce UI on canonical routes", async ({ page }) => {
    for (const path of ["/en", "/en/collections", "/en/worlds", "/en/worlds/morocco", "/en/stories"]) {
      await page.goto(path);
      const body = await page.content();
      expect(body).not.toMatch(/buy now|checkout|shopping cart|add to cart|price:/i);
    }
  });

  test("malformed slug returns 404", async ({ page }) => {
    const res = await page.goto("/en/artifacts/BAD_SLUG");
    expect(res?.status()).toBe(404);
  });

  test("noindex on shells", async ({ page }) => {
    await page.goto("/en");
    const robots = await page.locator('meta[name="robots"]').getAttribute("content");
    expect(robots).toContain("noindex");
  });
});