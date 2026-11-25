import type { CollectionConfig } from "payload";

import { isOwnerOrAdmin, canCreate, canUpdate } from "../access";

export const PublicationRecords: CollectionConfig = {
  slug: "publication-records",
  access: {
    read: isOwnerOrAdmin,
    create: canCreate,
    update: canUpdate,
    delete: isOwnerOrAdmin,
  },
  admin: { useAsTitle: "id" },
  fields: [
    {
      name: "entityType",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "entityId",
      type: "text",
      required: true,
      index: true,
    },
    {
      name: "locale",
      type: "select",
      options: ["en", "ar"],
      required: true,
    },
    {
      name: "state",
      type: "select",
      options: ["Draft", "In Review", "Published", "Unpublished", "Scheduled"],
      defaultValue: "Draft",
      required: true,
    },
    { name: "publishedAt", type: "date" },
    { name: "scheduledAt", type: "date" },
    { name: "publisher", type: "text" },
    { name: "routeVersion", type: "text" },
  ],
};
