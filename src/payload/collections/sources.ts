import type { CollectionConfig } from "payload";

export const Sources: CollectionConfig = {
  slug: "sources",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "citation", type: "textarea", localized: true },
    { name: "sourceType", type: "select", options: ["Primary", "Secondary", "Tertiary"] },
    { name: "url", type: "text" },
    { name: "notes", type: "textarea", localized: true },
  ],
};