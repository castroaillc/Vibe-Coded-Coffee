import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Search engines and AI answer engines (ChatGPT, Claude, Perplexity, Gemini)
// are all welcome — being cited by them is the point of GEO.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/order", "/q/", "/admin"] },
      {
        userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Google-Extended", "Applebot-Extended"],
        allow: "/",
        disallow: ["/api/", "/order", "/q/", "/admin"],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
