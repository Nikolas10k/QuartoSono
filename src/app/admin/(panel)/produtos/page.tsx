import Link from "next/link";
import { Plus } from "lucide-react";
import { listAdminProducts } from "@/services/admin-products";
import { ProductList } from "@/components/admin/ProductList";

export const metadata = { title: "Produtos" };

export default async function AdminProductsPage() {
  const products = await listAdminProducts();
  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Produtos <span className="text-base font-normal text-stone tabular-nums">({products.length})</span>
        </h1>
        <Link
          href="/admin/produtos/novo"
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-graphite px-4 text-sm font-medium text-paper hover:bg-ink"
        >
          <Plus className="size-4" aria-hidden /> Novo
        </Link>
      </div>
      <ProductList products={products} />
    </div>
  );
}
