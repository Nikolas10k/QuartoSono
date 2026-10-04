import { ArrowUpRight, Star } from "lucide-react";
import { SITE } from "@/lib/site";
import { REVIEWS, GOOGLE_REVIEWS_URL } from "@/lib/reviews";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading, Serif } from "./SectionHeading";

export function Reviews() {
  const rating = SITE.google.rating.toFixed(1).replace(".", ",");
  return (
    <section aria-labelledby="avaliacoes-titulo" className="py-[var(--spacing-section)]">
      <div className="container-editorial">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-end">
          <SectionHeading
            id="avaliacoes-titulo"
            index="05"
            eyebrow="Avaliações"
            className="lg:col-span-7"
            title={["Quem compra", <Serif key="s">recomenda.</Serif>]}
          />
          <Reveal className="lg:col-span-5">
            <div className="flex items-end gap-6">
              <p className="text-[clamp(5rem,4rem+6vw,10rem)] font-medium leading-[0.8] tracking-[-0.06em] tabular-nums">
                {rating}
              </p>
              <div className="pb-2">
                <p className="flex gap-1" aria-label={`Nota ${rating} de 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-5 fill-graphite text-graphite" aria-hidden />
                  ))}
                </p>
                <p className="mt-2 text-[0.9375rem] text-graphite/70">
                  {SITE.google.reviewCount} avaliações no Google
                </p>
              </div>
            </div>
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.14em]"
            >
              <span className="link-underline pb-0.5">Ler avaliações no Google</span>
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </Reveal>
        </div>

        {REVIEWS.length > 0 && (
          <ul className="mt-20 grid gap-px border-t border-graphite/10 md:grid-cols-3">
            {REVIEWS.slice(0, 3).map((r, i) => (
              <Reveal as="li" key={`${r.author}-${i}`} delay={i * 100} className="py-10 md:pr-10">
                <figure>
                  <p className="flex gap-0.5" aria-label={`Nota ${r.rating} de 5`}>
                    {Array.from({ length: r.rating }).map((_, s) => (
                      <Star key={s} className="size-3.5 fill-graphite text-graphite" aria-hidden />
                    ))}
                  </p>
                  <blockquote className="mt-5 font-serif text-2xl italic leading-snug">“{r.text}”</blockquote>
                  <figcaption className="eyebrow mt-6 text-stone">
                    {r.author} · {r.source}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
