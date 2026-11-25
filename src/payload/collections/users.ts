import type { CollectionConfig, FieldAccess } from "payload";

import { isOwner, isOwnerOrAdmin } from "../access";

// Field-level access for role field: only Owner can change roles
const roleFieldAccess: FieldAccess = ({ req }) => {
  return req.user?.role === "owner";
};

// Owner protection: prevent deletion/demotion of Owner
const ownerProtectionDelete = async ({ req, id }: { req: { user: { role?: string | null; id?: string | number } | null }; id?: string | number }) => {
  if (!id) return false;
  const idStr = String(id);
  // Only Owner can delete, and cannot delete themselves
  if (req.user?.role !== "owner") return false;
  // Prevent self-deletion
  if (req.user?.id === idStr || req.user?.id === id) return false;
  return true;
};

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email" },
  access: {
    read: isOwnerOrAdmin,
    create: isOwner, // Only Owner can create users
    update: ({ req }) => {
      // Owner can update anyone; System Admin can update non-role fields
      if (req.user?.role === "owner") return true;
      if (req.user?.role === "system_administrator") {
        // System admin can update but not role field (handled by field access)
        return true;
      }
      return false;
    },
    delete: ownerProtectionDelete,
  },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Owner / Institutional Authority", value: "owner" },
        { label: "System Administrator", value: "system_administrator" },
        { label: "Museum Director", value: "museum_director" },
        { label: "Curator", value: "curator" },
        { label: "Editor", value: "editor" },
        { label: "Publisher", value: "publisher" },
        { label: "Translator / Language Editor", value: "translator" },
        { label: "Media Manager", value: "media_manager" },
        { label: "Researcher / Contributor", value: "researcher" },
        { label: "Public Visitor", value: "public_visitor" },
        { label: "AI Service Principal", value: "ai_service_principal" },
      ],
      defaultValue: "editor",
      access: {
        // Only Owner can change roles
        update: roleFieldAccess,
        create: roleFieldAccess,
      },
    },
  ],
};