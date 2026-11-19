import type { CollectionConfig } from "payload";

export const ArtifactCountryRelationships: CollectionConfig = {
  slug: "artifact-country-relationships",
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
      required: true,
    },
    {
      name: "country",
      type: "relationship",
      relationTo: "countries",
      required: true,
    },
    {
      name: "relationshipType",
      type: "select",
      required: true,
      options: [
        "Issued In",
        "Produced In",
        "Originated In",
        "Found In",
        "Associated With",
        "Used In",
      ],
    },
    { name: "isPrimaryDisplay", type: "checkbox", defaultValue: false },
  ],
};
