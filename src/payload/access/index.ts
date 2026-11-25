// Payload access control — Noujoude
// Server-side authorization for all protected operations.

import type { Access } from "payload";
import { canPerformAction } from "./permissions";

export const isOwner: Access = ({ req }) => {
  return req.user?.role === "owner";
};

export const isOwnerOrAdmin: Access = ({ req }) => {
  const role = req.user?.role;
  return role === "owner" || role === "system_administrator";
};

// System Administrator has technical account management but NOT role assignment
export const isSystemAdmin: Access = ({ req }) => {
  return req.user?.role === "system_administrator";
};

// Owner only
export const isOwnerOnly: Access = ({ req }) => {
  return req.user?.role === "owner";
};

// Any authenticated user with a valid role
export const isAuthenticated: Access = ({ req }) => {
  return !!req.user?.role;
};

// Deny-by-default for public (no anonymous access to CMS)
export const denyAnonymous: Access = ({ req }) => {
  return !!req.user;
};

export const canRead: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "view");
};

export const canCreate: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "create");
};

export const canUpdate: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "edit");
};

export const canDelete: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "delete");
};

export const canPublish: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "publish");
};

export const canManageUsers: Access = ({ req }) => {
  return canPerformAction(req.user as { role?: string } | null, "manage_users");
};

export const denyAll: Access = () => false;

export const allowAll: Access = () => true;