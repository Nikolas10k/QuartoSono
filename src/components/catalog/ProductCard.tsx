import Link from "next/link";
import type { ProductSummary } from "@/types/catalog";
import { ProductImageFrame } from "./ProductImageFrame";
import { PriceTag } from "./PriceTag";
import { cn } from "@/lib/cn";

export function ProductCard({
  product,
  priority,
  large,
  index = 0,
}: {
  product: ProductSummary;
  priority?: boolean;
  large?: boolean;
  index?: number;
}) {
  return (
    <article className="group relative">
      <Link href={`/produtos/${product.slug}`} className="block">
        <ProductImageFrame
          src={product.cover?.public_url}
          alt={product.name}
          priority={priority}
          sizes={large ? "(max-width: 767px) 100vw, 50vw" : "(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"}
          className={cn("aspect-[4/5]", large && "md:aspect-[5/4]")}
          imgClassName="transition-transform duration-[1200ms] ease-[var(--ease-calm)] group-hover:scale-[1.035]"
          tone={["surface-linen", "surface-sand", "surface-stone"][index % 3]}
        />
        <div className="mt-4 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow truncate text-[0.6875rem] text-stone">
              {[product.category?.name, product.brand].filter(Boolean).join(" · ")}
            </p>
            <h3
              className={cn(
                "mt-1.5 font-medium uppercase leading-[1.1] tracking-[-0.01em]",
                large ? "text-2xl md:text-3xl" : "text-[0.9375rem] md:text-base",
              )}
            >
              <span className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-[background-size] duration-[var(--duration-normal)] ease-[var(--ease-calm)] group-hover:bg-[length:100%_1px]">
                {product.name}
              </span>
            </h3>
            {product.size && <p className="mt-1 text-[0.8125rem] text-graphite/60">{product.size}</p>}
          </div>
        </div>
        <PriceTag price={product.price} promotional={product.promotional_price} className="mt-3" />
      </Link>
      {product.promotion && (
        <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1 text-[0.625rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm">
          Condição especial
        </span>
      )}
    </article>
  );
}
