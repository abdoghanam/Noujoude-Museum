import { test, expect } from "@playwright/test";

test.describe("primary journey", () => {
  test("home -> museum -> worlds -> country", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|ar)$/);
    // Enter the Museum CTA
    const cta = page.getByRole("link", { name: /enter the museum/i });
    if (await cta.count()) {
      await cta.first().click();
      await expect(page).toHaveURL(/\/(en|ar)\/the-museum/);
    }
    await page.goto("/en/worlds");
    await expect(page).toHaveURL(/\/en\/worlds/);
    await page.goto("/en/worlds/morocco");
    await expect(page).toHaveURL(/\/en\/worlds\/morocco/);
  });

  test("malformed artifact slug returns 404", async ({ page }) => {
    const res = await page.goto("/en/artifacts/BAD_SLUG");
    expect(res?.status()).toBe(404);
  });

  test("well-formed but unpublished artifact slug renders empty state", async ({ page }) => {
    const res = await page.goto("/en/artifacts/this-does-not-exist");
    expect(res?.status()).toBe(200);
    await expect(page.getByText(/resolves to nothing/i)).toBeVisible();
  });

  test("no commerce UI on any route", async ({ page }) => {
    for (const path of ["/", "/en", "/en/collections", "/en/worlds"]) {
      await page.goto(path);
      const body = await page.content();
      expect(body).not.toMatch(/buy now|checkout|shopping cart|add to cart/i);
    }
  });
});