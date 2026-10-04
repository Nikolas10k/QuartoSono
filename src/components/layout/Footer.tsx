import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { NAV_LINKS, SITE, STORES, mapsDirectionsUrl } from "@/lib/site";
import { whatsappUrl, GENERIC_WHATSAPP_MESSAGE } from "@/lib/whatsapp";
import { Reveal } from "@/components/motion/Reveal";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="on-dark relative overflow-hidden bg-ink text-paper">
      <div className="container-editorial pt-[var(--spacing-section)]">
        <Reveal as="p" className="eyebrow mb-8 text-sand">
          {SITE.concept}
        </Reveal>
        <h2 className="text-[length:var(--text-display)] font-medium uppercase leading-[var(--text-display--line-height)] tracking-[var(--text-display--letter-spacing)]">
          <Reveal mask as="span" className="block">
            Boa noite
          </Reveal>
          <Reveal mask as="span" delay={120} className="block">
            começa <span className="font-serif font-normal lowercase italic tracking-normal text-sand">aqui.</span>
          </Reveal>
        </h2>

        <div className="mt-20 grid gap-12 border-t border-paper/10 pt-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="eyebrow mb-4 text-sand">Contato</p>
            <ul className="space-y-2 text-[0.9375rem]">
              <li>
                <a
                  href={whatsappUrl(GENERIC_WHATSAPP_MESSAGE)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline"
                >
                  WhatsApp {SITE.whatsapp.display}
                </a>
              </li>
              <li>
                <a href={`tel:${SITE.phone.e164}`} className="link-underline">
                  Telefone {SITE.phone.display}
                </a>
              </li>
              <li>
                <a href={SITE.instagram.url} target="_blank" rel="noopener noreferrer" className="link-underline">
                  Instagram {SITE.instagram.handle}
                </a>
              </li>
            </ul>
          </div>

          {STORES.map((store) => (
            <div key={store.id}>
              <p className="eyebrow mb-4 text-sand">Loja {store.neighborhood}</p>
              <address className="space-y-1 text-[0.9375rem] not-italic leading-relaxed text-paper/85">
                <p>{store.address}</p>
                {store.alsoKnownAs && <p>{store.alsoKnownAs}</p>}
                <p>
                  {store.neighborhood}, {store.city} — {store.region}
                  {store.postalCode ? `, ${store.postalCode}` : ""}
                </p>
              </address>
              <a
                href={mapsDirectionsUrl(store)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] uppercase tracking-[0.12em] text-sand hover:text-paper"
              >
                Ver rota <ArrowUpRight className="size-3.5" aria-hidden />
              </a>
            </div>
          ))}

          <div>
            <p className="eyebrow mb-4 text-sand">Navegação</p>
            <ul className="space-y-2 text-[0.9375rem]">
              <li>
                <Link href="/" className="link-underline">
                  Início
                </Link>
              </li>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-underline">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-3 border-t border-paper/10 py-8 text-[0.75rem] text-paper/50 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}. Todos os direitos reservados.
          </p>
          <p>Colchões, conjuntos box, camas, cabeceiras e sofás em Brasília — DF.</p>
        </div>
      </div>
    </footer>
  );
}
