import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { PageIntro } from "@/components/catalog/PageIntro";
import { getCatalog, getCatalogFacets, getCategories, getCategoryBySlug } from "@/services/catalog";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export async function generateMetadata({ params }: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };
  return {
    title: `${category.name} em Brasília`,
    description: `${category.name} na Quarto Sono Colchões — lojas em Brazlândia e Ceilândia, Brasília — DF. Fale com a loja e receba as condições.`,
    alternates: { canonical: `/categorias/${category.slug}` },
  };
}

function pick(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.slice(0, 80) || undefined;
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/categorias/[slug]">) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const sp = await searchParams;
  const filters = { categoria: category.slug, q: pick(sp.q), marca: pick(sp.marca), tamanho: pick(sp.tamanho) };
  const [categories, facets, products] = await Promise.all([getCategories(), getCatalogFacets(), getCatalog(filters)]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Produtos", path: "/produtos" },
            { name: category.name, path: `/categorias/${category.slug}` },
          ]),
        )}
      />
      <div className="container-editorial pt-24 md:pt-28">
        <Link
          href="/produtos"
          className="inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-stone hover:text-graphite"
        >
          <ArrowLeft className="size-3.5" aria-hidden /> Todos os produtos
        </Link>
      </div>
      <div className="-mt-16 md:-mt-20">
        <PageIntro eyebrow="Categoria" title={[category.name]} />
      </div>
      <div className="container-editorial pb-[var(--spacing-section)]">
        <div className="mb-12 md:mb-16">
          <Suspense>
            <CatalogFilters
              categories={categories}
              brands={facets.brands}
              sizes={facets.sizes}
              lockedCategory={category.slug}
            />
          </Suspense>
        </div>
        <p className="eyebrow mb-8 text-stone" aria-live="polite">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
        <ProductGrid products={products} filtered={Boolean(filters.q || filters.marca || filters.tamanho)} />
      </div>
    </>
  );
}
