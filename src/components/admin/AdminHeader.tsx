"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { ExternalLink, LogOut, Loader2 } from "lucide-react";
import { signOut } from "@/actions/auth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin", label: "Início" },
  { href: "/admin/produtos", label: "Produtos" },
];

function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-label="Sair"
      title="Sair"
      className="flex size-10 items-center justify-center rounded-[var(--radius-md)] text-graphite/70 hover:bg-graphite/5 hover:text-graphite"
    >
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <LogOut className="size-4" aria-hidden />}
    </button>
  );
}

export function AdminHeader({ email }: { email: string }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-graphite/10 bg-paper/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center gap-2 px-4">
        <Link href="/admin" className="mr-2 text-[0.8125rem] font-semibold uppercase tracking-[0.18em]">
          Quarto <span className="font-serif text-[1.05em] font-normal normal-case italic tracking-normal">Sono</span>
        </Link>
        <nav aria-label="Painel" className="flex flex-1 gap-1">
          {NAV.map((n) => {
            const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded-[var(--radius-md)] px-3 py-2 text-sm",
                  active ? "bg-graphite/5 font-medium" : "text-graphite/70 hover:text-graphite",
                )}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title="Ver site"
          aria-label="Ver site"
          className="flex size-10 items-center justify-center rounded-[var(--radius-md)] text-graphite/70 hover:bg-graphite/5 hover:text-graphite"
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <form action={signOut}>
          <span className="sr-only">Conectado como {email}</span>
          <LogoutButton />
        </form>
      </div>
    </header>
  );
}
