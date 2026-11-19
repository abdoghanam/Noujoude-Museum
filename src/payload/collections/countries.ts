// Noujoude — Country world.
//
// Phase 2 work item 2.1 / 2.5. A country is a cultural "world" in the
// museum, not merely a filter. Its exhibition state is one of the six values
// fixed by ADR-010 (Master Spec §11.9 + Appendix G.4). `Hidden / Not Public`
// suppresses navigation, search, sitemap and AI exposure.

import type { CollectionConfig } from "payload";

export const Countries: CollectionConfig = {
  slug: "countries",
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "slug", "exhibitionState"],
  },
  access: {
    // Read is gated by publication/exhibition state at the route layer; the
    // CMS itself is never public.
    read: () => true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      localized: true,
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
    },
    {
      name: "nativeName",
      type: "text",
      localized: true,
    },
    {
      name: "exhibitionState",
      type: "select",
      required: true,
      defaultValue: "In Preparation",
      options: [
        { label: "Open Exhibition", value: "Open Exhibition" },
        { label: "Coming Soon", value: "Coming Soon" },
        { label: "In Preparation", value: "In Preparation" },
        { label: "Temporarily Unavailable", value: "Temporarily Unavailable" },
        { label: "Hidden / Not Public", value: "Hidden / Not Public" },
      ],
    },
    {
      name: "shortIntroduction",
      type: "textarea",
      localized: true,
    },
    // Hero image relationship is added once the Media collection (Phase 5) exists.
  ],
};