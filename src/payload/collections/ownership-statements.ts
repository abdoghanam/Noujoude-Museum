import type { CollectionConfig } from "payload";

export const OwnershipStatements: CollectionConfig = {
  slug: "ownership-statements",
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    { name: "statement", type: "textarea", required: true, localized: true },
    { name: "evidenceSource", type: "relationship", relationTo: "sources" },
    { name: "reviewer", type: "text" },
    { name: "approvedAt", type: "date" },
    {
      name: "state",
      type: "select",
      options: ["Draft", "In Review", "Approved", "Rejected"],
      defaultValue: "Draft",
    },
  ],
};
