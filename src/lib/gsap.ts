"use client";

import type { gsap as GSAP } from "gsap";
import type { ScrollTrigger as ST } from "gsap/ScrollTrigger";

let loaded: Promise<{ gsap: typeof GSAP; ScrollTrigger: typeof ST }> | null = null;

/** Carrega GSAP + ScrollTrigger sob demanda (fora do bundle inicial). */
export function loadGsap() {
  if (!loaded) {
    loaded = Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([g, s]) => {
      g.gsap.registerPlugin(s.ScrollTrigger);
      g.gsap.defaults({ ease: "power3.out" });
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger };
    });
  }
  return loaded;
}

/** Equivalentes GSAP das curvas do design system */
export const EASE = {
  calm: "expo.out",
  editorial: "power4.inOut",
  soft: "power2.inOut",
} as const;
