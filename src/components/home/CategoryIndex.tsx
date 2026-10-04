"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMediaQuery, useReducedMotion } from "@/hooks/useReducedMotion";

export type CategoryItem = { name: string; slug: string; image: string | null };

const SURFACES = ["surface-linen", "surface-sand", "surface-stone", "surface-graphite", "surface-sand", "surface-linen"];

/**
 * Índice editorial de categorias: linhas tipográficas grandes; no desktop
 * uma prévia de imagem acompanha o cursor (sem grid de cards iguais).
 */
export function CategoryIndex({ items }: { items: CategoryItem[] }) {
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const desktop = useMediaQuery("(min-width: 1024px)");
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!desktop || reduced) return;
    const list = listRef.current;
    const preview = previewRef.current;
    if (!list || !preview) return;
    let x = 0,
      y = 0,
      tx = 0,
      ty = 0,
      raf = 0;
    const loop = () => {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      preview.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      const r = list.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
    };
    list.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      list.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [desktop, reduced]);

  return (
    <div className="relative">
      <ul ref={listRef} className="relative border-t border-graphite/10" onPointerLeave={() => setHovered(null)}>
        {items.map((item, i) => (
          <li key={item.slug} className="border-b border-graphite/10">
            <Link
              href={`/categorias/${item.slug}`}
              onPointerEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              className={cn(
                "group grid grid-cols-[2.5rem_1fr_auto] items-center gap-4 py-6 transition-[color,padding] duration-[var(--duration-normal)] ease-[var(--ease-calm)] md:grid-cols-[5rem_1fr_auto] md:py-8",
                hovered !== null && hovered !== i ? "text-graphite/35" : "text-graphite",
                "lg:hover:pl-4",
              )}
            >
              <span className="font-serif text-lg italic text-stone tabular-nums">0{i + 1}</span>
              <span className="text-[clamp(2rem,1rem+4.6vw,5.5rem)] font-medium uppercase leading-none tracking-[-0.035em]">
                {item.name}
              </span>
              <span className="flex items-center gap-4">
                {/* miniatura no mobile/tablet */}
                <span
                  aria-hidden
                  className={cn(
                    "relative block h-14 w-14 overflow-hidden rounded-[var(--radius-sm)] md:h-16 md:w-20 lg:hidden",
                    !item.image && SURFACES[i % SURFACES.length],
                  )}
                >
                  {item.image && <Image src={item.image} alt="" fill sizes="80px" className="object-cover" />}
                </span>
                <ArrowUpRight
                  className="size-6 shrink-0 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:rotate-45 md:size-8"
                  aria-hidden
                />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Prévia que segue o cursor (desktop) */}
      <div
        ref={previewRef}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden h-[22rem] w-[17rem] lg:block"
      >
        {items.map((item, i) => (
          <div
            key={item.slug}
            className={cn(
              "absolute inset-0 overflow-hidden transition-[opacity,clip-path] duration-[600ms] ease-[var(--ease-editorial)]",
              !item.image && cn(SURFACES[i % SURFACES.length], "grain"),
              hovered === i ? "opacity-100 [clip-path:inset(0_0_0_0)]" : "opacity-0 [clip-path:inset(100%_0_0_0)]",
            )}
          >
            {item.image && <Image src={item.image} alt="" fill sizes="272px" className="object-cover" />}
            {!item.image && (
              <span className="absolute bottom-4 left-4 font-serif text-2xl italic text-graphite/60">{item.name}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
