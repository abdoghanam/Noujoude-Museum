import type { CollectionConfig } from "payload";

export const ArtifactClaims: CollectionConfig = {
  slug: "artifact-claims",
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    { name: "claim", type: "textarea", required: true, localized: true },
    {
      name: "claimType",
      type: "select",
      options: [
        "Identity",
        "Date",
        "Origin",
        "Provenance",
        "Material",
        "Other",
      ],
    },
    {
      name: "reviewState",
      type: "select",
      options: ["Unreviewed", "In Review", "Approved", "Disputed", "Rejected"],
      defaultValue: "Unreviewed",
    },
    {
      name: "evidence",
      type: "relationship",
      relationTo: "sources",
      hasMany: true,
    },
  ],
};
