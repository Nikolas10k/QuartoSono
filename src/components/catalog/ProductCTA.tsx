"use client";

import { useEffect, useRef, useState } from "react";
import { productWhatsappUrl } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { cn } from "@/lib/cn";

/**
 * CTA principal + versões persistentes:
 * - desktop: cápsula flutuante elegante quando o botão principal sai da tela
 * - mobile: barra inferior fixa
 */
export function ProductCTA({ name, priceLabel }: { name: string; priceLabel: string }) {
  const href = productWhatsappUrl(name);
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const el = anchorRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowFloating(!e.isIntersecting && e.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a
        ref={anchorRef}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-graphite px-8 text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-[var(--duration-fast)] hover:bg-ink sm:w-auto"
      >
        <WhatsappIcon className="size-5" />
        Consultar pelo WhatsApp
      </a>

      {/* Desktop: cápsula flutuante */}
      <div
        aria-hidden={!showFloating}
        className={cn(
          "fixed bottom-6 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-6 rounded-full border border-graphite/10 bg-paper/90 py-2 pl-6 pr-2 shadow-[0_24px_60px_-24px_rgba(13,13,13,0.45)] backdrop-blur-md md:flex",
          "transition-[opacity,transform] duration-[var(--duration-normal)] ease-[var(--ease-calm)]",
          showFloating ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0",
        )}
      >
        <div className="max-w-[22rem]">
          <p className="truncate text-sm font-medium uppercase tracking-[0.02em]">{name}</p>
          <p className="text-[0.75rem] text-stone">{priceLabel}</p>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={showFloating ? 0 : -1}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-graphite px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink"
        >
          <WhatsappIcon className="size-4" /> Consultar
        </a>
      </div>

      {/* Mobile: barra inferior fixa */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-graphite/10 bg-paper/95 px-4 pt-3 pb-safe backdrop-blur-md md:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.8125rem] font-medium uppercase">{name}</p>
            <p className="text-[0.75rem] text-stone">{priceLabel}</p>
          </div>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-graphite px-5 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-paper"
          >
            <WhatsappIcon className="size-4" /> WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}
