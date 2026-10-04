import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProductBySlug, getRelated } from "@/services/catalog";
import { ProductGallery } from "@/components/catalog/ProductGallery";
import { ProductCTA } from "@/components/catalog/ProductCTA";
import { PriceTag } from "@/components/catalog/PriceTag";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal } from "@/components/motion/Reveal";
import { priceDisplay } from "@/lib/format";
import { absoluteUrl, breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { SITE } from "@/lib/site";
import type { Product } from "@/types/catalog";

export const revalidate = 300;

/** ISR sob demanda: cada produto é gerado no 1º acesso e revalidado ao editar. */
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: PageProps<"/produtos/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };

  const title = [product.name, product.brand].filter(Boolean).join(" · ");
  const description =
    product.short_description ||
    `${product.name}${product.category ? ` — ${product.category.name}` : ""} na Quarto Sono Colchões, Brasília — DF. Consulte condições pelo WhatsApp.`;
  const cover = product.images[0];

  return {
    title,
    description,
    alternates: { canonical: `/produtos/${product.slug}` },
    robots: product.available ? undefined : { index: false, follow: true },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/produtos/${product.slug}`,
      images: cover ? [{ url: cover.public_url, alt: product.name }] : undefined,
    },
    twitter: {
      card: cover ? "summary_large_image" : "summary",
      title,
      description,
      images: cover ? [cover.public_url] : undefined,
    },
  };
}

function productJsonLd(p: Product) {
  const price = p.promotional_price ?? p.price;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    url: absoluteUrl(`/produtos/${p.slug}`),
    ...(p.images.length ? { image: p.images.map((i) => i.public_url) } : {}),
    ...(p.short_description || p.description ? { description: p.short_description || p.description } : {}),
    ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
    ...(p.category ? { category: p.category.name } : {}),
    ...(price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price,
            availability: p.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: { "@type": "Organization", name: SITE.name },
          },
        }
      : {}),
  };
}

const SPECS: { key: keyof Product; label: string }[] = [
  { key: "size", label: "Tamanho" },
  { key: "spring_type", label: "Tipo de mola" },
  { key: "comfort_level", label: "Conforto" },
  { key: "height", label: "Altura" },
  { key: "supported_weight", label: "Peso suportado" },
  { key: "fabric", label: "Tecido" },
  { key: "warranty", label: "Garantia" },
];

export default async function ProductPage({ params }: PageProps<"/produtos/[slug]">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const related = product.available ? await getRelated(product) : [];
  const specs = SPECS.map((s) => ({ ...s, value: product[s.key] as string | null })).filter((s) => s.value?.trim());
  if (product.brand) specs.unshift({ key: "brand", label: "Marca", value: product.brand });
  if (product.category) specs.unshift({ key: "category_id", label: "Categoria", value: product.category.name });

  const pd = priceDisplay(product.price, product.promotional_price);
  const priceLabel =
    pd.kind === "consult" ? "Consulte condições" : pd.kind === "promo" ? `Por ${pd.promotional}` : pd.price;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(productJsonLd(product))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(
          breadcrumbJsonLd([
            { name: "Início", path: "/" },
            { name: "Produtos", path: "/produtos" },
            ...(product.category
              ? [{ name: product.category.name, path: `/categorias/${product.category.slug}` }]
              : []),
            { name: product.name, path: `/produtos/${product.slug}` },
          ]),
        )}
      />

      <div className="container-editorial pb-32 pt-24 md:pb-[var(--spacing-section)] md:pt-28">
        <nav aria-label="Trilha de navegação" className="mb-8 md:mb-12">
          <ol className="flex flex-wrap items-center gap-2 text-[0.75rem] uppercase tracking-[0.12em] text-stone">
            <li>
              <Link href="/produtos" className="inline-flex items-center gap-2 hover:text-graphite">
                <ArrowLeft className="size-3.5" aria-hidden /> Produtos
              </Link>
            </li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li>
                  <Link href={`/categorias/${product.category.slug}`} className="hover:text-graphite">
                    {product.category.name}
                  </Link>
                </li>
              </>
            )}
          </ol>
        </nav>

        <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-20">
          <div className="md:col-span-7">
            <ProductGallery images={product.images} name={product.name} />
          </div>

          <div className="md:col-span-5">
            {!product.available && (
              <p className="mb-6 inline-flex rounded-full border border-danger/30 bg-danger/5 px-4 py-1.5 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-danger">
                Indisponível no momento
              </p>
            )}
            <Reveal as="p" className="eyebrow mb-4 text-stone">
              {[product.category?.name, product.brand].filter(Boolean).join(" · ")}
            </Reveal>
            <h1 className="text-[clamp(2.5rem,1.6rem+3.2vw,4.75rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-balance">
              <Reveal as="span" mask className="block">
                {product.name}
              </Reveal>
            </h1>
            {product.short_description && (
              <Reveal as="p" delay={100} className="mt-6 text-lg leading-relaxed text-graphite/75">
                {product.short_description}
              </Reveal>
            )}

            <Reveal delay={160} className="mt-10 border-t border-graphite/10 pt-8">
              <PriceTag price={product.price} promotional={product.promotional_price} size="lg" />
              {pd.kind !== "consult" && (
                <p className="mt-2 text-[0.8125rem] text-stone">Fale com a loja para conhecer as condições de pagamento.</p>
              )}
              <div className="mt-8">
                <ProductCTA name={product.name} priceLabel={priceLabel} />
              </div>
            </Reveal>

            {specs.length > 0 && (
              <Reveal delay={220} className="mt-14">
                <h2 className="eyebrow mb-4 text-stone">Ficha técnica</h2>
                <dl className="divide-y divide-graphite/10 border-y border-graphite/10">
                  {specs.map((s) => (
                    <div key={s.label} className="grid grid-cols-[9rem_1fr] gap-4 py-3.5 text-[0.9375rem]">
                      <dt className="text-graphite/60">{s.label}</dt>
                      <dd>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            )}

            {product.description && (
              <Reveal className="mt-14">
                <h2 className="eyebrow mb-4 text-stone">Descrição</h2>
                <div className="space-y-4 whitespace-pre-line leading-relaxed text-graphite/80">{product.description}</div>
              </Reveal>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="relacionados" className="mt-[var(--spacing-section)]">
            <h2
              id="relacionados"
              className="mb-12 text-[length:var(--text-title)] font-medium uppercase leading-none tracking-[-0.02em]"
            >
              Você também pode <span className="font-serif font-normal lowercase italic">gostar</span>
            </h2>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3">
              {related.map((p, i) => (
                <li key={p.id}>
                  <ProductCard product={p} index={i} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </>
  );
}
