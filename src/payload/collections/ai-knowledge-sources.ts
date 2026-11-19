import type { CollectionConfig } from "payload";

export const AiKnowledgeSources: CollectionConfig = {
  slug: "ai-knowledge-sources",
  admin: { useAsTitle: "title" },
  fields: [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "sourceType",
      type: "select",
      options: ["Artifact", "Story", "Collection", "Country", "Page"],
      required: true,
    },
    { name: "sourceId", type: "text", required: true, index: true },
    { name: "locale", type: "select", options: ["en", "ar"], required: true },
    { name: "eligible", type: "checkbox", defaultValue: false },
    { name: "version", type: "number", defaultValue: 1 },
    { name: "content", type: "textarea", localized: true },
  ],
};
