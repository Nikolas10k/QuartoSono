import { cn } from "@/lib/cn";

/**
 * Colchão "arquitetônico" feito de blocos — usado quando ainda não há foto
 * cadastrada. Evoca camadas (pillow top, faixa lateral, base box) sem
 * fingir ser fotografia de produto.
 */
export function MattressComposition({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("surface-linen grain relative h-full w-full overflow-hidden", className)}>
      <div className="absolute inset-x-[12%] bottom-[18%] top-[30%] flex flex-col">
        {/* pillow top */}
        <div
          className="relative h-[22%] rounded-t-[14px] bg-[#f3efe8] shadow-[inset_0_-10px_24px_-14px_rgba(38,38,38,0.25)]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, rgba(138,129,119,0.18) 0 1px, transparent 1px 34px), repeating-linear-gradient(-45deg, rgba(138,129,119,0.18) 0 1px, transparent 1px 34px)",
          }}
        />
        <div className="h-[3%] bg-[#8a8177]/60" />
        {/* faixa lateral */}
        <div
          className="relative h-[34%] bg-[#e9e2d7]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(138,129,119,0.16) 0 1px, transparent 1px 22px), linear-gradient(180deg, rgba(255,255,255,0.4), rgba(191,181,167,0.25))",
          }}
        />
        <div className="h-[2.5%] bg-[#262626]/70" />
        {/* base box */}
        <div className="relative h-[30%] bg-[#2b2a29]">
          <div className="absolute inset-y-0 left-1/2 w-px bg-black/40" />
        </div>
        {/* pés */}
        <div className="relative h-[8.5%]">
          {["4%", "48%", "92%"].map((l) => (
            <span key={l} className="absolute top-0 h-full w-[2.4%] rounded-b-full bg-[#1a1a1a]" style={{ left: l }} />
          ))}
        </div>
      </div>
      {/* sombra de contato */}
      <div className="absolute inset-x-[8%] bottom-[14%] h-[6%] rounded-[50%] bg-ink/15 blur-2xl" />
    </div>
  );
}
