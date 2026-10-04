import { SITE, STORES } from "./site";

export const DEFAULT_DESCRIPTION =
  "Loja de colchões em Brasília com 20 anos de experiência. Colchões, conjuntos box, camas, cabeceiras e sofás em Brazlândia e Ceilândia. Venha sentir o conforto de perto.";

export const SEO_KEYWORDS = [
  "colchões Brasília",
  "loja de colchões Brasília",
  "cama box Brasília",
  "colchões Brazlândia",
  "loja de colchões Brazlândia",
  "cama box Brazlândia",
  "colchões Ceilândia",
  "loja de colchões Ceilândia",
  "cama box Ceilândia",
  "conjunto box",
  "Quarto Sono Colchões",
];

export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Schema.org LocalBusiness — apenas dados confirmados (sem horário, sem preço). */
export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: SITE.name,
        url: SITE.url,
        logo: absoluteUrl("/icon.svg"),
        sameAs: [SITE.instagram.url],
        contactPoint: [
          {
            "@type": "ContactPoint",
            telephone: SITE.phone.e164,
            contactType: "customer service",
            areaServed: "BR-DF",
            availableLanguage: "Portuguese",
          },
        ],
      },
      ...STORES.map((store) => ({
        "@type": "FurnitureStore",
        "@id": absoluteUrl(`/lojas#${store.id}`),
        name: store.name,
        parentOrganization: { "@id": absoluteUrl("/#organization") },
        url: absoluteUrl("/lojas"),
        ...(store.phone ? { telephone: SITE.phone.e164 } : {}),
        address: {
          "@type": "PostalAddress",
          streetAddress: store.address,
          addressLocality: `${store.neighborhood}, ${store.city}`,
          addressRegion: store.region,
          ...(store.postalCode ? { postalCode: store.postalCode } : {}),
          addressCountry: "BR",
        },
        ...(store.id === "brazlandia"
          ? {
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: SITE.google.rating.toFixed(1),
                reviewCount: SITE.google.reviewCount,
                bestRating: "5",
              },
            }
          : {}),
      })),
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** Serializa JSON-LD com escape de "<" (evita injeção via conteúdo do banco). */
export function jsonLdScript(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
