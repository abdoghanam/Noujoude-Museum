import { describe, it, expect } from "vitest";
import { hasPermission, canPerformAction } from "@/payload/access/permissions";

const ALL_ROLES = [
  "owner",
  "system_administrator",
  "museum_director",
  "curator",
  "editor",
  "publisher",
  "translator",
  "media_manager",
  "researcher",
  "public_visitor",
  "ai_service_principal",
] as const;

const ALL_ACTIONS = [
  "view", "create", "edit", "duplicate", "submit_for_review",
  "review", "verify_claims", "approve", "publish", "unpublish",
  "archive", "restore", "delete", "manage_users", "manage_roles",
  "manage_settings", "manage_integrations", "view_audit", "export_data",
] as const;

describe("Canonical Permission Matrix", () => {
  it("has exactly 11 roles", () => {
    expect(ALL_ROLES.length).toBe(11);
  });

  it("has exactly 19 actions", () => {
    expect(ALL_ACTIONS.length).toBe(19);
  });

  it("owner has all 19 permissions", () => {
    for (const action of ALL_ACTIONS) {
      expect(hasPermission("owner", action)).toBe(true);
    }
  });

  it("system_administrator does NOT have manage_roles", () => {
    expect(hasPermission("system_administrator", "manage_roles")).toBe(false);
  });

  it("system_administrator does NOT have delete", () => {
    expect(hasPermission("system_administrator", "delete")).toBe(false);
  });

  it("system_administrator HAS manage_users (account management)", () => {
    expect(hasPermission("system_administrator", "manage_users")).toBe(true);
  });

  it("system_administrator does NOT have manage_roles", () => {
    expect(hasPermission("system_administrator", "manage_roles")).toBe(false);
  });

  it("system_administrator does NOT have verify_claims", () => {
    expect(hasPermission("system_administrator", "verify_claims")).toBe(false);
  });

  it("system_administrator does NOT have publish", () => {
    expect(hasPermission("system_administrator", "publish")).toBe(false);
  });

  it("system_administrator does NOT have approve", () => {
    expect(hasPermission("system_administrator", "approve")).toBe(false);
  });

  it("public_visitor only has view", () => {
    for (const action of ALL_ACTIONS) {
      if (action === "view") {
        expect(hasPermission("public_visitor", action)).toBe(true);
      } else {
        expect(hasPermission("public_visitor", action)).toBe(false);
      }
    }
  });

  it("ai_service_principal only has view", () => {
    for (const action of ALL_ACTIONS) {
      if (action === "view") {
        expect(hasPermission("ai_service_principal", action)).toBe(true);
      } else {
        expect(hasPermission("ai_service_principal", action)).toBe(false);
      }
    }
  });

  it("curator has verify_claims", () => {
    expect(hasPermission("curator", "verify_claims")).toBe(true);
  });

  it("curator does NOT have publish", () => {
    expect(hasPermission("curator", "publish")).toBe(false);
  });

  it("editor does NOT have verify_claims", () => {
    expect(hasPermission("editor", "verify_claims")).toBe(false);
  });

  it("editor does NOT have publish", () => {
    expect(hasPermission("editor", "publish")).toBe(false);
  });

  it("publisher has publish", () => {
    expect(hasPermission("publisher", "publish")).toBe(true);
  });

  it("publisher does NOT have edit", () => {
    expect(hasPermission("publisher", "edit")).toBe(false);
  });

  it("translator does NOT have verify_claims", () => {
    expect(hasPermission("translator", "verify_claims")).toBe(false);
  });

  it("media_manager does NOT have verify_claims", () => {
    expect(hasPermission("media_manager", "verify_claims")).toBe(false);
  });

  it("media_manager does NOT have approve", () => {
    expect(hasPermission("media_manager", "approve")).toBe(false);
  });

  it("researcher does NOT have approve", () => {
    expect(hasPermission("researcher", "approve")).toBe(false);
  });

  it("researcher does NOT have publish", () => {
    expect(hasPermission("researcher", "publish")).toBe(false);
  });

  it("deny-by-default for unknown role", () => {
    const result = canPerformAction({ role: "unknown_role" }, "view");
    expect(result).toBe(false);
  });

  it("deny-by-default for null user", () => {
    const result = canPerformAction(null, "view");
    expect(result).toBe(false);
  });

  it("deny-by-default for undefined user", () => {
    const result = canPerformAction(undefined, "view");
    expect(result).toBe(false);
  });

  it("deny-by-default for user without role", () => {
    const result = canPerformAction({}, "view");
    expect(result).toBe(false);
  });
});