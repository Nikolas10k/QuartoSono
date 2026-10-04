"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { ProductImage } from "@/types/catalog";
import { cn } from "@/lib/cn";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback((dir: 1 | -1) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (zoom && !d.open) d.showModal();
    if (!zoom && d.open) d.close();
  }, [zoom]);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoom, go]);

  if (count === 0) {
    return (
      <div className="surface-linen grain relative grid aspect-[4/5] place-items-center">
        <span className="font-serif text-xl italic text-graphite/40">Foto em breve</span>
      </div>
    );
  }

  const current = images[index];

  return (
    <div className="md:sticky md:top-24">
      <div
        className="group relative aspect-[4/5] overflow-hidden bg-linen"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null || count < 2) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {images.map((img, i) => (
          <Image
            key={img.id}
            src={img.public_url}
            alt={i === 0 ? name : `${name} — foto ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(max-width: 767px) 100vw, 55vw"
            className={cn(
              "object-cover transition-opacity duration-[600ms] ease-[var(--ease-calm)]",
              i === index ? "opacity-100" : "opacity-0",
            )}
          />
        ))}

        <button
          type="button"
          onClick={() => setZoom(true)}
          className="absolute right-3 top-3 flex h-10 items-center gap-2 rounded-full bg-paper/85 px-4 text-[0.6875rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm transition-colors hover:bg-paper"
        >
          <Expand className="size-3.5" aria-hidden /> Ampliar
        </button>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Foto anterior"
              className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 opacity-0 backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Próxima foto"
              className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-paper/80 opacity-0 backdrop-blur-sm transition-opacity focus-visible:opacity-100 group-hover:opacity-100 max-md:opacity-100"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
            <p className="absolute bottom-3 left-3 rounded-full bg-paper/85 px-3 py-1 text-[0.6875rem] tabular-nums backdrop-blur-sm" aria-live="polite">
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" aria-label="Miniaturas">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === index}
                className={cn(
                  "relative block h-20 w-16 overflow-hidden bg-linen transition-opacity md:h-24 md:w-20",
                  i === index ? "opacity-100 ring-1 ring-graphite ring-offset-2 ring-offset-paper" : "opacity-60 hover:opacity-100",
                )}
              >
                <Image src={img.public_url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        onClose={() => setZoom(false)}
        onClick={(e) => e.target === e.currentTarget && setZoom(false)}
        aria-label={`Fotos de ${name}`}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/95 p-0 text-paper backdrop:bg-ink/80"
      >
        {zoom && (
          <div className="relative flex h-full w-full items-center justify-center">
            <div className="relative h-[86dvh] w-[94vw]">
              <Image src={current.public_url} alt={name} fill sizes="94vw" className="object-contain" />
            </div>
            <button
              type="button"
              onClick={() => setZoom(false)}
              aria-label="Fechar"
              className="on-dark absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-paper/10 hover:bg-paper/20"
            >
              <X className="size-5" aria-hidden />
            </button>
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Foto anterior"
                  className="on-dark absolute left-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 hover:bg-paper/20"
                >
                  <ChevronLeft className="size-6" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Próxima foto"
                  className="on-dark absolute right-4 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-paper/10 hover:bg-paper/20"
                >
                  <ChevronRight className="size-6" aria-hidden />
                </button>
              </>
            )}
          </div>
        )}
      </dialog>
    </div>
  );
}
