import type { MetadataRoute } from "next";
import { MODELS, COMPARISONS } from "@/lib/models";
import { getAllPosts } from "@/lib/content";
import { SITE_URL as BASE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "/pricing", "/blog", "/login"].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const modelPages = MODELS.map((m) => ({
    url: `${BASE}/pricing/${m.slug}`,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const comparePages = COMPARISONS.map(([a, b]) => ({
    url: `${BASE}/compare/${a}-vs-${b}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const blogPages = getAllPosts().map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...modelPages, ...comparePages, ...blogPages];
}
