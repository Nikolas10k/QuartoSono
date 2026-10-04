import type { Metadata } from "next";
import { PageIntro } from "@/components/catalog/PageIntro";
import { Serif } from "@/components/home/SectionHeading";
import { About } from "@/components/home/About";
import { Reviews } from "@/components/home/Reviews";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sobre a Quarto Sono",
  description:
    "Quarto Sono Colchões: 20 anos de experiência no conforto do seu sono, com lojas em Brazlândia e Ceilândia, Brasília — DF.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="Sobre" title={["Vinte anos", <Serif key="s">de sono bem</Serif>, "cuidado."]}>
        {SITE.tagline}. Em Brazlândia e na Ceilândia, ajudamos você a escolher com calma — sentindo, testando e
        comparando de perto.
      </PageIntro>

      <section className="container-editorial grid gap-12 pb-[var(--spacing-section)] md:grid-cols-12">
        <Reveal as="p" className="font-serif text-[clamp(1.75rem,1.2rem+2vw,3rem)] italic leading-[1.15] md:col-span-7">
          “{SITE.concept}”
        </Reveal>
        <div className="space-y-6 text-lg leading-relaxed text-graphite/80 md:col-span-5">
          <Reveal as="p">
            Um bom colchão muda a forma como o dia termina — e como o próximo começa. Por isso, mais do que vender,
            gostamos de orientar: entender sua rotina, o seu jeito de dormir e o espaço do seu quarto.
          </Reveal>
          <Reveal as="p" delay={100}>
            No showroom você encontra colchões, conjuntos box, camas, cabeceiras e sofás. Faça seu orçamento com a
            gente pelo WhatsApp ou venha nos visitar.
          </Reveal>
          <Reveal delay={160} className="flex flex-wrap gap-3 pt-4">
            <ButtonLink href="/produtos">Ver produtos</ButtonLink>
            <ButtonLink href="/lojas" variant="secondary">
              Nossas lojas
            </ButtonLink>
          </Reveal>
        </div>
      </section>

      <About />
      <Reviews />
    </>
  );
}
