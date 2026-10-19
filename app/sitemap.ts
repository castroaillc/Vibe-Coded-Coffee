import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(site.lastUpdated),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
