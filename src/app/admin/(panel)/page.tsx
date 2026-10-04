import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";
import { getAdminStats, listAdminProducts } from "@/services/admin-products";
import { ProductList } from "@/components/admin/ProductList";

export const metadata = { title: "Início" };

export default async function AdminDashboard() {
  const [stats, recent] = await Promise.all([getAdminStats(), listAdminProducts({ limit: 5 })]);
  const cards = [
    { label: "Publicados", value: stats.published },
    { label: "Disponíveis", value: stats.available },
    { label: "Indisponíveis", value: stats.unavailable },
    { label: "Destaques", value: stats.featured },
  ];

  return (
    <div className="space-y-8">
      <Link
        href="/admin/produtos/novo"
        className="flex h-16 w-full items-center justify-center gap-3 rounded-[var(--radius-md)] bg-graphite text-base font-semibold uppercase tracking-[0.08em] text-paper shadow-[0_12px_30px_-14px_rgba(13,13,13,0.6)] transition-colors hover:bg-ink"
      >
        <Plus className="size-5" aria-hidden /> Novo produto
      </Link>

      <section aria-labelledby="resumo">
        <h1 id="resumo" className="sr-only">
          Resumo do catálogo
        </h1>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-[var(--radius-md)] border border-graphite/10 bg-white p-4">
              <dt className="text-[0.8125rem] text-stone">{c.label}</dt>
              <dd className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">{c.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="recentes">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="recentes" className="font-semibold">
            Atualizados recentemente
          </h2>
          {stats.total > 0 && (
            <Link href="/admin/produtos" className="inline-flex items-center gap-1 text-sm text-stone hover:text-graphite">
              Ver todos ({stats.total}) <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          )}
        </div>
        <ProductList products={recent} />
      </section>
    </div>
  );
}
