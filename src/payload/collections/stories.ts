import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const Stories: CollectionConfig = {
  slug: "stories",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwnerOrAdmin,
  },
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "introduction", type: "textarea", localized: true },
    { name: "body", type: "richText", localized: true },
    {
      name: "countries",
      type: "relationship",
      relationTo: "countries",
      hasMany: true,
    },
    {
      name: "collections",
      type: "relationship",
      relationTo: "collections",
      hasMany: true,
    },
    {
      name: "status",
      type: "select",
      options: ["Draft", "In Review", "Approved", "Published"],
      defaultValue: "Draft",
    },
  ],
};
