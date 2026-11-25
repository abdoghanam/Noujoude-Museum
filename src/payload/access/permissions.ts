// Permission matrix — Noujoude Canonical Roles
// Master Spec §17.4: Baseline role/action matrix

export type CanonicalRole =
  | "owner"
  | "system_administrator"
  | "museum_director"
  | "curator"
  | "editor"
  | "publisher"
  | "translator"
  | "media_manager"
  | "researcher"
  | "public_visitor"
  | "ai_service_principal";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "duplicate"
  | "submit_for_review"
  | "review"
  | "verify_claims"
  | "approve"
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "delete"
  | "manage_users"
  | "manage_roles"
  | "manage_settings"
  | "manage_integrations"
  | "view_audit"
  | "export_data";

// Permission matrix: role -> allowed actions
const PERMISSION_MATRIX: Record<CanonicalRole, Set<PermissionAction>> = {
  owner: new Set([
    "view", "create", "edit", "duplicate", "submit_for_review", "review",
    "verify_claims", "approve", "publish", "unpublish", "archive", "restore",
    "delete", "manage_users", "manage_roles", "manage_settings",
    "manage_integrations", "view_audit", "export_data",
  ]),
  system_administrator: new Set([
    "view", "manage_users", "manage_settings", "manage_integrations", "view_audit",
  ]),
  museum_director: new Set([
    "view", "create", "edit", "duplicate", "submit_for_review", "review",
    "approve", "publish", "unpublish", "archive", "restore",
    "manage_settings", "view_audit", "export_data",
  ]),
  curator: new Set([
    "view", "create", "edit", "duplicate", "submit_for_review",
    "verify_claims", "review", "archive", "restore",
    "view_audit",
  ]),
  editor: new Set([
    "view", "create", "edit", "duplicate", "submit_for_review",
  ]),
  publisher: new Set([
    "view", "publish", "unpublish", "archive", "restore",
  ]),
  translator: new Set([
    "view", "edit", "submit_for_review",
  ]),
  media_manager: new Set([
    "view", "create", "edit", "duplicate", "archive", "restore",
  ]),
  researcher: new Set([
    "view", "create", "edit", "submit_for_review",
  ]),
  public_visitor: new Set(["view"]),
  ai_service_principal: new Set(["view"]),
};

export function hasPermission(role: CanonicalRole, action: PermissionAction): boolean {
  const allowed = PERMISSION_MATRIX[role];
  return allowed ? allowed.has(action) : false;
}

export function canPerformAction(
  user: { role?: string } | null | undefined,
  action: PermissionAction,
): boolean {
  if (!user?.role) return false;
  const role = user.role as CanonicalRole;
  return hasPermission(role, action);
}