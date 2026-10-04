import "server-only";
import { requireAdminPage } from "@/lib/auth";
import { sortImages } from "@/services/catalog";
import type { Category, Product, ProductImage, ProductSummary } from "@/types/catalog";

export type AdminStats = { published: number; available: number; unavailable: number; featured: number; total: number };

export async function getAdminStats(): Promise<AdminStats> {
  const { supabase } = await requireAdminPage();
  const head = { count: "exact" as const, head: true };
  const [total, published, available, unavailable, featured] = await Promise.all([
    supabase.from("products").select("id", head),
    supabase.from("products").select("id", head).eq("published", true),
    supabase.from("products").select("id", head).eq("available", true),
    supabase.from("products").select("id", head).eq("available", false),
    supabase.from("products").select("id", head).eq("featured", true),
  ]);
  return {
    total: total.count ?? 0,
    published: published.count ?? 0,
    available: available.count ?? 0,
    unavailable: unavailable.count ?? 0,
    featured: featured.count ?? 0,
  };
}

export async function listAdminProducts(opts: { q?: string; limit?: number } = {}): Promise<ProductSummary[]> {
  const { supabase } = await requireAdminPage();
  let query = supabase
    .from("products")
    .select(
      "id,name,slug,brand,short_description,size,price,promotional_price,featured,promotion,available,published,created_at,updated_at,category:categories(id,name,slug,position),images:product_images(id,storage_path,public_url,position,is_cover)",
    )
    .order("updated_at", { ascending: false })
    .limit(opts.limit ?? 500);
  if (opts.q) {
    const term = opts.q.replace(/[%,()*:"'\\]/g, " ").trim().slice(0, 60);
    if (term) query = query.or(`name.ilike.*${term}*,brand.ilike.*${term}*`);
  }
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return ((data ?? []) as unknown as (Omit<ProductSummary, "cover"> & { images: ProductImage[] })[]).map(
    ({ images, ...rest }) => ({ ...rest, cover: sortImages(images)[0] ?? null }),
  );
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const { supabase } = await requireAdminPage();
  const { data, error } = await supabase
    .from("products")
    .select("*,category:categories(id,name,slug,position),images:product_images(id,storage_path,public_url,position,is_cover)")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  const p = data as unknown as Product;
  return { ...p, images: sortImages(p.images) };
}

export async function getAdminCategories(): Promise<Category[]> {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase.from("categories").select("id,name,slug,position").order("position");
  return data ?? [];
}
