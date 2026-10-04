import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "available" | "unavailable" | "draft" | "published" | "featured" | "neutral";

const tones: Record<BadgeTone, string> = {
  available: "bg-success/10 text-success border-success/20",
  unavailable: "bg-danger/10 text-danger border-danger/20",
  draft: "bg-sand/30 text-stone border-sand",
  published: "bg-graphite text-paper border-graphite",
  featured: "bg-paper text-graphite border-graphite/30",
  neutral: "bg-linen text-graphite border-linen",
};

export function Badge({ tone = "neutral", children, className }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-[var(--radius-pill)] border px-2.5 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
