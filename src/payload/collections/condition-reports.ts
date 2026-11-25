import type { CollectionConfig } from "payload";

import { isOwner, isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const ConditionReports: CollectionConfig = {
  slug: "condition-reports",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwner,
  },
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    { name: "description", type: "textarea", required: true, localized: true },
    { name: "preservationObservations", type: "textarea", localized: true },
    { name: "assessor", type: "text" },
    { name: "assessedAt", type: "date" },
    {
      name: "state",
      type: "select",
      options: ["Draft", "In Review", "Approved"],
      defaultValue: "Draft",
    },
  ],
};
