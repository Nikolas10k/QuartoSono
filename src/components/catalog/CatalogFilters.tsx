"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Search, X, Loader2 } from "lucide-react";
import type { Category } from "@/types/catalog";
import { cn } from "@/lib/cn";

type Props = {
  categories: Category[];
  brands: string[];
  sizes: string[];
  /** Em /categorias/[slug] a categoria é fixa */
  lockedCategory?: string;
};

export function CatalogFilters({ categories, brands, sizes, lockedCategory }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const debounce = useRef<number | undefined>(undefined);

  const current = {
    categoria: lockedCategory ?? params.get("categoria") ?? "",
    marca: params.get("marca") ?? "",
    tamanho: params.get("tamanho") ?? "",
  };

  function update(next: Record<string, string>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v) sp.set(k, v);
      else sp.delete(k);
    }
    if (lockedCategory) sp.delete("categoria");
    const qs = sp.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  // Busca com debounce
  useEffect(() => {
    if ((params.get("q") ?? "") === q) return;
    window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => update({ q: q.trim() }), 350);
    return () => window.clearTimeout(debounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const hasFilters = Boolean(params.get("q") || current.marca || current.tamanho || (!lockedCategory && current.categoria));

  return (
    <form
      role="search"
      action={pathname}
      onSubmit={(e) => {
        e.preventDefault();
        update({ q: q.trim() });
      }}
      className="space-y-6"
    >
      <div className="relative">
        <label htmlFor="busca" className="sr-only">
          Buscar por nome, marca ou categoria
        </label>
        <Search className="pointer-events-none absolute left-0 top-1/2 size-5 -translate-y-1/2 text-stone" aria-hidden />
        <input
          id="busca"
          name="q"
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, marca ou categoria"
          autoComplete="off"
          className="h-14 w-full border-b border-graphite/20 bg-transparent pl-9 pr-10 text-lg outline-none transition-colors placeholder:text-stone focus:border-graphite"
        />
        {pending && <Loader2 className="absolute right-0 top-1/2 size-4 -translate-y-1/2 animate-spin text-stone" aria-label="Carregando" />}
      </div>

      {!lockedCategory && (
        <fieldset>
          <legend className="sr-only">Categoria</legend>
          <div className="no-scrollbar -mx-[var(--spacing-gutter)] flex gap-2 overflow-x-auto px-[var(--spacing-gutter)] md:mx-0 md:flex-wrap md:px-0">
            <Chip active={!current.categoria} onClick={() => update({ categoria: "" })}>
              Todos
            </Chip>
            {categories.map((c) => (
              <Chip key={c.id} active={current.categoria === c.slug} onClick={() => update({ categoria: c.slug })}>
                {c.name}
              </Chip>
            ))}
          </div>
        </fieldset>
      )}

      {(brands.length > 0 || sizes.length > 0) && (
        <div className="flex flex-wrap items-center gap-3">
          {brands.length > 0 && (
            <Select
              id="marca"
              label="Marca"
              value={current.marca}
              options={brands}
              onChange={(v) => update({ marca: v })}
            />
          )}
          {sizes.length > 0 && (
            <Select
              id="tamanho"
              label="Tamanho"
              value={current.tamanho}
              options={sizes}
              onChange={(v) => update({ tamanho: v })}
            />
          )}
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                update({ q: "", marca: "", tamanho: "", categoria: "" });
              }}
              className="inline-flex h-10 items-center gap-1.5 px-2 text-[0.75rem] font-medium uppercase tracking-[0.12em] text-stone hover:text-graphite"
            >
              <X className="size-3.5" aria-hidden /> Limpar filtros
            </button>
          )}
        </div>
      )}
    </form>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 shrink-0 rounded-full border px-4 text-[0.75rem] font-medium uppercase tracking-[0.12em] transition-colors duration-[var(--duration-fast)]",
        active ? "border-graphite bg-graphite text-paper" : "border-graphite/15 hover:border-graphite",
      )}
    >
      {children}
    </button>
  );
}

function Select({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "h-10 appearance-none rounded-full border bg-transparent pl-4 pr-9 text-[0.75rem] font-medium uppercase tracking-[0.12em] outline-none transition-colors",
          value ? "border-graphite" : "border-graphite/15 hover:border-graphite",
        )}
      >
        <option value="">{label}: todas</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[0.6rem]">
        ▼
      </span>
    </div>
  );
}
