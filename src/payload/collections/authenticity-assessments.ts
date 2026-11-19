import type { CollectionConfig } from "payload";

export const AuthenticityAssessments: CollectionConfig = {
  slug: "authenticity-assessments",
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    { name: "assessment", type: "textarea", required: true, localized: true },
    { name: "method", type: "text" },
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
