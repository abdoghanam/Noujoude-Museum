import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: { useAsTitle: "email" },
  fields: [
    { name: "name", type: "text" },
    {
      name: "role",
      type: "select",
      options: [
        { label: "Owner / Institutional Authority", value: "owner" },
        { label: "System Administrator", value: "system_administrator" },
        { label: "Museum Director", value: "museum_director" },
        { label: "Curator", value: "curator" },
        { label: "Editor", value: "editor" },
        { label: "Publisher", value: "publisher" },
        { label: "Translator / Language Editor", value: "translator" },
        { label: "Media Manager", value: "media_manager" },
        { label: "Researcher / Contributor", value: "researcher" },
        { label: "Public Visitor", value: "public_visitor" },
        { label: "AI Service Principal", value: "ai_service_principal" },
      ],
      defaultValue: "editor",
    },
  ],
};