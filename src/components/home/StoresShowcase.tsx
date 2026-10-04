"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { STORES, mapsDirectionsUrl } from "@/lib/site";
import { whatsappUrl } from "@/lib/whatsapp";
import { loadGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { Reveal } from "@/components/motion/Reveal";
import { MattressComposition } from "./MattressComposition";

/** "Venha sentir o conforto de perto" — a foto cresce com o scroll. */
export function StoresShowcase({ image, headingIndex = "06" }: { image: string | null; headingIndex?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let ctx: { revert: () => void } | null = null;
    let alive = true;
    loadGsap().then(({ gsap }) => {
      if (!alive || !sectionRef.current) return;
      ctx = gsap.context(() => {
        gsap.fromTo(
          "[data-grow]",
          { clipPath: "inset(18% 22% 18% 22%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: { trigger: "[data-grow]", start: "top 90%", end: "center 45%", scrub: 0.6 },
          },
        );
        gsap.fromTo(
          "[data-grow-img]",
          { scale: 1.25 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: "[data-grow]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.fromTo(
          "[data-word]",
          { yPercent: 110 },
          {
            yPercent: 0,
            stagger: 0.12,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-words]", start: "top 85%" },
          },
        );
      }, sectionRef);
    });
    return () => {
      alive = false;
      ctx?.revert();
    };
  }, [reduced]);

  return (
    <section ref={sectionRef} aria-labelledby="lojas-titulo" className="py-[var(--spacing-section)]">
      <div className="container-editorial">
        <Reveal as="p" className="eyebrow mb-6 flex items-center gap-3 text-stone">
          <span className="tabular-nums">{headingIndex}</span>
          <span className="h-px w-8 bg-current opacity-40" />
          Lojas
        </Reveal>
        <h2
          id="lojas-titulo"
          className="max-w-[16ch] text-[length:var(--text-headline)] font-medium uppercase leading-[0.95] tracking-[-0.03em]"
        >
          <Reveal as="span" mask className="block">
            Venha sentir
          </Reveal>
          <Reveal as="span" mask delay={110} className="block">
            o conforto <span className="font-serif font-normal lowercase italic">de perto.</span>
          </Reveal>
        </h2>
      </div>

      <div className="mt-16 px-[var(--spacing-gutter)] md:mt-24">
        <div
          data-grow
          className="relative aspect-[4/5] w-full overflow-hidden sm:aspect-[16/10] lg:aspect-[21/9]"
          style={reduced ? undefined : { clipPath: "inset(18% 22% 18% 22%)" }}
        >
          <div data-grow-img className="absolute inset-0 will-change-transform">
            {image ? (
              <Image src={image} alt="Loja Quarto Sono Colchões" fill sizes="100vw" className="object-cover" />
            ) : (
              <MattressComposition />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          <p
            data-words
            aria-label="Sinta. Teste. Escolha."
            className="on-dark absolute inset-x-0 bottom-0 flex flex-wrap gap-x-[0.3em] p-[var(--spacing-gutter)] text-[length:var(--text-headline)] font-medium uppercase leading-[0.95] tracking-[-0.03em] text-paper"
          >
            {["Sinta.", "Teste.", "Escolha."].map((w) => (
              <span key={w} aria-hidden className="block overflow-hidden pb-[0.05em]">
                <span data-word className="block">
                  {w}
                </span>
              </span>
            ))}
          </p>
        </div>
      </div>

      <div className="container-editorial mt-16 grid gap-px md:mt-20 md:grid-cols-2">
        {STORES.map((store, i) => (
          <Reveal key={store.id} delay={i * 120} className="border-t border-graphite/15 py-10 md:pr-12">
            <article aria-labelledby={`loja-${store.id}`}>
              <p className="eyebrow mb-3 text-stone">Loja 0{i + 1}</p>
              <h3 id={`loja-${store.id}`} className="text-[length:var(--text-title)] font-medium uppercase leading-none tracking-[-0.02em]">
                {store.neighborhood}
              </h3>
              <address className="mt-5 flex gap-3 text-[0.9375rem] not-italic leading-relaxed text-graphite/75">
                <MapPin className="mt-1 size-4 shrink-0" aria-hidden />
                <span>
                  {store.address}
                  {store.alsoKnownAs && (
                    <>
                      <br />
                      {store.alsoKnownAs}
                    </>
                  )}
                  <br />
                  {store.neighborhood}, {store.city} — {store.region}
                  {store.postalCode && `, CEP ${store.postalCode}`}
                </span>
              </address>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={mapsDirectionsUrl(store)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full bg-graphite px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors hover:bg-ink"
                >
                  Ver rota <ArrowUpRight className="size-3.5" aria-hidden />
                </a>
                <a
                  href={whatsappUrl(`Olá! Gostaria de falar com a loja Quarto Sono ${store.neighborhood}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-graphite/20 px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors hover:border-graphite hover:bg-graphite hover:text-paper"
                >
                  <WhatsappIcon className="size-4" /> Falar com a loja
                </a>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
