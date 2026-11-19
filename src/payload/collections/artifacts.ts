import type { CollectionConfig } from "payload";

export const Artifacts: CollectionConfig = {
  slug: "artifacts",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "shortDescription", type: "textarea", localized: true },
    { name: "longDescription", type: "richText", localized: true },
    {
      name: "artifactType",
      type: "select",
      options: [
        "Stamp",
        "First Day Cover",
        "Coin",
        "Document",
        "Letter",
        "Souvenir",
        "Heritage Object",
        "Artifact",
      ],
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
    },
    {
      name: "collections",
      type: "relationship",
      relationTo: "collections",
      hasMany: true,
    },
    {
      name: "countries",
      type: "relationship",
      relationTo: "countries",
      hasMany: true,
    },
    {
      name: "eras",
      type: "relationship",
      relationTo: "eras",
      hasMany: true,
    },
    {
      name: "stories",
      type: "relationship",
      relationTo: "stories",
      hasMany: true,
    },
    {
      name: "claimReviewState",
      type: "select",
      options: ["Unreviewed", "In Review", "Approved", "Disputed"],
      defaultValue: "Unreviewed",
    },
    {
      name: "editorialState",
      type: "select",
      options: ["Draft", "In Review", "Approved", "Published"],
      defaultValue: "Draft",
    },
    {
      name: "translationState",
      type: "select",
      options: [
        "Not Started",
        "In Progress",
        "Reviewed",
        "Approved",
        "Published",
      ],
      defaultValue: "Not Started",
    },
    {
      name: "publicationState",
      type: "select",
      options: ["Unpublished", "Published", "Scheduled", "Withdrawn"],
      defaultValue: "Unpublished",
    },
  ],
};
