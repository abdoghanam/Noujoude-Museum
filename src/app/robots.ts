import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/control-center/", "/admin/", "/api/"],
    },
    sitemap: "https://no-beta-azure.vercel.app/sitemap.xml",
  };
}