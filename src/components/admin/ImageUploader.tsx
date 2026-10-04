"use client";

/* eslint-disable @next/next/no-img-element -- previews locais (blob:) não passam pelo next/image */
import { useRef, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, GripVertical, ImagePlus, RotateCcw, Star, X, AlertCircle } from "lucide-react";
import { MAX_IMAGES, type ImageUploadsApi } from "@/hooks/useImageUploads";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/cn";

export function ImageUploader({ api, error }: { api: ImageUploadsApi; error?: string }) {
  const { items, addFiles, remove, retry, move, makeCover } = api;
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [dragKey, setDragKey] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    const { rejected } = addFiles(files);
    if (rejected > 0) toast.info(`Máximo de ${MAX_IMAGES} fotos. ${rejected} não ${rejected === 1 ? "foi adicionada" : "foram adicionadas"}.`);
    if (inputRef.current) inputRef.current.value = "";
  }

  // Reordenação por arraste com Pointer Events (mouse + toque)
  function onGripDown(e: React.PointerEvent, key: string) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setDragKey(key);
  }
  function onGripMove(e: React.PointerEvent) {
    if (!dragKey) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>("[data-tile-index]");
    if (!el) return;
    const to = Number(el.dataset.tileIndex);
    const from = items.findIndex((i) => i.key === dragKey);
    if (from !== -1 && to !== from) move(from, to);
  }
  function onGripUp() {
    setDragKey(null);
  }

  const canAdd = items.length < MAX_IMAGES;

  return (
    <div>
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "rounded-[var(--radius-md)] transition-colors",
          dragOver && "bg-linen outline-2 outline-dashed outline-graphite/40",
        )}
      >
        {items.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-12 text-center transition-colors",
              error ? "border-danger/50 bg-danger/5" : "border-graphite/20 hover:border-graphite/50 hover:bg-white",
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-full bg-graphite text-paper">
              <Camera className="size-6" aria-hidden />
            </span>
            <span className="text-base font-medium">Tirar foto ou escolher da galeria</span>
            <span className="text-sm text-stone">Até {MAX_IMAGES} fotos · a primeira será a capa</span>
          </button>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5" aria-label="Fotos do produto">
            {items.map((it, i) => (
              <li
                key={it.key}
                data-tile-index={i}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-[var(--radius-sm)] bg-linen transition-[opacity,transform] duration-200",
                  dragKey === it.key && "z-10 scale-[1.04] opacity-70 shadow-lg",
                )}
              >
                <img src={it.preview} alt={`Foto ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />

                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 rounded-full bg-graphite px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-paper">
                    Capa
                  </span>
                )}

                {(it.status === "processing" || it.status === "uploading") && (
                  <div className="absolute inset-0 flex flex-col justify-end bg-ink/35">
                    <div className="px-2 pb-1 text-[0.6875rem] font-medium text-paper">
                      {it.status === "processing" ? "Otimizando…" : `${it.progress}%`}
                    </div>
                    <div
                      className="h-1 w-full bg-paper/30"
                      role="progressbar"
                      aria-valuenow={it.progress}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Enviando foto ${i + 1}`}
                    >
                      <div className="h-full bg-paper transition-[width] duration-200" style={{ width: `${it.progress}%` }} />
                    </div>
                  </div>
                )}

                {it.status === "error" && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90 p-2 text-center">
                    <AlertCircle className="size-5 text-danger" aria-hidden />
                    <p className="line-clamp-3 text-[0.6875rem] leading-tight text-danger">{it.error}</p>
                    {it.file && (
                      <button
                        type="button"
                        onClick={() => retry(it.key)}
                        className="inline-flex items-center gap-1 rounded-full bg-graphite px-2.5 py-1 text-[0.6875rem] text-paper"
                      >
                        <RotateCcw className="size-3" aria-hidden /> Tentar de novo
                      </button>
                    )}
                  </div>
                )}

                {/* Ações */}
                <button
                  type="button"
                  onClick={() => remove(it.key)}
                  aria-label={`Remover foto ${i + 1}`}
                  className="absolute right-1 top-1 flex size-8 items-center justify-center rounded-full bg-ink/70 text-paper hover:bg-ink"
                >
                  <X className="size-4" aria-hidden />
                </button>

                {it.status === "done" && (
                  <div className="absolute inset-x-1 bottom-1 flex items-center justify-between gap-1">
                    <button
                      type="button"
                      onPointerDown={(e) => onGripDown(e, it.key)}
                      onPointerMove={onGripMove}
                      onPointerUp={onGripUp}
                      onPointerCancel={onGripUp}
                      aria-label="Arrastar para reordenar"
                      className="flex size-8 cursor-grab touch-none items-center justify-center rounded-full bg-paper/90 active:cursor-grabbing"
                    >
                      <GripVertical className="size-4" aria-hidden />
                    </button>
                    <div className="flex gap-1">
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => move(i, i - 1)}
                          aria-label="Mover para a esquerda"
                          className="hidden size-8 items-center justify-center rounded-full bg-paper/90 sm:flex"
                        >
                          <ChevronLeft className="size-4" aria-hidden />
                        </button>
                      )}
                      {i < items.length - 1 && (
                        <button
                          type="button"
                          onClick={() => move(i, i + 1)}
                          aria-label="Mover para a direita"
                          className="hidden size-8 items-center justify-center rounded-full bg-paper/90 sm:flex"
                        >
                          <ChevronRight className="size-4" aria-hidden />
                        </button>
                      )}
                      {i > 0 && (
                        <button
                          type="button"
                          onClick={() => makeCover(it.key)}
                          aria-label="Usar como capa"
                          title="Usar como capa"
                          className="flex size-8 items-center justify-center rounded-full bg-paper/90"
                        >
                          <Star className="size-4" aria-hidden />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            ))}

            {canAdd && (
              <li>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex aspect-square w-full flex-col items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border-2 border-dashed border-graphite/20 text-stone transition-colors hover:border-graphite/50 hover:text-graphite"
                >
                  <ImagePlus className="size-6" aria-hidden />
                  <span className="text-[0.75rem] font-medium">Adicionar</span>
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="mt-2 text-[0.8125rem] text-stone">
        {items.length}/{MAX_IMAGES} fotos · arraste <GripVertical className="inline size-3.5 align-[-2px]" aria-hidden /> para
        reordenar · toque na <Star className="inline size-3.5 align-[-2px]" aria-hidden /> para trocar a capa
      </p>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
