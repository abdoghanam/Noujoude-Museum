import { defineConfig } from "vitest/config";
import path from "node:path";

// Test organization is an engineering default the Standard explicitly assigns to
// us (Technology & Security Standard §13), not an Owner decision.
//
// Layout mirrors the required check list in Standard §12:
//   src/**/*.test.ts        unit — domain rules, validators, state machines
//   src/**/*.integration.ts integration — DB, hooks, access control, storage
//   tests/e2e/**            Playwright (own runner, not this config)
//   tests/a11y/**           axe-core automation (own runner)
export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/*.integration.ts",
      "tests/rbac/**/*.test.ts",
    ],
    exclude: [
      "node_modules",
      ".next",
      "reference/**",
      "Noujoude.photo/**",
      "tests/e2e/**",
    ],
    setupFiles: ["tests/setup/env.ts"],
    // Negative-permission tests are mandatory per Directive §15; they must not be
    // silently skipped when a database is unavailable.
    passWithNoTests: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**"],
      exclude: ["src/generated/**", "**/*.d.ts", "**/*.test.ts"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@generated": path.resolve(__dirname, "./src/generated"),
    },
  },
});
