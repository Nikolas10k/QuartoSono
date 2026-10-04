import type { MetadataRoute } from "next";
import { getCategories, getSitemapProducts } from "@/services/catalog";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([
    getCategories().catch(() => []),
    getSitemapProducts().catch(() => []),
  ]);
  const now = new Date();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/produtos"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/lojas"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/sobre"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/contato"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/categorias/${c.slug}`),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/produtos/${p.slug}`),
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
