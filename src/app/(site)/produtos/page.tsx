import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogFilters } from "@/components/catalog/CatalogFilters";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { PageIntro } from "@/components/catalog/PageIntro";
import { Serif } from "@/components/home/SectionHeading";
import { getCatalog, getCatalogFacets, getCategories } from "@/services/catalog";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Produtos — colchões, conjuntos box, camas e sofás",
  description:
    "Catálogo da Quarto Sono Colchões: colchões, conjuntos box, camas, cabeceiras e sofás. Lojas em Brazlândia e Ceilândia, Brasília — DF.",
  alternates: { canonical: "/produtos" },
};

function pick(v: string | string[] | undefined) {
  return (Array.isArray(v) ? v[0] : v)?.slice(0, 80) || undefined;
}

export default async function ProductsPage({ searchParams }: PageProps<"/produtos">) {
  const sp = await searchParams;
  const filters = { q: pick(sp.q), categoria: pick(sp.categoria), marca: pick(sp.marca), tamanho: pick(sp.tamanho) };
  const [categories, facets, products] = await Promise.all([getCategories(), getCatalogFacets(), getCatalog(filters)]);
  const filtered = Boolean(filters.q || filters.categoria || filters.marca || filters.tamanho);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Produtos", path: "/produtos" },
          ]),
        )}
      />
      <PageIntro eyebrow="Catálogo" title={["Nossos", <Serif key="s">produtos.</Serif>]}>
        Escolha com calma. Quando encontrar o que procura, fale com a loja pelo WhatsApp e receba as condições.
      </PageIntro>

      <div className="container-editorial pb-[var(--spacing-section)]">
        <div className="mb-12 md:mb-16">
          <Suspense>
            <CatalogFilters categories={categories} brands={facets.brands} sizes={facets.sizes} />
          </Suspense>
        </div>
        <p className="eyebrow mb-8 text-stone" aria-live="polite">
          {products.length} {products.length === 1 ? "produto" : "produtos"}
        </p>
        <ProductGrid products={products} filtered={filtered} />
      </div>
    </>
  );
}
