"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { cn } from "@/lib/cn";

/**
 * CTA flutuante discreto (desktop e mobile) para páginas sem CTA de produto.
 * Em /produtos/[slug] a página de produto exibe seu próprio CTA contextual.
 */
export function WhatsappFloat() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (/^\/produtos\/[^/]+$/.test(pathname)) return null;

  return (
    <a
      href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a Quarto Sono pelo WhatsApp"
      className={cn(
        "group fixed bottom-5 right-5 z-30 flex h-12 items-center gap-0 overflow-hidden rounded-full bg-graphite pl-3.5 pr-3.5 text-paper shadow-[0_18px_40px_-16px_rgba(13,13,13,0.55)]",
        "transition-[opacity,transform,gap,padding] duration-[var(--duration-normal)] ease-[var(--ease-calm)] hover:gap-2.5 hover:pr-5 focus-visible:gap-2.5 focus-visible:pr-5",
        "mb-[env(safe-area-inset-bottom)]",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <WhatsappIcon className="size-5 shrink-0" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-[max-width] duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:max-w-40 group-focus-visible:max-w-40">
        Fale conosco
      </span>
    </a>
  );
}
