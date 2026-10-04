import type { Metadata } from "next";
import { PageIntro } from "@/components/catalog/PageIntro";
import { Serif } from "@/components/home/SectionHeading";
import { StoresShowcase } from "@/components/home/StoresShowcase";
import { EDITORIAL_MEDIA } from "@/lib/media";

export const metadata: Metadata = {
  title: "Lojas em Brazlândia e Ceilândia",
  description:
    "Visite a Quarto Sono Colchões em Brazlândia (Quadra 22 Lote 05 Loja 3) e na Ceilândia (Setor O, Via Leste, QD 04). Loja de colchões e cama box em Brasília — DF.",
  alternates: { canonical: "/lojas" },
};

export default function StoresPage() {
  return (
    <>
      <PageIntro eyebrow="Lojas" title={["Duas lojas,", <Serif key="s">um mesmo</Serif>, "cuidado."]}>
        Sinta o conforto de perto em Brazlândia ou na Ceilândia. Antes de ir, fale com a gente pelo WhatsApp.
      </PageIntro>
      <div className="-mt-[var(--spacing-section)]">
        <StoresShowcase image={EDITORIAL_MEDIA.store} headingIndex="01" />
      </div>
    </>
  );
}
