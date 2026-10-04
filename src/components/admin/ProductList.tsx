"use client";

/* eslint-disable @next/next/no-img-element -- miniaturas pequenas do painel */
import Link from "next/link";
import { useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import { ExternalLink, Pencil, Search, Star, Trash2, Plus } from "lucide-react";
import type { ProductSummary } from "@/types/catalog";
import { deleteProduct, toggleProductFlag } from "@/actions/products";
import { useToast } from "@/components/ui/Toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Flag = "available" | "featured" | "published";
type OptimisticAction = { id: string; field: Flag; value: boolean } | { id: string; deleted: true };

export function ProductList({ products }: { products: ProductSummary[] }) {
  const toast = useToast();
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft" | "unavailable" | "featured">("all");
  const [pendingDelete, setPendingDelete] = useState<ProductSummary | null>(null);
  const [deleting, setDeleting] = useState(false);
  const busy = useRef(new Set<string>());

  const [items, applyOptimistic] = useOptimistic(products, (state, action: OptimisticAction) => {
    if ("deleted" in action) return state.filter((p) => p.id !== action.id);
    return state.map((p) => (p.id === action.id ? { ...p, [action.field]: action.value } : p));
  });

  const visible = useMemo(() => {
    const term = q
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .trim();
    return items.filter((p) => {
      if (filter === "published" && !p.published) return false;
      if (filter === "draft" && p.published) return false;
      if (filter === "unavailable" && p.available) return false;
      if (filter === "featured" && !p.featured) return false;
      if (!term) return true;
      const hay = `${p.name} ${p.brand ?? ""} ${p.category?.name ?? ""}`
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
      return hay.includes(term);
    });
  }, [items, q, filter]);

  function toggle(p: ProductSummary, field: Flag) {
    const key = `${p.id}:${field}`;
    if (busy.current.has(key)) return;
    busy.current.add(key);
    const value = !p[field];
    startTransition(async () => {
      applyOptimistic({ id: p.id, field, value });
      const res = await toggleProductFlag({ id: p.id, field, value });
      busy.current.delete(key);
      if (!res.ok) toast.error(res.error);
      else {
        const msg: Record<Flag, [string, string]> = {
          available: ["Marcado como disponível.", "Marcado como indisponível — saiu do catálogo."],
          featured: ["Adicionado aos destaques.", "Removido dos destaques."],
          published: ["Produto publicado.", "Produto voltou para rascunho."],
        };
        toast.success(value ? msg[field][0] : msg[field][1]);
      }
    });
  }

  async function confirmDelete() {
    if (!pendingDelete || deleting) return;
    setDeleting(true);
    const target = pendingDelete;
    startTransition(async () => {
      applyOptimistic({ id: target.id, deleted: true });
      const res = await deleteProduct(target.id);
      setDeleting(false);
      setPendingDelete(null);
      if (!res.ok) toast.error(res.error);
      else toast.success("Produto excluído.");
    });
  }

  if (products.length === 0) {
    return (
      <div className="rounded-[var(--radius-md)] border border-dashed border-graphite/20 bg-white px-6 py-16 text-center">
        <p className="text-lg font-medium">Nenhum produto cadastrado.</p>
        <p className="mt-1 text-sm text-stone">Leva cerca de um minuto: fotos, nome, categoria e publicar.</p>
        <Link
          href="/admin/produtos/novo"
          className="mt-6 inline-flex h-12 items-center gap-2 rounded-[var(--radius-md)] bg-graphite px-6 text-sm font-medium text-paper hover:bg-ink"
        >
          <Plus className="size-4" aria-hidden /> Cadastrar primeiro produto
        </Link>
      </div>
    );
  }

  const FILTERS = [
    ["all", "Todos"],
    ["published", "Publicados"],
    ["draft", "Rascunhos"],
    ["unavailable", "Indisponíveis"],
    ["featured", "Destaques"],
  ] as const;

  return (
    <div>
      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-stone" aria-hidden />
          <label htmlFor="admin-busca" className="sr-only">
            Buscar produto
          </label>
          <input
            id="admin-busca"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar produto"
            className="h-12 w-full rounded-[var(--radius-md)] border border-graphite/15 bg-white pl-10 pr-3 text-base outline-none focus:border-graphite"
          />
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
          {FILTERS.map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setFilter(v)}
              aria-pressed={filter === v}
              className={cn(
                "h-9 shrink-0 rounded-full border px-4 text-sm",
                filter === v ? "border-graphite bg-graphite text-paper" : "border-graphite/15 bg-white",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-stone">Nenhum produto corresponde à busca.</p>
      ) : (
        <ul className="divide-y divide-graphite/10 overflow-hidden rounded-[var(--radius-md)] border border-graphite/10 bg-white">
          {visible.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4">
              <Link href={`/admin/produtos/${p.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-linen">
                  {p.cover && <img src={p.cover.public_url} alt="" className="h-full w-full object-cover" loading="lazy" />}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.name}</span>
                  <span className="block truncate text-[0.8125rem] text-stone">
                    {[p.category?.name, p.brand].filter(Boolean).join(" · ") || "—"}
                  </span>
                  <span className="mt-1.5 flex flex-wrap gap-1.5">
                    <Badge tone={p.published ? "published" : "draft"}>{p.published ? "Publicado" : "Rascunho"}</Badge>
                    <Badge tone={p.available ? "available" : "unavailable"}>
                      {p.available ? "Disponível" : "Indisponível"}
                    </Badge>
                    {p.featured && (
                      <Badge tone="featured">
                        <Star className="size-3 fill-current" aria-hidden /> Destaque
                      </Badge>
                    )}
                  </span>
                </span>
              </Link>

              <div className="flex items-center gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => toggle(p, "available")}
                  aria-pressed={p.available}
                  className={cn(
                    "h-10 flex-1 rounded-[var(--radius-md)] border px-3 text-[0.8125rem] font-medium transition-colors sm:flex-none",
                    p.available ? "border-success/30 bg-success/5 text-success" : "border-danger/30 bg-danger/5 text-danger",
                  )}
                >
                  {p.available ? "Disponível" : "Indisponível"}
                </button>
                <button
                  type="button"
                  onClick={() => toggle(p, "featured")}
                  aria-pressed={p.featured}
                  aria-label={p.featured ? "Remover dos destaques" : "Destacar"}
                  title={p.featured ? "Remover dos destaques" : "Destacar"}
                  className={cn(
                    "flex size-10 items-center justify-center rounded-[var(--radius-md)] border transition-colors",
                    p.featured ? "border-graphite bg-graphite text-paper" : "border-graphite/15 hover:border-graphite",
                  )}
                >
                  <Star className={cn("size-4", p.featured && "fill-current")} aria-hidden />
                </button>
                <Link
                  href={`/admin/produtos/${p.id}`}
                  aria-label={`Editar ${p.name}`}
                  title="Editar"
                  className="flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-graphite/15 hover:border-graphite"
                >
                  <Pencil className="size-4" aria-hidden />
                </Link>
                {p.published && (
                  <a
                    href={`/produtos/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver ${p.name} no site`}
                    title="Ver no site"
                    className="flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-graphite/15 hover:border-graphite"
                  >
                    <ExternalLink className="size-4" aria-hidden />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setPendingDelete(p)}
                  aria-label={`Excluir ${p.name}`}
                  title="Excluir"
                  className="flex size-10 items-center justify-center rounded-[var(--radius-md)] border border-graphite/15 text-danger hover:border-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {pendingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="del-title"
          aria-describedby="del-desc"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 sm:items-center"
          onKeyDown={(e) => e.key === "Escape" && !deleting && setPendingDelete(null)}
        >
          <div className="w-full max-w-sm rounded-[var(--radius-md)] bg-white p-6 shadow-2xl">
            <h2 id="del-title" className="text-lg font-semibold">
              Excluir este produto permanentemente?
            </h2>
            <p id="del-desc" className="mt-2 text-sm text-stone">
              “{pendingDelete.name}” e suas fotos serão apagados. Esta ação não pode ser desfeita. Para apenas tirar do
              site, marque como indisponível.
            </p>
            <div className="mt-6 flex gap-3">
              <Button
                variant="ghost"
                className="flex-1"
                autoFocus
                disabled={deleting}
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" loading={deleting} onClick={confirmDelete}>
                Excluir
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
