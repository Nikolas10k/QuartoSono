import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "text" | "whatsapp" | "admin" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap select-none " +
  "transition-[background-color,color,border-color,transform,opacity] duration-[var(--duration-fast)] ease-[var(--ease-calm)] " +
  "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-graphite text-paper hover:bg-ink rounded-[var(--radius-pill)] uppercase tracking-[0.14em] text-[0.75rem] font-medium",
  secondary:
    "border border-graphite/25 text-graphite hover:border-graphite hover:bg-graphite hover:text-paper rounded-[var(--radius-pill)] uppercase tracking-[0.14em] text-[0.75rem] font-medium",
  text: "text-graphite uppercase tracking-[0.14em] text-[0.75rem] font-medium link-underline pb-1 !px-0 !h-auto rounded-none",
  // Elegante: grafite com ícone; sem "botão verde gigante"
  whatsapp:
    "bg-paper text-graphite border border-graphite/15 hover:bg-graphite hover:text-paper hover:border-graphite rounded-[var(--radius-pill)] uppercase tracking-[0.14em] text-[0.75rem] font-medium",
  admin: "bg-graphite text-paper hover:bg-ink rounded-[var(--radius-md)] text-sm font-medium",
  danger: "bg-danger text-white hover:brightness-110 rounded-[var(--radius-md)] text-sm font-medium",
  ghost:
    "text-graphite hover:bg-graphite/5 rounded-[var(--radius-md)] text-sm font-medium border border-graphite/10",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4",
  md: "h-12 px-6",
  lg: "h-14 px-8",
};

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  className?: string;
  children?: ReactNode;
};

export function buttonClasses({ variant = "primary", size = "md", className }: Omit<Common, "children">) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: Common & ComponentProps<"button">) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      {children}
      {iconRight}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  href,
  external,
  ...props
}: Common & Omit<ComponentProps<typeof Link>, "href"> & { href: string; external?: boolean }) {
  const classes = buttonClasses({ variant, size, className });
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
        {...(props as ComponentProps<"a">)}
      >
        {icon}
        {children}
        {iconRight}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {icon}
      {children}
      {iconRight}
    </Link>
  );
}
