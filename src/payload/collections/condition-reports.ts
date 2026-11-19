import type { CollectionConfig } from "payload";

export const ConditionReports: CollectionConfig = {
  slug: "condition-reports",
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