"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SITE, STORES } from "@/lib/site";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";

const LINKS = [{ href: "/", label: "Início" }, ...NAV_LINKS];

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    panelRef.current?.querySelector<HTMLElement>("a")?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div
      id="menu-mobile"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed inset-0 z-40 flex flex-col bg-paper pt-16 md:hidden",
        "transition-[clip-path] duration-[900ms] ease-[var(--ease-editorial)]",
        open ? "[clip-path:inset(0_0_0_0)]" : "pointer-events-none [clip-path:inset(0_0_100%_0)]",
      )}
    >
      <nav aria-label="Menu mobile" className="container-editorial flex flex-1 flex-col justify-center">
        <ul className="space-y-1">
          {LINKS.map((link, i) => (
            <li key={link.href} className="overflow-hidden">
              <Link
                href={link.href}
                onClick={onClose}
                className={cn(
                  "flex items-baseline gap-4 py-1 text-[clamp(2.75rem,13vw,4.5rem)] font-medium uppercase leading-[0.95] tracking-[-0.03em]",
                  "transition-transform duration-[900ms] ease-[var(--ease-calm)]",
                  open ? "translate-y-0" : "translate-y-full",
                )}
                style={{ transitionDelay: open ? `${180 + i * 70}ms` : "0ms" }}
              >
                <span className="font-serif text-base font-normal italic normal-case tracking-normal text-stone">
                  0{i + 1}
                </span>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div
        className={cn(
          "container-editorial grid grid-cols-2 gap-6 border-t border-graphite/10 py-6 pb-safe text-sm transition-opacity duration-[700ms]",
          open ? "opacity-100 delay-500" : "opacity-0",
        )}
      >
        <div>
          <p className="eyebrow mb-2 text-stone">Lojas</p>
          {STORES.map((s) => (
            <p key={s.id}>{s.neighborhood}</p>
          ))}
        </div>
        <div className="space-y-2">
          <p className="eyebrow mb-2 text-stone">Contato</p>
          <a
            href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1"
          >
            WhatsApp <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
          <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
            Instagram <ArrowUpRight className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  );
}
