import { Hero, type HeroChapter } from "@/components/home/Hero";
import { Statement } from "@/components/home/Statement";
import { CategoryIndex } from "@/components/home/CategoryIndex";
import { Featured } from "@/components/home/Featured";
import { About } from "@/components/home/About";
import { Reviews } from "@/components/home/Reviews";
import { StoresShowcase } from "@/components/home/StoresShowcase";
import { InstagramStrip } from "@/components/home/InstagramStrip";
import { SectionHeading, Serif } from "@/components/home/SectionHeading";
import { EDITORIAL_MEDIA } from "@/lib/media";
import { getCatalog, getCategories, getCategoryCovers, getFeatured } from "@/services/catalog";

export const revalidate = 300;

/** Frases do hero por categoria (conceito editorial — sem promessas de produto). */
const HERO_COPY: Record<string, HeroChapter["headline"]> = {
  colchoes: ["20 anos", "cuidando do", "seu sono."],
  "conjuntos-box": ["O conforto", "começa antes", "de dormir."],
  camas: ["Onde o dia", "termina", "bem."],
  sofas: ["Conforto", "que começa", "na sala."],
  cabeceiras: ["Detalhes", "que fazem", "o quarto."],
  outros: ["Tudo para", "um descanso", "completo."],
};
const HERO_ORDER = ["colchoes", "conjuntos-box", "camas", "sofas"];

export default async function HomePage() {
  const [categories, featured, covers, recent] = await Promise.all([
    getCategories(),
    getFeatured(4),
    getCategoryCovers(),
    getCatalog(),
  ]);

  const heroCats = [
    ...HERO_ORDER.map((slug) => categories.find((c) => c.slug === slug)).filter(Boolean),
    ...categories.filter((c) => !HERO_ORDER.includes(c.slug)),
  ].slice(0, 4) as typeof categories;

  const fallbackHero = [
    { name: "Colchões", slug: "colchoes" },
    { name: "Conjuntos Box", slug: "conjuntos-box" },
    { name: "Camas", slug: "camas" },
    { name: "Sofás", slug: "sofas" },
  ];

  const chapters: HeroChapter[] = (heroCats.length === 4 ? heroCats : fallbackHero).map((c, i) => {
    const id = "id" in c ? (c.id as string) : "";
    return {
      label: c.name,
      href: `/categorias/${c.slug}`,
      image: EDITORIAL_MEDIA.hero[i] ?? covers[id]?.public_url ?? null,
      headline: HERO_COPY[c.slug] ?? ["Conforto", "feito para", "você."],
    };
  });
  // O primeiro capítulo sempre abre com a headline principal
  chapters[0] = { ...chapters[0], headline: HERO_COPY.colchoes };

  const featuredCover = featured.find((p) => p.cover)?.cover?.public_url ?? null;
  const statementImage = EDITORIAL_MEDIA.statement ?? featuredCover;
  const storeImage = EDITORIAL_MEDIA.store;
  const instagramImages = recent.map((p) => p.cover?.public_url).filter((u): u is string => Boolean(u));

  return (
    <>
      <Hero chapters={chapters} />
      <Statement image={statementImage} imageAlt={featured[0]?.name ?? "Colchão Quarto Sono"} />

      <section aria-labelledby="categorias-titulo" className="py-[var(--spacing-section)]">
        <div className="container-editorial">
          <SectionHeading
            id="categorias-titulo"
            index="02"
            eyebrow="Categorias"
            className="mb-16 md:mb-24"
            title={["Encontre", <Serif key="s">o conforto certo</Serif>, "para você."]}
          />
          <CategoryIndex
            items={categories.map((c) => ({ name: c.name, slug: c.slug, image: covers[c.id]?.public_url ?? null }))}
          />
        </div>
      </section>

      <Featured products={featured} />
      <About />
      <Reviews />
      <StoresShowcase image={storeImage} />
      <InstagramStrip images={instagramImages} />
    </>
  );
}
