import type { Metadata } from "next";
import { ArrowUpRight, Phone } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { PageIntro } from "@/components/catalog/PageIntro";
import { Serif } from "@/components/home/SectionHeading";
import { Reveal } from "@/components/motion/Reveal";
import { WhatsappIcon } from "@/components/ui/WhatsappIcon";
import { SITE, STORES, mapsDirectionsUrl } from "@/lib/site";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contato",
  description: `Fale com a Quarto Sono Colchões: WhatsApp ${SITE.whatsapp.display}, telefone ${SITE.phone.display} e Instagram ${SITE.instagram.handle}.`,
  alternates: { canonical: "/contato" },
};

export default function ContactPage() {
  const channels = [
    {
      icon: <WhatsappIcon className="size-5" />,
      label: "WhatsApp",
      value: SITE.whatsapp.display,
      href: whatsappUrl(GENERIC_WHATSAPP_MESSAGE),
      external: true,
      note: "Orçamentos e condições",
    },
    {
      icon: <Phone className="size-5" aria-hidden />,
      label: "Telefone",
      value: SITE.phone.display,
      href: `tel:${SITE.phone.e164}`,
      external: false,
      note: "Loja Brazlândia",
    },
    {
      icon: <InstagramIcon className="size-5" />,
      label: "Instagram",
      value: SITE.instagram.handle,
      href: SITE.instagram.url,
      external: true,
      note: "Novidades e bastidores",
    },
  ];

  return (
    <>
      <PageIntro eyebrow="Contato" title={["Vamos", <Serif key="s">conversar.</Serif>]}>
        Faça seu orçamento conosco. Respondemos pelo WhatsApp e recebemos você nas duas lojas.
      </PageIntro>

      <section className="container-editorial pb-[var(--spacing-section)]">
        <ul className="border-t border-graphite/10">
          {channels.map((c, i) => (
            <Reveal as="li" key={c.label} delay={i * 90} className="border-b border-graphite/10">
              <a
                href={c.href}
                {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-5 py-8 md:grid-cols-[12rem_1fr_auto] md:py-10"
              >
                <span className="flex items-center gap-3 text-stone">
                  {c.icon}
                  <span className="eyebrow max-md:sr-only">{c.label}</span>
                </span>
                <span>
                  <span className="block text-[clamp(1.75rem,1rem+3vw,4rem)] font-medium leading-none tracking-[-0.03em]">
                    {c.value}
                  </span>
                  <span className="mt-2 block text-sm text-graphite/60">{c.note}</span>
                </span>
                <ArrowUpRight
                  className="size-7 transition-transform duration-[var(--duration-normal)] group-hover:rotate-45"
                  aria-hidden
                />
              </a>
            </Reveal>
          ))}
        </ul>

        <div className="mt-20 grid gap-10 md:grid-cols-2">
          {STORES.map((s) => (
            <Reveal key={s.id}>
              <p className="eyebrow mb-3 text-stone">Loja {s.neighborhood}</p>
              <address className="text-lg not-italic leading-relaxed">
                {s.address}
                {s.alsoKnownAs && (
                  <>
                    <br />
                    {s.alsoKnownAs}
                  </>
                )}
                <br />
                {s.neighborhood}, {s.city} — {s.region}
                {s.postalCode && `, CEP ${s.postalCode}`}
              </address>
              <a
                href={mapsDirectionsUrl(s)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-medium uppercase tracking-[0.14em]"
              >
                <span className="link-underline pb-0.5">Ver rota</span> <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
