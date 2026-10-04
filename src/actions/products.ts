"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { AuthError, requireAdminAction } from "@/lib/auth";
import { parsePriceInput } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { saveProductSchema, type ProductFormValues, type SaveProductInput } from "@/schemas/product";
import { STORAGE_BUCKET, type ProductRow } from "@/types/database";

export type ActionResult<T = undefined> = { ok: true; data: T } | { ok: false; error: string };

function revalidateCatalog() {
  // Revalida toda a vitrine (home, catálogo, categorias, produtos, sitemap)
  revalidatePath("/", "layout");
}

function fail(e: unknown): { ok: false; error: string } {
  if (e instanceof AuthError) return { ok: false, error: e.message };
  if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Dados inválidos." };
  console.error("[admin action]", e);
  return { ok: false, error: e instanceof Error ? e.message : "Algo deu errado. Tente novamente." };
}

function toRow(v: ProductFormValues) {
  const n = (s: string) => (s.trim() ? s.trim() : null);
  return {
    name: v.name.trim(),
    category_id: v.category_id,
    brand: n(v.brand),
    short_description: n(v.short_description),
    description: n(v.description),
    size: n(v.size),
    spring_type: n(v.spring_type),
    comfort_level: n(v.comfort_level),
    height: n(v.height),
    supported_weight: n(v.supported_weight),
    fabric: n(v.fabric),
    warranty: n(v.warranty),
    price: parsePriceInput(v.price),
    promotional_price: parsePriceInput(v.promotional_price),
    featured: v.featured,
    promotion: v.promotion,
    available: v.available,
  } satisfies Partial<ProductRow>;
}

function assertImagesBelong(id: string, images: { storage_path: string }[]) {
  for (const img of images) {
    if (!img.storage_path.startsWith(`products/${id}/`)) {
      throw new Error("Imagem não pertence a este produto.");
    }
  }
}

const idSchema = z.string().uuid();

/** Cria produto (id gerado no cliente para que as fotos já subam no caminho final). */
export async function createProduct(input: SaveProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const { supabase } = await requireAdminAction();
    const { id, values, images, published } = saveProductSchema.parse(input);
    assertImagesBelong(id, images);

    const base = slugify(values.name) || "produto";
    const { data: product, error } = await supabase
      .from("products")
      .insert({ id, slug: base, published, ...toRow(values) })
      .select("id,slug")
      .single();
    if (error) {
      if (error.code === "23505" && error.message.includes("products_pkey")) {
        throw new Error("Este produto já foi salvo. Recarregue a página.");
      }
      throw new Error(`Não foi possível salvar o produto: ${error.message}`);
    }

    const { error: imgError } = await supabase.from("product_images").insert(
      images.map((img, i) => ({
        product_id: id,
        storage_path: img.storage_path,
        public_url: img.public_url,
        position: i,
        is_cover: i === 0,
      })),
    );
    if (imgError) {
      await supabase.from("products").delete().eq("id", id);
      throw new Error(`Não foi possível salvar as fotos: ${imgError.message}`);
    }

    revalidateCatalog();
    return { ok: true, data: product };
  } catch (e) {
    return fail(e);
  }
}

/** Atualiza produto e sincroniza fotos (ordem, capa, remoções). */
export async function updateProduct(input: SaveProductInput): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    const { supabase } = await requireAdminAction();
    const { id, values, images, published } = saveProductSchema.parse(input);
    assertImagesBelong(id, images);

    const { data: product, error } = await supabase
      .from("products")
      .update({ published, ...toRow(values) })
      .eq("id", id)
      .select("id,slug")
      .single();
    if (error || !product) throw new Error(`Não foi possível salvar: ${error?.message ?? "produto não encontrado"}`);

    const { data: existing, error: exErr } = await supabase
      .from("product_images")
      .select("id,storage_path")
      .eq("product_id", id);
    if (exErr) throw new Error(`Não foi possível ler as fotos: ${exErr.message}`);

    const byPath = new Map((existing ?? []).map((e) => [e.storage_path, e.id]));
    const keep = new Set(images.map((i) => i.storage_path));
    const removed = (existing ?? []).filter((e) => !keep.has(e.storage_path));

    // Sincronização incremental — nunca apaga tudo antes de inserir.
    // 1) solta a capa atual (índice único parcial: uma capa por produto)
    const { error: coverErr } = await supabase
      .from("product_images")
      .update({ is_cover: false })
      .eq("product_id", id)
      .eq("is_cover", true);
    if (coverErr) throw new Error(`Não foi possível atualizar as fotos: ${coverErr.message}`);

    // 2) novas fotos (sem capa ainda)
    const fresh = images
      .map((img, i) => ({ img, i }))
      .filter(({ img }) => !byPath.has(img.storage_path))
      .map(({ img, i }) => ({
        product_id: id,
        storage_path: img.storage_path,
        public_url: img.public_url,
        position: i,
        is_cover: false,
      }));
    if (fresh.length) {
      const { error: insErr } = await supabase.from("product_images").insert(fresh);
      if (insErr) throw new Error(`Não foi possível salvar as novas fotos: ${insErr.message}`);
    }

    // 3) ordem das fotos mantidas
    await Promise.all(
      images
        .map((img, i) => ({ rowId: byPath.get(img.storage_path), i }))
        .filter((x): x is { rowId: string; i: number } => Boolean(x.rowId))
        .map(({ rowId, i }) => supabase.from("product_images").update({ position: i }).eq("id", rowId)),
    );

    // 4) remove as excluídas
    if (removed.length) {
      const { error: delErr } = await supabase
        .from("product_images")
        .delete()
        .in(
          "id",
          removed.map((r) => r.id),
        );
      if (delErr) throw new Error(`Não foi possível remover fotos: ${delErr.message}`);
    }

    // 5) capa = primeira foto
    const { error: setCoverErr } = await supabase
      .from("product_images")
      .update({ is_cover: true })
      .eq("product_id", id)
      .eq("storage_path", images[0].storage_path);
    if (setCoverErr) throw new Error(`Não foi possível definir a capa: ${setCoverErr.message}`);

    if (removed.length) {
      await supabase.storage.from(STORAGE_BUCKET).remove(removed.map((r) => r.storage_path));
    }

    revalidateCatalog();
    return { ok: true, data: product };
  } catch (e) {
    return fail(e);
  }
}

const toggleSchema = z.object({
  id: idSchema,
  field: z.enum(["available", "featured", "published"]),
  value: z.boolean(),
});

/** Alterna disponível / destaque / publicado — instantâneo na listagem. */
export async function toggleProductFlag(input: z.input<typeof toggleSchema>): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    const { id, field, value } = toggleSchema.parse(input);
    const { error } = await supabase
      .from("products")
      .update({ [field]: value } as Partial<Pick<ProductRow, typeof field>>)
      .eq("id", id);
    if (error) throw new Error(error.message);
    revalidateCatalog();
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}

/** Exclui produto, linhas de imagem (cascade) e arquivos do storage. */
export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const { supabase } = await requireAdminAction();
    idSchema.parse(id);

    const { data: files } = await supabase.storage.from(STORAGE_BUCKET).list(`products/${id}`, { limit: 100 });
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw new Error(`Não foi possível excluir: ${error.message}`);

    if (files?.length) {
      await supabase.storage.from(STORAGE_BUCKET).remove(files.map((f) => `products/${id}/${f.name}`));
    }

    revalidateCatalog();
    return { ok: true, data: undefined };
  } catch (e) {
    return fail(e);
  }
}
