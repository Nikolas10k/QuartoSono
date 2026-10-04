import Link from "next/link";
import type { ProductSummary } from "@/types/catalog";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, filtered }: { products: ProductSummary[]; filtered: boolean }) {
  if (products.length === 0) {
    return (
      <div className="border-t border-graphite/10 py-20 text-center">
        <p className="font-serif text-3xl italic">
          {filtered ? "Nenhum produto encontrado." : "Catálogo em atualização."}
        </p>
        <p className="mx-auto mt-4 max-w-md text-graphite/70">
          {filtered
            ? "Tente outros termos ou remova algum filtro. Se preferir, fale com a loja — temos mais opções no showroom."
            : "Em breve nossos produtos estarão aqui. Fale com a loja para conhecer as opções disponíveis."}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {filtered && (
            <Link
              href="/produtos"
              className="inline-flex h-11 items-center rounded-full border border-graphite/20 px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] hover:border-graphite"
            >
              Ver todos
            </Link>
          )}
          <a
            href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center rounded-full bg-graphite px-5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-paper hover:bg-ink"
          >
            Falar com a loja
          </a>
        </div>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 md:gap-y-16 xl:grid-cols-4">
      {products.map((p, i) => (
        <li key={p.id} className={i === 0 && !filtered && products.length > 4 ? "col-span-2 md:col-span-2" : undefined}>
          <ProductCard product={p} index={i} priority={i < 2} large={i === 0 && !filtered && products.length > 4} />
        </li>
      ))}
    </ul>
  );
}
