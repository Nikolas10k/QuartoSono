"use client";

import { useEffect, useRef, type CSSProperties, type ElementType, type ReactNode } from "react";

type RevealProps = {
  as?: ElementType;
  /** clip-path de baixo para cima (texto/imagem); padrão: fade + deslize */
  mask?: boolean;
  delay?: number;
  className?: string;
  children?: ReactNode;
  style?: CSSProperties;
  id?: string;
};

/**
 * Reveal leve com IntersectionObserver (sem GSAP) — usado em toda a vitrine.
 * Respeita prefers-reduced-motion via CSS (globals.css).
 */
export function Reveal({ as = "div", mask, delay = 0, className, children, style, id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const attr = mask ? "data-mask-reveal" : "data-reveal";
    if (!("IntersectionObserver" in window)) {
      el.setAttribute(attr, "in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            el.setAttribute(attr, "in");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.01 },
    );
    // Com máscara o elemento começa 100% recortado (área zero para o IntersectionObserver),
    // então observamos o pai.
    io.observe(mask ? (el.parentElement ?? el) : el);
    return () => io.disconnect();
  }, [mask]);

  const Tag = as;
  const attrs = { [mask ? "data-mask-reveal" : "data-reveal"]: "" };
  return (
    <Tag
      ref={ref}
      id={id}
      className={className}
      {...attrs}
      style={{ ...style, ...(delay ? { "--reveal-delay": `${delay}ms` } : {}) } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
