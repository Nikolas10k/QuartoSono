"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { loadGsap, EASE } from "@/lib/gsap";
import { useMediaQuery, useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/cn";

export type HeroChapter = {
  label: string;
  href: string;
  image: string | null;
  headline: [string, string, string];
};

const SURFACES = ["surface-linen", "surface-sand", "surface-stone", "surface-linen"] as const;
const AUTO_ADVANCE_MS = 5600;
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Larguras das colunas: a ativa se expande (colunata). */
function layoutFor(active: number, count: number, mobile: boolean) {
  const activeW = mobile ? 0.52 : 0.4;
  const restW = (1 - activeW) / (count - 1);
  const starts: number[] = [];
  const widths: number[] = [];
  let acc = 0;
  for (let i = 0; i < count; i++) {
    const w = i === active ? activeW : restW;
    starts.push(acc);
    widths.push(w);
    acc += w;
  }
  return { starts, widths };
}

function clipFor(start: number, width: number) {
  const l = +(start * 100).toFixed(3);
  const r = +((1 - start - width) * 100).toFixed(3);
  return `inset(0% ${r}% 0% ${l}%)`;
}

export function Hero({ chapters }: { chapters: HeroChapter[] }) {
  const count = chapters.length;
  const reduced = useReducedMotion();
  const mobile = useMediaQuery("(max-width: 767px)");

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const sectionRef = useRef<HTMLElement>(null);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const panelInnerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dividerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const headlineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const zRef = useRef(2);
  const gsapRef = useRef<Awaited<ReturnType<typeof loadGsap>> | null>(null);

  const initial = layoutFor(0, count, false);

  /** Aplica o layout sem animação (montagem, resize, reduced motion). */
  const applyStatic = useCallback(
    (index: number) => {
      const { starts, widths } = layoutFor(index, count, mobile);
      const g = gsapRef.current?.gsap;
      dividerRefs.current.forEach((el, i) => {
        if (!el) return;
        const x = starts[i + 1] * 100;
        if (g) g.set(el, { xPercent: x, x: 0 });
        else el.style.transform = `translate3d(${x}%,0,0)`;
      });
      labelRefs.current.forEach((el, i) => {
        if (!el) return;
        const x = starts[i] * 100;
        if (g) g.set(el, { xPercent: x, x: 0 });
        else el.style.transform = `translate3d(${x}%,0,0)`;
      });
      panelRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.clipPath = clipFor(starts[i], widths[i]);
        el.style.visibility = i === index ? "visible" : "hidden";
      });
      panelInnerRefs.current.forEach((el) => {
        if (el) el.style.transform = "translate3d(0,0,0)";
      });
      headlineRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.visibility = i === index ? "visible" : "hidden";
        el.querySelectorAll<HTMLElement>("[data-line]").forEach((line) => {
          line.style.transform = "translate3d(0,0,0)";
        });
      });
    },
    [count, mobile],
  );

  // Montagem + mudanças de breakpoint: reposiciona sem animar
  useIsoLayoutEffect(() => {
    applyStatic(activeRef.current);
  }, [applyStatic]);

  // GSAP sob demanda
  useEffect(() => {
    let alive = true;
    loadGsap().then((mod) => {
      if (!alive) return;
      gsapRef.current = mod;
      applyStatic(activeRef.current);
    });
    return () => {
      alive = false;
    };
  }, [applyStatic]);

  const goTo = useCallback(
    (next: number) => {
      const prev = activeRef.current;
      if (next === prev) return;
      activeRef.current = next;
      setActive(next);

      const mod = gsapRef.current;
      if (!mod || reduced) {
        applyStatic(next);
        return;
      }
      const { gsap } = mod;
      const { starts, widths } = layoutFor(next, count, mobile);
      const dur = 1.15;

      dividerRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { xPercent: starts[i + 1] * 100, duration: dur, ease: EASE.editorial, overwrite: true });
      });
      labelRefs.current.forEach((el, i) => {
        if (el) gsap.to(el, { xPercent: starts[i] * 100, duration: dur, ease: EASE.editorial, overwrite: true });
      });

      // Painel que entra: sobe pela coluna (esteira contínua)
      const inPanel = panelRefs.current[next];
      const inInner = panelInnerRefs.current[next];
      if (inPanel && inInner) {
        gsap.killTweensOf([inPanel, inInner]);
        inPanel.style.zIndex = String(++zRef.current);
        if (inPanel.style.visibility === "hidden") gsap.set(inInner, { yPercent: 100 });
        inPanel.style.visibility = "visible";
        gsap.to(inPanel, { clipPath: clipFor(starts[next], widths[next]), duration: dur, ease: EASE.editorial });
        gsap.to(inInner, { yPercent: 0, duration: dur, ease: EASE.editorial });
      }

      // Painel que sai: segue subindo e deixa o topo
      const outPanel = panelRefs.current[prev];
      const outInner = panelInnerRefs.current[prev];
      if (outPanel && outInner) {
        gsap.killTweensOf([outPanel, outInner]);
        gsap.to(outPanel, { clipPath: clipFor(starts[prev], widths[prev]), duration: dur, ease: EASE.editorial });
        gsap.to(outInner, {
          yPercent: -100,
          duration: dur,
          ease: EASE.editorial,
          onComplete: () => {
            if (activeRef.current !== prev) outPanel.style.visibility = "hidden";
          },
        });
      }

      // Headline: linhas saem para cima, novas entram por baixo (máscara)
      const outHead = headlineRefs.current[prev];
      const inHead = headlineRefs.current[next];
      if (outHead) {
        const lines = outHead.querySelectorAll("[data-line]");
        gsap.killTweensOf(lines);
        gsap.to(lines, {
          yPercent: -110,
          duration: 0.8,
          ease: "power3.in",
          stagger: 0.05,
          onComplete: () => {
            if (activeRef.current !== prev) outHead.style.visibility = "hidden";
          },
        });
      }
      if (inHead) {
        const lines = inHead.querySelectorAll("[data-line]");
        gsap.killTweensOf(lines);
        inHead.style.visibility = "visible";
        gsap.fromTo(
          lines,
          { yPercent: 110 },
          { yPercent: 0, duration: 1.05, ease: EASE.calm, stagger: 0.08, delay: 0.42 },
        );
      }
    },
    [applyStatic, count, mobile, reduced],
  );

  // Avanço automático (pausa com hover/foco, fora da tela ou aba oculta)
  useEffect(() => {
    if (reduced) return;
    const section = sectionRef.current;
    let inView = true;
    const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.35 });
    if (section) io.observe(section);
    const id = window.setInterval(() => {
      if (pausedRef.current || !inView || document.hidden) return;
      goTo((activeRef.current + 1) % count);
    }, AUTO_ADVANCE_MS);
    return () => {
      window.clearInterval(id);
      io.disconnect();
    };
  }, [count, goTo, reduced]);

  // Cursor: parallax sutil no painel ativo e no título
  useEffect(() => {
    if (reduced || mobile) return;
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = section.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        section.style.setProperty("--px", nx.toFixed(3));
        section.style.setProperty("--py", ny.toFixed(3));
      });
    };
    section.addEventListener("pointermove", onMove);
    return () => {
      section.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [mobile, reduced]);

  // Scroll: o conteúdo sobe mais devagar e a colunata se recolhe levemente
  useEffect(() => {
    if (reduced) return;
    let ctx: { revert: () => void } | null = null;
    loadGsap().then(({ gsap }) => {
      if (!sectionRef.current || !contentRef.current) return;
      ctx = gsap.context(() => {
        gsap.to(contentRef.current, {
          yPercent: -18,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to("[data-hero-columns]", {
          scale: 0.96,
          ease: "none",
          transformOrigin: "50% 100%",
          scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: true },
        });
      }, sectionRef);
    });
    return () => ctx?.revert();
  }, [reduced]);

  const hoverTimer = useRef<number | undefined>(undefined);
  const onColumnEnter = (i: number) => {
    if (mobile) return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => goTo(i), 110);
  };

  const live = layoutFor(active, count, mobile);

  return (
    <section
      ref={sectionRef}
      aria-label="Apresentação"
      onPointerEnter={() => (pausedRef.current = true)}
      onPointerLeave={() => {
        pausedRef.current = false;
        window.clearTimeout(hoverTimer.current);
      }}
      onFocusCapture={() => (pausedRef.current = true)}
      onBlurCapture={() => (pausedRef.current = false)}
      className="relative h-[100dvh] min-h-[560px] overflow-hidden bg-paper [--px:0] [--py:0]"
    >
      <h1 className="sr-only">Quarto Sono Colchões — 20 anos cuidando do seu sono. Loja de colchões em Brasília.</h1>

      {/* Colunata */}
      <div data-hero-columns className="absolute inset-0 will-change-transform">
        {chapters.map((ch, i) => (
          <div
            key={ch.href}
            ref={(el) => {
              panelRefs.current[i] = el;
            }}
            aria-hidden
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: clipFor(initial.starts[i], initial.widths[i]),
              visibility: i === 0 ? "visible" : "hidden",
              zIndex: i === 0 ? 2 : 1,
            }}
          >
            <div
              ref={(el) => {
                panelInnerRefs.current[i] = el;
              }}
              className="absolute inset-0 will-change-transform"
            >
              <div
                className={cn("grain absolute inset-y-0", SURFACES[i % SURFACES.length])}
                style={{
                  left: `${layoutFor(i, count, mobile).starts[i] * 100}%`,
                  width: `${layoutFor(i, count, mobile).widths[i] * 100}%`,
                }}
              >
                {ch.image && (
                  <div
                    className="absolute inset-[-3%] transition-transform duration-[1200ms] ease-[var(--ease-calm)]"
                    style={{ transform: "translate3d(calc(var(--px) * -18px), calc(var(--py) * -14px), 0)" }}
                  >
                    <Image
                      src={ch.image}
                      alt=""
                      fill
                      priority={i === 0}
                      sizes="(max-width: 767px) 60vw, 45vw"
                      className="object-cover"
                    />
                  </div>
                )}
                {/* Véu suave no topo para legibilidade do título */}
                <div className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-paper/70 via-paper/25 to-transparent" />
              </div>
            </div>
          </div>
        ))}

        {/* Linhas finas entre colunas */}
        {chapters.slice(1).map((ch, i) => (
          <div
            key={`d-${ch.href}`}
            ref={(el) => {
              dividerRefs.current[i] = el;
            }}
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[60] will-change-transform"
            style={{ transform: `translate3d(${initial.starts[i + 1] * 100}%,0,0)` }}
          >
            <span className="hairline absolute inset-y-0 left-0 w-px" />
          </div>
        ))}

        {/* Áreas de interação por coluna (hover ativa — como na referência) */}
        <div className="absolute inset-0 z-[61] flex">
          {chapters.map((ch, i) => (
            <div
              key={`h-${ch.href}`}
              aria-hidden
              onPointerEnter={() => onColumnEnter(i)}
              onClick={() => mobile && goTo(i)}
              className="h-full shrink-0"
              style={{ width: `${live.widths[i] * 100}%` }}
            />
          ))}
        </div>
      </div>

      {/* Título + CTA */}
      <div
        ref={contentRef}
        className="pointer-events-none relative z-[70] flex h-full flex-col items-center px-[var(--spacing-gutter)] pt-[clamp(6.5rem,17vh,11rem)] text-center"
      >
        <p className="eyebrow mb-6 flex items-center gap-3 text-stone" aria-hidden>
          <span className="tabular-nums">0{active + 1}</span>
          <span className="h-px w-8 bg-current opacity-40" />
          <span>{chapters[active]?.label}</span>
        </p>

        <div
          aria-hidden
          className="relative grid w-full place-items-center"
          style={{ transform: "translate3d(calc(var(--px) * 8px), calc(var(--py) * 6px), 0)" }}
        >
          {chapters.map((ch, i) => (
            <div
              key={`t-${ch.href}`}
              ref={(el) => {
                headlineRefs.current[i] = el;
              }}
              className="col-start-1 row-start-1 text-[length:var(--text-display)] font-medium uppercase leading-[0.9] tracking-[-0.04em] text-graphite"
              style={{ visibility: i === 0 ? "visible" : "hidden" }}
            >
              {ch.headline.map((line, li) => (
                <span key={li} className="block overflow-hidden pb-[0.06em]">
                  <span data-line className="block will-change-transform">
                    {li === 1 ? (
                      <span className="font-serif font-normal lowercase italic tracking-[-0.01em]">{line}</span>
                    ) : (
                      line
                    )}
                  </span>
                </span>
              ))}
            </div>
          ))}
        </div>

        <div className="pointer-events-auto mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/produtos"
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-paper/80 px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-graphite shadow-[0_1px_0_rgba(38,38,38,0.06)] backdrop-blur-sm transition-colors duration-[var(--duration-fast)] hover:bg-graphite hover:text-paper"
          >
            Ver produtos
            <ArrowRight
              className="size-3.5 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </div>

      {/* Rótulos das colunas (base) */}
      <nav aria-label="Categorias em destaque" className="absolute inset-x-0 bottom-0 z-[75]">
        <ul>
          {chapters.map((ch, i) => (
            <li key={`l-${ch.href}`}>
              <div
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className="pointer-events-none absolute bottom-0 left-0 w-full will-change-transform"
                style={{ transform: `translate3d(${initial.starts[i] * 100}%,0,0)` }}
              >
                <Link
                  href={ch.href}
                  onFocus={() => goTo(i)}
                  onPointerEnter={() => onColumnEnter(i)}
                  className={cn(
                    "pointer-events-auto inline-flex flex-col gap-1 px-[clamp(0.75rem,1.4vw,1.5rem)] pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 text-left text-[0.6875rem] font-medium uppercase leading-tight tracking-[0.12em] transition-colors duration-[var(--duration-normal)]",
                    i === active ? "text-graphite" : "text-graphite/55 hover:text-graphite",
                  )}
                >
                  <span className="tabular-nums">0{i + 1}</span>
                  <span className={cn("max-md:hidden", i === active && "max-md:inline")}>{ch.label}</span>
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
