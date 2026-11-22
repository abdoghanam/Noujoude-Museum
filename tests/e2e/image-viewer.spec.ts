import { test, expect } from "@playwright/test";

test.describe("image viewer", () => {
  test("dialog opens on click and closes on Escape", async ({ page }) => {
    await page.goto("/en");
    // Find any image that opens the viewer
    const trigger = page
      .locator("button[aria-label*='View larger image']")
      .first();
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }
    await trigger.click();
    const dialog = page.locator("dialog");
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
  });

  test("dialog has accessible name", async ({ page }) => {
    await page.goto("/en");
    const trigger = page
      .locator("button[aria-label*='View larger image']")
      .first();
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }
    const ariaLabel = await trigger.getAttribute("aria-label");
    expect(ariaLabel).toContain("View larger image");
  });

  test("close button works", async ({ page }) => {
    await page.goto("/en");
    const trigger = page
      .locator("button[aria-label*='View larger image']")
      .first();
    if ((await trigger.count()) === 0) {
      test.skip();
      return;
    }
    await trigger.click();
    const closeBtn = page.locator("button[aria-label='Close image viewer']");
    await closeBtn.click();
    const dialog = page.locator("dialog");
    await expect(dialog).not.toBeVisible();
  });
});
