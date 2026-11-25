import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin } from "../access";

export const Inquiries: CollectionConfig = {
  slug: "inquiries",
  access: {
    read: isOwnerOrAdmin,
    create: () => true, // Public can submit inquiries
    update: isOwnerOrAdmin,
    delete: isOwnerOrAdmin,
  },
  admin: { useAsTitle: "subject" },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "email", type: "email", required: true },
    { name: "subject", type: "text", required: true },
    { name: "message", type: "textarea", required: true },
    { name: "locale", type: "text" },
    {
      name: "status",
      type: "select",
      options: ["New", "In Progress", "Resolved"],
      defaultValue: "New",
    },
  ],
};
