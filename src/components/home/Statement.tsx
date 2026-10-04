"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { loadGsap } from "@/lib/gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { MattressComposition } from "./MattressComposition";

/**
 * Pinned scroll: um bloco abstrato cresce, vira a foto de um colchão e
 * revela o manifesto + CTA. Tudo em transform / opacity / clip-path.
 */
export function Statement({ image, imageAlt }: { image: string | null; imageAlt: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    let ctx: { revert: () => void } | null = null;
    let alive = true;

    loadGsap().then(({ gsap }) => {
      const section = sectionRef.current;
      if (!alive || !section) return;
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=220%",
            pin: "[data-pin]",
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        tl.fromTo(
          "[data-frame]",
          { clipPath: "inset(31% 34% 31% 34%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1, ease: "power2.inOut" },
          0,
        )
          .fromTo("[data-block]", { opacity: 1 }, { opacity: 0, duration: 0.45 }, 0.35)
          .fromTo("[data-photo]", { scale: 1.18 }, { scale: 1, duration: 1.2 }, 0)
          .fromTo("[data-intro]", { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -40, duration: 0.35 }, 0.05)
          .fromTo("[data-veil]", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.75)
          .fromTo(
            "[data-line-a] [data-l]",
            { yPercent: 110 },
            { yPercent: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" },
            0.85,
          )
          .fromTo(
            "[data-line-b] [data-l]",
            { yPercent: 110 },
            { yPercent: 0, duration: 0.45, stagger: 0.06, ease: "power3.out" },
            1.25,
          )
          .fromTo("[data-cta]", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.3 }, 1.6)
          .to({}, { duration: 0.35 });
      }, section);
    });

    return () => {
      alive = false;
      ctx?.revert();
    };
  }, [reduced]);

  const lineA = ["Não é apenas", "um colchão."];
  const lineB = ["É onde seu dia termina", "e o próximo começa."];

  return (
    <section ref={sectionRef} aria-labelledby="manifesto-titulo" className="relative bg-paper">
      <div data-pin className="relative h-[100dvh] overflow-hidden">
        {/* Introdução que antecede a expansão */}
        <div
          data-intro
          className="absolute inset-x-0 top-[12%] z-10 text-center"
          aria-hidden={!reduced}
        >
          <p className="eyebrow text-stone">O conforto começa antes de você dormir</p>
        </div>

        <div
          data-frame
          className="absolute inset-0"
          style={reduced ? undefined : { clipPath: "inset(31% 34% 31% 34%)" }}
        >
          <div data-photo className="absolute inset-0 will-change-transform">
            {image ? (
              <Image src={image} alt={imageAlt} fill sizes="100vw" className="object-cover" />
            ) : (
              <MattressComposition />
            )}
          </div>
          {/* Bloco abstrato que se transforma na imagem */}
          <div data-block className="surface-sand grain absolute inset-0" style={reduced ? { opacity: 0 } : undefined} />
          <div
            data-veil
            className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/45 to-ink/10"
            style={reduced ? undefined : { opacity: 0 }}
          />
        </div>

        <div className="on-dark absolute inset-0 z-20 flex flex-col justify-end px-[var(--spacing-gutter)] pb-[clamp(3rem,10vh,7rem)] text-paper">
          <h2
            id="manifesto-titulo"
            className="max-w-[18ch] text-[length:var(--text-headline)] font-medium uppercase leading-[0.95] tracking-[-0.03em]"
          >
            <span data-line-a className="block">
              {lineA.map((l) => (
                <span key={l} className="block overflow-hidden pb-[0.05em]">
                  <span data-l className="block" style={reduced ? undefined : { transform: "translateY(110%)" }}>
                    {l}
                  </span>
                </span>
              ))}
            </span>
          </h2>
          <p
            data-line-b
            className="mt-6 max-w-[24ch] font-serif text-[clamp(1.75rem,1.2rem+2.4vw,3.5rem)] italic leading-[1.05] text-paper/90"
          >
            {lineB.map((l) => (
              <span key={l} className="block overflow-hidden pb-[0.08em]">
                <span data-l className="block" style={reduced ? undefined : { transform: "translateY(110%)" }}>
                  {l}
                </span>
              </span>
            ))}
          </p>
          <div data-cta className="mt-10" style={reduced ? undefined : { opacity: 0 }}>
            <Link
              href="/produtos"
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-paper px-6 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-graphite transition-colors duration-[var(--duration-fast)] hover:bg-linen"
            >
              Conhecer produtos
              <ArrowRight
                className="size-4 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:translate-x-1"
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
