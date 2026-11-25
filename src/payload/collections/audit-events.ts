import type { CollectionConfig } from "payload";

import { isOwner, isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const AuditEvents: CollectionConfig = {
  slug: "audit-event",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwner,
  },
  dbName: "audit_event",
  admin: { useAsTitle: "id" },
  // Append-only: enforced by DB grants + trigger + RLS (ADR-019).
  fields: [
    { name: "entityType", type: "text", required: true },
    { name: "entityId", type: "text", required: true },
    { name: "action", type: "text", required: true },
    { name: "actor", type: "text" },
    { name: "occurredAt", type: "date", required: true },
    { name: "payload", type: "json" },
  ],
};
