import { defineConfig, devices } from "@playwright/test";

// Playwright covers the "critical journeys in English and Arabic" required by
// Technology & Security Standard §2.2 and §12 item 5, plus the accessibility
// automation of §8 and the performance routes of §9.
//
// Locale is not a cookie preference here: Master Spec §4.2 makes locale-prefixed
// routes mandatory, so each project navigates the real URL shape it ships.
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  // Negative-permission tests must not be flaked away (Directive §15).
  retries: process.env.CI ? 2 : 0,
  forbidOnly: !!process.env.CI,
  reporter: [["list"], ["html", { open: "never" }]],

  projects: [
    {
      name: "en-desktop-chrome",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: BASE,
        locale: "en-US",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "ar-desktop-rtl-chrome",
      use: {
        ...devices["Desktop Chrome"],
        baseURL: `${BASE}/ar`,
        locale: "ar-AE",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "en-mobile-chrome",
      use: { ...devices["Pixel 7"], baseURL: BASE, locale: "en-US" },
    },
    {
      name: "ar-mobile-rtl-chrome",
      use: { ...devices["iPhone 13"], baseURL: `${BASE}/ar`, locale: "ar-AE" },
    },
    {
      name: "en-desktop-firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: BASE,
        locale: "en-US",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "ar-desktop-rtl-firefox",
      use: {
        ...devices["Desktop Firefox"],
        baseURL: `${BASE}/ar`,
        locale: "ar-AE",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "en-desktop-webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: BASE,
        locale: "en-US",
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: "ar-desktop-rtl-webkit",
      use: {
        ...devices["Desktop Safari"],
        baseURL: `${BASE}/ar`,
        locale: "ar-AE",
        viewport: { width: 1440, height: 900 },
      },
    },
  ],

  webServer: process.env.PLAYWRIGHT_SKIP_WEBSERVER
    ? undefined
    : {
        command: "pnpm dev",
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});

// Invariance assertions expected in every spec file — recorded so review can
// check they exist rather than trusting that they do:
//   1. No route renders price, "Buy Now", cart, checkout, seller or stock UI.
//      (Master Spec §2.6, §6.7 line 725, Appendix G.3 line 3702)
//   2. Arabic pages set dir="rtl" on the document and use logical CSS properties.
//      (Master Spec §10 lines 1473-1481)
//   3. Language switching lands on the equivalent page only when that
//      translation is published; otherwise the defined safe fallback appears and
//      no language is silently substituted. (Master Spec §10 lines 1457-1461)
//   4. Unpublished, draft, restricted and preview URLs are not indexable and are
//      refused server-side, not merely hidden. (Directive §8, Standard §4.2)
//   5. hreflang is never emitted toward a missing or unpublished translation.
//      (Directive §11)
//   6. Keyboard-only traversal reaches every declared control; Escape closes the
//      image viewer and focus returns to the invoking element. (Master Spec §6.8)
