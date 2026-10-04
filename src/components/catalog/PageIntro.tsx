import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Reveal";

export function PageIntro({ eyebrow, title, children }: { eyebrow: string; title: ReactNode[]; children?: ReactNode }) {
  return (
    <header className="container-editorial pb-12 pt-32 md:pb-16 md:pt-44">
      <Reveal as="p" className="eyebrow mb-6 text-stone">
        {eyebrow}
      </Reveal>
      <h1 className="text-[length:var(--text-display)] font-medium uppercase leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)] text-balance">
        {title.map((line, i) => (
          <Reveal key={i} as="span" mask delay={i * 110} className="block pb-[0.04em]">
            {line}
          </Reveal>
        ))}
      </h1>
      {children && (
        <Reveal delay={200} className="mt-8 max-w-xl text-lg leading-relaxed text-graphite/75">
          {children}
        </Reveal>
      )}
    </header>
  );
}
