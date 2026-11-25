import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const ProvenanceEvents: CollectionConfig = {
  slug: "provenance-events",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwnerOrAdmin,
  },
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    { name: "eventDate", type: "date" },
    { name: "description", type: "textarea", required: true, localized: true },
    {
      name: "sources",
      type: "relationship",
      relationTo: "sources",
      hasMany: true,
    },
  ],
};
