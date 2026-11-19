import type { CollectionConfig } from "payload";

export const MediaAssets: CollectionConfig = {
  slug: "media-assets",
  admin: { useAsTitle: "filename" },
  fields: [
    { name: "filename", type: "text", required: true },
    { name: "assetId", type: "text", required: true, unique: true, index: true },
    { name: "mimeType", type: "text" },
    { name: "width", type: "number" },
    { name: "height", type: "number" },
    { name: "sha256", type: "text" },
    { name: "altText", type: "textarea", localized: true },
    {
      name: "altTextStatus",
      type: "select",
      options: ["Not Recorded", "Draft", "Reviewed", "Approved"],
      defaultValue: "Not Recorded",
    },
    {
      name: "readinessState",
      type: "select",
      options: [
        "Not Started",
        "In Progress",
        "Implemented",
        "Verified",
        "Deferred",
        "Not Applicable",
      ],
      defaultValue: "Not Started",
    },
    {
      name: "artifact",
      type: "relationship",
      relationTo: "artifacts",
    },
    {
      name: "rightsRecords",
      type: "relationship",
      relationTo: "rights-records",
      hasMany: true,
    },
  ],
};