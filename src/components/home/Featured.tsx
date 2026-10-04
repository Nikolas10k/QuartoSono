import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { Reveal } from "@/components/motion/Reveal";
import { ProductImageFrame } from "@/components/catalog/ProductImageFrame";
import { PriceTag } from "@/components/catalog/PriceTag";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { SectionHeading, Serif } from "./SectionHeading";

/** Destaques em layout editorial alternado (imagem grande + texto). */
export function Featured({ products }: { products: ProductSummary[] }) {
  return (
    <section aria-labelledby="destaques-titulo" className="py-[var(--spacing-section)]">
      <div className="container-editorial">
        <div className="mb-16 flex flex-col justify-between gap-8 md:mb-24 md:flex-row md:items-end">
          <SectionHeading
            id="destaques-titulo"
            index="03"
            eyebrow="Destaques"
            title={["Escolhidos", <Serif key="s">para o seu</Serif>, "descanso."]}
          />
          <ButtonLink href="/produtos" variant="text" iconRight={<ArrowRight className="size-3.5" aria-hidden />}>
            Ver todos os produtos
          </ButtonLink>
        </div>

        {products.length === 0 ? (
          <Reveal className="grid gap-6 border-t border-graphite/10 pt-10 md:grid-cols-[1fr_auto] md:items-center">
            <p className="max-w-xl text-lg leading-relaxed text-graphite/75">
              Nossa seleção de destaques está sendo preparada. Enquanto isso, explore o catálogo ou fale
              diretamente com a loja.
            </p>
            <ButtonLink href="/produtos" variant="secondary">
              Explorar catálogo
            </ButtonLink>
          </Reveal>
        ) : (
          <ul className="space-y-24 md:space-y-40">
            {products.map((p, i) => {
              const flip = i % 2 === 1;
              return (
                <li key={p.id}>
                  <article className="grid items-end gap-8 md:grid-cols-12 md:gap-10">
                    <Reveal
                      mask
                      className={cn(
                        "md:col-span-7",
                        flip ? "md:order-2 md:col-start-6" : "md:col-start-1",
                      )}
                    >
                      <Link href={`/produtos/${p.slug}`} className="group block" tabIndex={-1} aria-hidden>
                        <ProductImageFrame
                          src={p.cover?.public_url}
                          alt={p.name}
                          sizes="(max-width: 767px) 100vw, 58vw"
                          className="aspect-[4/5] md:aspect-[5/4]"
                          imgClassName="transition-transform duration-[1400ms] ease-[var(--ease-calm)] group-hover:scale-[1.04]"
                          tone={["surface-linen", "surface-sand", "surface-stone"][i % 3]}
                        />
                      </Link>
                    </Reveal>
                    <div
                      className={cn(
                        "md:col-span-4 md:pb-6",
                        flip ? "md:order-1 md:col-start-1" : "md:col-start-9",
                        i % 2 === 0 ? "md:-translate-y-16" : "",
                      )}
                    >
                      <Reveal as="p" className="eyebrow mb-4 text-stone">
                        {[p.category?.name, p.brand].filter(Boolean).join(" · ")}
                      </Reveal>
                      <Reveal as="h3" delay={80} className="text-[length:var(--text-title)] font-medium uppercase leading-[1.02] tracking-[-0.02em]">
                        <Link href={`/produtos/${p.slug}`} className="hover:opacity-70">
                          {p.name}
                        </Link>
                      </Reveal>
                      {p.short_description && (
                        <Reveal as="p" delay={140} className="mt-4 max-w-sm leading-relaxed text-graphite/70">
                          {p.short_description}
                        </Reveal>
                      )}
                      <Reveal delay={200} className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4">
                        <PriceTag price={p.price} promotional={p.promotional_price} />
                        <Link
                          href={`/produtos/${p.slug}`}
                          className="group inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.14em]"
                        >
                          <span className="link-underline pb-0.5">Ver produto</span>
                          <ArrowRight
                            className="size-3.5 transition-transform duration-[var(--duration-normal)] group-hover:translate-x-1"
                            aria-hidden
                          />
                        </Link>
                      </Reveal>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
