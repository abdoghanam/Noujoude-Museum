import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const RightsRecords: CollectionConfig = {
  slug: "rights-records",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwnerOrAdmin,
  },
  admin: { useAsTitle: "id" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "licence", type: "text" },
    { name: "licensor", type: "text" },
    { name: "territory", type: "text" },
    { name: "term", type: "text" },
    { name: "expiry", type: "date" },
    {
      name: "rightsStatus",
      type: "select",
      options: ["Unknown", "Pending Review", "Cleared", "Restricted", "Denied"],
      defaultValue: "Unknown",
    },
    {
      name: "mediaAssets",
      type: "relationship",
      relationTo: "media-assets",
      hasMany: true,
    },
  ],
};
