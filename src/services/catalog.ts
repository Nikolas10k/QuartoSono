import "server-only";
import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CatalogFilters, Category, Product, ProductImage, ProductSummary } from "@/types/catalog";

/**
 * Consultas públicas. RLS já restringe a `published = true`;
 * aqui filtramos também `available = true` para a vitrine.
 */

const SUMMARY_SELECT =
  "id,name,slug,brand,short_description,size,price,promotional_price,featured,promotion,available,published,created_at,updated_at,category:categories(id,name,slug,position),images:product_images(id,storage_path,public_url,position,is_cover)";

type SummaryRow = Omit<ProductSummary, "cover"> & { images: ProductImage[] | null };

function pickCover(images: ProductImage[] | null | undefined): ProductImage | null {
  if (!images?.length) return null;
  return images.find((i) => i.is_cover) ?? [...images].sort((a, b) => a.position - b.position)[0];
}

export function sortImages(images: ProductImage[] | null | undefined): ProductImage[] {
  if (!images) return [];
  return [...images].sort((a, b) => {
    if (a.is_cover !== b.is_cover) return a.is_cover ? -1 : 1;
    return a.position - b.position;
  });
}

function toSummary(row: SummaryRow): ProductSummary {
  const { images, ...rest } = row;
  return { ...rest, cover: pickCover(images) };
}

/** Remove caracteres que têm significado na sintaxe de filtros do PostgREST. */
function sanitizeTerm(term: string) {
  return term.replace(/[%,()*:"'\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("categories")
    .select("id,name,slug,position")
    .order("position", { ascending: true });
  if (error) throw new Error(`Erro ao carregar categorias: ${error.message}`);
  return data ?? [];
});

export const getCategoryBySlug = cache(async (slug: string) => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export async function getCatalog(filters: CatalogFilters = {}): Promise<ProductSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const categories = await getCategories();

  let query = supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("published", true)
    .eq("available", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (filters.categoria) {
    const cat = categories.find((c) => c.slug === filters.categoria);
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (filters.marca) query = query.ilike("brand", sanitizeTerm(filters.marca));
  if (filters.tamanho) query = query.ilike("size", sanitizeTerm(filters.tamanho));

  if (filters.q) {
    const term = sanitizeTerm(filters.q);
    if (term) {
      const matchingCats = categories
        .filter((c) =>
          c.name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .includes(term.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()),
        )
        .map((c) => c.id);
      const ors = [`name.ilike.*${term}*`, `brand.ilike.*${term}*`];
      if (matchingCats.length) ors.push(`category_id.in.(${matchingCats.join(",")})`);
      query = query.or(ors.join(","));
    }
  }

  const { data, error } = await query;
  if (error) throw new Error(`Erro ao carregar produtos: ${error.message}`);
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

export async function getFeatured(limit = 4): Promise<ProductSummary[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("published", true)
    .eq("available", true)
    .eq("featured", true)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`Erro ao carregar destaques: ${error.message}`);
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

/** Uma foto de capa por categoria (para os blocos da home). */
export async function getCategoryCovers(): Promise<Record<string, ProductImage | null>> {
  if (!isSupabaseConfigured()) return {};
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("category_id,featured,images:product_images(id,storage_path,public_url,position,is_cover)")
    .eq("published", true)
    .eq("available", true)
    .order("featured", { ascending: false })
    .order("updated_at", { ascending: false })
    .limit(120);
  if (error) return {};
  const covers: Record<string, ProductImage | null> = {};
  for (const row of (data ?? []) as unknown as { category_id: string; images: ProductImage[] }[]) {
    if (covers[row.category_id]) continue;
    const cover = pickCover(row.images);
    if (cover) covers[row.category_id] = cover;
  }
  return covers;
}

export async function getCatalogFacets(): Promise<{ brands: string[]; sizes: string[] }> {
  if (!isSupabaseConfigured()) return { brands: [], sizes: [] };
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("brand,size")
    .eq("published", true)
    .eq("available", true)
    .limit(500);
  const brands = new Set<string>();
  const sizes = new Set<string>();
  for (const row of data ?? []) {
    if (row.brand?.trim()) brands.add(row.brand.trim());
    if (row.size?.trim()) sizes.add(row.size.trim());
  }
  const collator = new Intl.Collator("pt-BR", { sensitivity: "base", numeric: true });
  return { brands: [...brands].sort(collator.compare), sizes: [...sizes].sort(collator.compare) };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select("*,category:categories(id,name,slug,position),images:product_images(id,storage_path,public_url,position,is_cover)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(`Erro ao carregar produto: ${error.message}`);
  if (!data) return null;
  const product = data as unknown as Product;
  return { ...product, images: sortImages(product.images) };
});

export async function getRelated(product: Product, limit = 3): Promise<ProductSummary[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select(SUMMARY_SELECT)
    .eq("published", true)
    .eq("available", true)
    .eq("category_id", product.category_id)
    .neq("id", product.id)
    .order("featured", { ascending: false })
    .limit(limit);
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

export async function getSitemapProducts(): Promise<{ slug: string; updated_at: string }[]> {
  if (!isSupabaseConfigured()) return [];
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("products")
    .select("slug,updated_at")
    .eq("published", true)
    .eq("available", true)
    .limit(5000);
  return data ?? [];
}
