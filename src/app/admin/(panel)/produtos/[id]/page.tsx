import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getAdminCategories, getAdminProduct } from "@/services/admin-products";
import { ProductForm } from "@/components/admin/ProductForm";
import { Badge } from "@/components/ui/Badge";
import { priceToInput } from "@/lib/format";

export const metadata = { title: "Editar produto" };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditProductPage({ params }: PageProps<"/admin/produtos/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const [product, categories] = await Promise.all([getAdminProduct(id), getAdminCategories()]);
  if (!product) notFound();

  const t = (v: string | null) => v ?? "";

  return (
    <div>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone hover:text-graphite">
        <ArrowLeft className="size-4" aria-hidden /> Produtos
      </Link>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">Editar produto</h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge tone={product.published ? "published" : "draft"}>{product.published ? "Publicado" : "Rascunho"}</Badge>
            <Badge tone={product.available ? "available" : "unavailable"}>
              {product.available ? "Disponível" : "Indisponível"}
            </Badge>
          </div>
        </div>
        {product.published && (
          <a
            href={`/produtos/${product.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-md)] border border-graphite/15 bg-white px-3 text-sm hover:border-graphite"
          >
            <ExternalLink className="size-4" aria-hidden /> Ver no site
          </a>
        )}
      </div>

      <ProductForm
        key={product.updated_at}
        mode="edit"
        productId={product.id}
        categories={categories}
        initialPublished={product.published}
        initialImages={product.images.map((i) => ({ storage_path: i.storage_path, public_url: i.public_url }))}
        defaultValues={{
          name: product.name,
          category_id: product.category_id,
          brand: t(product.brand),
          short_description: t(product.short_description),
          description: t(product.description),
          size: t(product.size),
          spring_type: t(product.spring_type),
          comfort_level: t(product.comfort_level),
          height: t(product.height),
          supported_weight: t(product.supported_weight),
          fabric: t(product.fabric),
          warranty: t(product.warranty),
          price: priceToInput(product.price),
          promotional_price: priceToInput(product.promotional_price),
          featured: product.featured,
          promotion: product.promotion,
          available: product.available,
        }}
      />
    </div>
  );
}
