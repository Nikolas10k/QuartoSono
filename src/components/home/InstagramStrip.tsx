import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";
import { SectionHeading, Serif } from "./SectionHeading";

const TILE_SURFACES = ["surface-linen", "surface-stone", "surface-sand", "surface-graphite", "surface-linen", "surface-sand"];

/**
 * Estrutura visual do Instagram (sem API). Os quadros usam fotos do próprio
 * catálogo quando existem; caso contrário, superfícies abstratas.
 */
export function InstagramStrip({ images }: { images: string[] }) {
  const tiles = Array.from({ length: 6 }, (_, i) => images[i] ?? null);
  return (
    <section aria-labelledby="instagram-titulo" className="overflow-hidden bg-linen py-[var(--spacing-section)]">
      <div className="container-editorial">
        <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
          <SectionHeading
            id="instagram-titulo"
            index="07"
            eyebrow={SITE.instagram.handle}
            title={["Acompanhe", <Serif key="s">a Quarto Sono.</Serif>]}
          />
          <Reveal>
            <a
              href={SITE.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-graphite px-6 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink"
            >
              Seguir no Instagram <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          </Reveal>
        </div>
      </div>

      <div className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--spacing-gutter)] md:mt-20 md:grid md:grid-cols-6 md:overflow-visible">
        {tiles.map((src, i) => (
          <Reveal
            key={i}
            delay={i * 70}
            className={cn(
              "relative aspect-[4/5] w-[62vw] shrink-0 snap-start overflow-hidden sm:w-[40vw] md:w-auto",
              i % 2 === 1 && "md:translate-y-10",
            )}
          >
            <a
              href={SITE.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir o Instagram ${SITE.instagram.handle}`}
              className={cn("group absolute inset-0 block", !src && cn(TILE_SURFACES[i], "grain"))}
            >
              {src && (
                <Image
                  src={src}
                  alt=""
                  fill
                  sizes="(max-width: 767px) 62vw, 16vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover:scale-105"
                />
              )}
              <span className="absolute inset-0 bg-ink/0 transition-colors duration-[var(--duration-normal)] group-hover:bg-ink/20" />
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
