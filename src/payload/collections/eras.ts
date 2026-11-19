import type { CollectionConfig } from "payload";

export const Eras: CollectionConfig = {
  slug: "eras",
  admin: { useAsTitle: "name" },
  fields: [
    { name: "name", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "startYear", type: "number" },
    { name: "endYear", type: "number" },
    { name: "description", type: "textarea", localized: true },
  ],
};
