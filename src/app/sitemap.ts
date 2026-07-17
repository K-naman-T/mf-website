import type { MetadataRoute } from "next";
import { getLegalSlugs } from "@/lib/cms/loader";
import { getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();
  const staticRoutes = ["", "manifesto", "legal"];
  const legalRoutes = getLegalSlugs().map((slug) => `legal/${slug}`);
  const now = new Date();

  return [...staticRoutes, ...legalRoutes].map((route) => ({
    url: route ? `${siteUrl}/${route}` : siteUrl,
    lastModified: now,
    changeFrequency: route.startsWith("legal") ? "yearly" : "monthly",
    priority: route === "" ? 1 : route === "manifesto" ? 0.9 : route.startsWith("legal") ? 0.45 : 0.8,
  }));
}
