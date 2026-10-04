"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, Copy, ExternalLink, Plus, Pencil } from "lucide-react";
import type { Category } from "@/types/catalog";
import { emptyProductForm } from "@/schemas/product";
import { useToast } from "@/components/ui/Toast";
import { ProductForm } from "./ProductForm";

type Done = { id: string; slug: string; published: boolean };

/** Cria → confirma → "Adicionar outro" remonta o formulário com um novo id. */
export function NewProductFlow({ categories, siteUrl }: { categories: Category[]; siteUrl: string }) {
  const [productId, setProductId] = useState(() => crypto.randomUUID());
  const [done, setDone] = useState<Done | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  if (done) {
    const url = `${siteUrl}/produtos/${done.slug}`;
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-graphite text-paper">
          <Check className="size-8" aria-hidden />
        </span>
        <h2 className="mt-6 text-3xl font-semibold tracking-tight" role="status">
          {done.published ? "Produto publicado." : "Rascunho salvo."}
        </h2>
        <p className="mt-2 max-w-sm text-stone">
          {done.published
            ? "Ele já aparece no catálogo do site."
            : "Ele ainda não aparece no site. Publique quando quiser."}
        </p>

        <div className="mt-8 grid w-full max-w-sm gap-3">
          {done.published ? (
            <>
              <a
                href={`/produtos/${done.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-graphite text-sm font-medium text-paper hover:bg-ink"
              >
                <ExternalLink className="size-4" aria-hidden /> Ver produto
              </a>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(url);
                    setCopied(true);
                    toast.success("Link copiado.");
                    setTimeout(() => setCopied(false), 2000);
                  } catch {
                    toast.error("Não foi possível copiar. Link: " + url);
                  }
                }}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-graphite/15 bg-white text-sm font-medium hover:border-graphite"
              >
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? "Copiado" : "Copiar link"}
              </button>
            </>
          ) : (
            <Link
              href={`/admin/produtos/${done.id}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-graphite text-sm font-medium text-paper hover:bg-ink"
            >
              <Pencil className="size-4" aria-hidden /> Continuar editando
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              setDone(null);
              setProductId(crypto.randomUUID());
              window.scrollTo({ top: 0 });
            }}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-graphite/15 bg-white text-sm font-medium hover:border-graphite"
          >
            <Plus className="size-4" aria-hidden /> Adicionar outro
          </button>
          <Link href="/admin/produtos" className="mt-2 text-sm text-stone underline-offset-4 hover:underline">
            Ver todos os produtos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProductForm
      key={productId}
      mode="create"
      productId={productId}
      categories={categories}
      defaultValues={emptyProductForm()}
      onCreated={setDone}
    />
  );
}
