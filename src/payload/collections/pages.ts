import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const Pages: CollectionConfig = {
  slug: "pages",
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
    { name: "body", type: "richText", localized: true },
    { name: "seoTitle", type: "text", localized: true },
    { name: "seoDescription", type: "textarea", localized: true },
  ],
};
