import type { CollectionConfig } from "payload";

import { isOwner, isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const Categories: CollectionConfig = {
  slug: "categories",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwner,
  },
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "description", type: "textarea", localized: true },
  ],
};
