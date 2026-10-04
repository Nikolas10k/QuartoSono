import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";

export const metadata: Metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col bg-paper">
      <div className="container-editorial flex h-16 items-center md:h-[4.5rem]">
        <Logo />
      </div>
      <main className="container-editorial flex flex-1 flex-col justify-center pb-20">
        <p className="eyebrow mb-6 text-stone">Erro 404</p>
        <h1 className="text-[length:var(--text-display)] font-medium uppercase leading-[0.92] tracking-[-0.035em]">
          Esta página
          <br />
          <span className="font-serif font-normal lowercase italic">foi dormir.</span>
        </h1>
        <p className="mt-8 max-w-md text-lg text-graphite/70">
          O endereço pode ter mudado ou o produto não está mais disponível.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="inline-flex h-12 items-center rounded-full bg-graphite px-6 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink"
          >
            Voltar ao início
          </Link>
          <Link
            href="/produtos"
            className="inline-flex h-12 items-center rounded-full border border-graphite/20 px-6 text-[0.75rem] font-medium uppercase tracking-[0.14em] hover:border-graphite"
          >
            Ver produtos
          </Link>
        </div>
      </main>
    </div>
  );
}
