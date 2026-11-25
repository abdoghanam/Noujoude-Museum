/**
 * Runtime RBAC Verification Tests
 *
 * These tests exercise the actual Payload access layer through real
 * HTTP/API requests against a disposable test database.
 *
 * Prerequisites:
 * - NDM_ALLOW_INTEGRATION=1
 * - DATABASE_URI pointing to noujoude_test
 * - Approved migrations applied
 * - ADR-019 database privileges verified
 *
 * Run: NDM_ALLOW_INTEGRATION=1 pnpm test:rbac
 */

import { describe, it, expect } from "vitest";

// This file is a placeholder for runtime RBAC tests.
// It requires a real PostgreSQL database connection.
// See tests/setup/env.ts for integration test configuration.

describe("Runtime RBAC Verification", () => {
  it.skip("placeholder — requires PostgreSQL integration", () => {
    // Runtime RBAC tests require a real database connection.
    // They cannot run in the standard node test environment.
    // Set NDM_ALLOW_INTEGRATION=1 and ensure noujoude_test exists.
    expect(true).toBe(true);
  });
});