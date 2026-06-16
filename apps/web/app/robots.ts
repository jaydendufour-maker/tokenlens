import type { MetadataRoute } from "next";
import { SITE_URL as BASE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // privé app-routes niet laten crawlen
      disallow: ["/dashboard", "/alerts", "/projects", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
