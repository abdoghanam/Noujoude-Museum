import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://no-beta-azure.vercel.app";
  const locales = ["en", "ar"];
  const routes = [
    "",
    "/the-museum",
    "/worlds",
    "/collections",
    "/stories",
    "/curator",
    "/about",
    "/contact",
    "/search",
    "/privacy",
    "/terms",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of routes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "daily" : "weekly",
        priority: route === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}