"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { NAV_LINKS, SITE } from "@/lib/site";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { cn } from "@/lib/cn";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao navegar
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded focus:bg-graphite focus:px-4 focus:py-2 focus:text-paper"
      >
        Pular para o conteúdo
      </a>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-[var(--duration-normal)] ease-[var(--ease-calm)]",
          scrolled || open
            ? "bg-paper/85 shadow-[0_1px_0_rgba(38,38,38,0.08)] backdrop-blur-md"
            : "bg-transparent",
        )}
      >
        <div className="container-editorial grid h-16 grid-cols-[1fr_auto] items-center gap-6 md:h-[4.5rem] md:grid-cols-[1fr_auto_1fr]">
          <Logo />

          <p className="eyebrow hidden text-[0.6875rem] text-stone md:block">
            {SITE.yearsOfExperience} anos de experiência · Brasília — DF
          </p>

          <nav aria-label="Principal" className="hidden justify-end md:flex">
            <ul className="flex items-center gap-7">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "link-underline pb-0.5 text-[0.8125rem] tracking-[0.02em]",
                        active ? "bg-[length:100%_1px] text-graphite" : "text-graphite/75 hover:text-graphite",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
              <li>
                <a
                  href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center rounded-full border border-graphite/20 px-4 text-[0.75rem] font-medium uppercase tracking-[0.14em] transition-colors duration-[var(--duration-fast)] hover:border-graphite hover:bg-graphite hover:text-paper"
                >
                  Orçamento
                </a>
              </li>
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="relative -mr-2 flex h-11 w-11 items-center justify-center md:hidden"
          >
            <span className="sr-only">Menu</span>
            <span aria-hidden className="relative block h-3 w-6">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-6 bg-graphite transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)]",
                  open && "translate-y-[6px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-px w-6 bg-graphite transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)]",
                  open && "-translate-y-[5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
