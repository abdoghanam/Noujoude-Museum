import type { CollectionConfig } from "payload";

export const Collections: CollectionConfig = {
  slug: "collections",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "subtitle", type: "text", localized: true },
    { name: "description", type: "textarea", localized: true },
    {
      name: "countries",
      type: "relationship",
      relationTo: "countries",
      hasMany: true,
    },
    {
      name: "categories",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
    },
    {
      name: "status",
      type: "select",
      options: ["Draft", "In Review", "Approved", "Published"],
      defaultValue: "Draft",
    },
  ],
};