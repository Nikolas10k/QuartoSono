import Image from "next/image";
import { cn } from "@/lib/cn";

/** Moldura de imagem de produto com fallback abstrato (sem foto). */
export function ProductImageFrame({
  src,
  alt,
  sizes,
  priority,
  className,
  imgClassName,
  tone = "surface-linen",
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  imgClassName?: string;
  tone?: string;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-linen", !src && cn(tone, "grain"), className)}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn("object-cover", imgClassName)}
        />
      ) : (
        <span className="absolute inset-0 grid place-items-center font-serif text-lg italic text-graphite/40">
          Foto em breve
        </span>
      )}
    </div>
  );
}
