import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminCategories } from "@/services/admin-products";
import { NewProductFlow } from "@/components/admin/NewProductFlow";
import { SITE } from "@/lib/site";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const categories = await getAdminCategories();
  return (
    <div>
      <Link href="/admin/produtos" className="mb-4 inline-flex items-center gap-1.5 text-sm text-stone hover:text-graphite">
        <ArrowLeft className="size-4" aria-hidden /> Produtos
      </Link>
      <h1 className="mb-8 text-2xl font-semibold tracking-tight">Novo produto</h1>
      <NewProductFlow categories={categories} siteUrl={SITE.url} />
    </div>
  );
}
