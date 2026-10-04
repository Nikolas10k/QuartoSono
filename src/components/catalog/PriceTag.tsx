import { priceDisplay } from "@/lib/format";
import { cn } from "@/lib/cn";

export function PriceTag({
  price,
  promotional,
  size = "sm",
  className,
}: {
  price: string | null;
  promotional: string | null;
  size?: "sm" | "lg";
  className?: string;
}) {
  const d = priceDisplay(price, promotional);
  if (d.kind === "consult") {
    return (
      <p className={cn("eyebrow text-stone", size === "lg" && "text-[0.8125rem]", className)}>Consulte condições</p>
    );
  }
  if (d.kind === "single") {
    return (
      <p className={cn("tabular-nums", size === "lg" ? "text-3xl font-medium tracking-tight" : "text-[0.9375rem]", className)}>
        {d.price}
      </p>
    );
  }
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-3 tabular-nums", className)}>
      <span className="sr-only">De</span>
      <s className={cn("text-stone", size === "lg" ? "text-lg" : "text-[0.8125rem]")}>{d.price}</s>
      <span className="sr-only">por</span>
      <span className={cn(size === "lg" ? "text-3xl font-medium tracking-tight" : "text-[0.9375rem] font-medium")}>
        {d.promotional}
      </span>
    </p>
  );
}
