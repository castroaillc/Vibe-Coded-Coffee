import type { MetadataRoute } from "next";
import { GUIDE_PATH } from "@/components/SiteChrome";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(site.lastUpdated);
  const page = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${site.url}${path}`,
    lastModified,
    changeFrequency: "weekly",
    priority,
  });
  return [
    page("/", 1),
    page("/coffee-catering", 0.9),
    ...eventPages.map((p) => page(eventPagePath(p.slug), p.slug === "corporate-events" ? 0.9 : 0.8)),
    page(GUIDE_PATH, 0.7),
    page("/privacy", 0.2),
  ];
}
