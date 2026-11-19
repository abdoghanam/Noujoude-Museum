import type { CollectionConfig } from "payload";

export const VerificationReviews: CollectionConfig = {
  slug: "verification-reviews",
  admin: { useAsTitle: "id" },
  fields: [
    { name: "entityType", type: "text", required: true },
    { name: "entityId", type: "text", required: true },
    { name: "reviewer", type: "relationship", relationTo: "users" },
    {
      name: "result",
      type: "select",
      options: ["Pass", "Fail", "Blocked", "Not Run"],
    },
    { name: "notes", type: "textarea", localized: true },
    { name: "reviewedAt", type: "date" },
  ],
};