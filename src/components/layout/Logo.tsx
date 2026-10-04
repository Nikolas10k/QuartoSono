import Link from "next/link";
import { cn } from "@/lib/cn";

/** Marca tipográfica (sem reproduzir o logotipo oficial, que deve ser fornecido pela loja). */
export function Logo({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <Link
      href="/"
      onClick={onClick}
      aria-label="Quarto Sono Colchões — página inicial"
      className={cn("group inline-flex items-center gap-2.5 leading-none", className)}
    >
      <span
        aria-hidden
        className="block size-2 rounded-full bg-current transition-transform duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:scale-150"
      />
      <span className="text-[0.8125rem] font-semibold uppercase tracking-[0.2em]">
        Quarto <span className="font-serif text-[1.05em] font-normal italic normal-case tracking-normal">Sono</span>
      </span>
    </Link>
  );
}
