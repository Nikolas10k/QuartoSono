import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SITE, STORES } from "@/lib/site";
import { Reveal } from "@/components/motion/Reveal";
import { SectionHeading, Serif } from "./SectionHeading";

export function About() {
  const facts = [
    { value: String(SITE.yearsOfExperience), unit: "anos", label: "de experiência no conforto do seu sono" },
    { value: String(STORES.length), unit: "lojas", label: STORES.map((s) => s.neighborhood).join(" e ") },
    { value: SITE.google.rating.toFixed(1).replace(".", ","), unit: "★", label: `${SITE.google.reviewCount} avaliações no Google` },
  ];

  return (
    <section aria-labelledby="sobre-titulo" className="bg-linen py-[var(--spacing-section)]">
      <div className="container-editorial grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <SectionHeading
            id="sobre-titulo"
            index="04"
            eyebrow="Sobre"
            title={["20 anos", "fazendo Brasília", <Serif key="s">dormir melhor.</Serif>]}
          />
        </div>
        <div className="flex flex-col justify-end gap-8 lg:col-span-4">
          <Reveal as="p" className="text-lg leading-relaxed text-graphite/80">
            Há duas décadas a Quarto Sono ajuda famílias do Distrito Federal a escolher o colchão, o conjunto box,
            a cama ou o sofá certo — com atendimento próximo e a possibilidade de sentir cada produto antes de
            decidir.
          </Reveal>
          <Reveal>
            <Link
              href="/sobre"
              className="group inline-flex items-center gap-2 text-[0.75rem] font-medium uppercase tracking-[0.14em]"
            >
              <span className="link-underline pb-0.5">Nossa história</span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
          </Reveal>
        </div>

        <dl className="grid gap-px overflow-hidden border-y border-graphite/10 sm:grid-cols-3 lg:col-span-12">
          {facts.map((f, i) => (
            <Reveal key={f.unit} delay={i * 120} className="flex flex-col gap-3 py-10 sm:px-8 sm:first:pl-0">
              <dt className="order-2 text-[0.9375rem] text-graphite/70">{f.label}</dt>
              <dd className="order-1 flex items-baseline gap-2">
                <span className="text-[clamp(4rem,3rem+5vw,8rem)] font-medium leading-none tracking-[-0.05em] tabular-nums">
                  {f.value}
                </span>
                <span className="font-serif text-2xl italic text-stone">{f.unit}</span>
              </dd>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  );
}
