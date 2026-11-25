import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const ArtifactCountryRelationships: CollectionConfig = {
  slug: "artifact-country-relationships",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwnerOrAdmin,
  },
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
