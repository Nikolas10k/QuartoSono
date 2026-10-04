import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/cn";

export function SectionHeading({
  index,
  eyebrow,
  title,
  className,
  id,
  as: Tag = "h2",
}: {
  index?: string;
  eyebrow?: string;
  title: ReactNode[];
  className?: string;
  id?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className={cn("relative", className)}>
      {(index || eyebrow) && (
        <Reveal as="p" className="eyebrow mb-6 flex items-center gap-3 text-stone">
          {index && <span className="tabular-nums">{index}</span>}
          {index && eyebrow && <span className="h-px w-8 bg-current opacity-40" />}
          {eyebrow}
        </Reveal>
      )}
      <Tag
        id={id}
        className="text-[length:var(--text-headline)] font-medium uppercase leading-[var(--text-headline--line-height)] tracking-[var(--text-headline--letter-spacing)] text-balance"
      >
        {title.map((line, i) => (
          <Reveal key={i} as="span" mask delay={i * 110} className="block pb-[0.04em]">
            {line}
          </Reveal>
        ))}
      </Tag>
    </div>
  );
}

export function Serif({ children }: { children: ReactNode }) {
  return <span className="font-serif font-normal lowercase italic tracking-[-0.01em]">{children}</span>;
}
