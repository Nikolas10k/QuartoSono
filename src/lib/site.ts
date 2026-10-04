/**
 * Dados REAIS da Quarto Sono Colchões.
 * Não adicionar nada que não tenha sido confirmado pela loja
 * (horários, preços, depoimentos, métricas…). Campos ausentes ficam `null`
 * e a interface se adapta.
 */
export const SITE = {
  name: "Quarto Sono Colchões",
  shortName: "Quarto Sono",
  tagline: "20 anos de experiência no conforto do seu sono",
  concept: "O conforto começa antes de você dormir.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000",
  instagram: {
    handle: "@quartosonocolchoes",
    url: "https://www.instagram.com/quartosonocolchoes/",
  },
  whatsapp: {
    number: "5561998588770",
    display: "(61) 99858-8770",
  },
  phone: {
    e164: "+5561999150085",
    display: "(61) 99915-0085",
  },
  google: {
    rating: 5.0,
    reviewCount: 83,
  },
  yearsOfExperience: 20,
} as const;

export type Store = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  /** Endereço complementar também divulgado pela loja */
  alsoKnownAs: string | null;
  postalCode: string | null;
  city: string;
  region: string;
  /** Horários ainda não informados → null (nunca inventar) */
  openingHours: string | null;
  mapsQuery: string;
  phone: string | null;
};

export const STORES: Store[] = [
  {
    id: "brazlandia",
    name: "Quarto Sono Brazlândia",
    neighborhood: "Brazlândia",
    address: "Quadra 22, Lote 05, Loja 3",
    alsoKnownAs: "INCRA 08, DF-180",
    postalCode: "72760-022",
    city: "Brasília",
    region: "DF",
    openingHours: null,
    mapsQuery: "Quarto Sono Colchões, Quadra 22 Lote 05 Loja 3, Brazlândia, Brasília - DF, 72760-022",
    phone: SITE.phone.display,
  },
  {
    id: "ceilandia",
    name: "Quarto Sono Ceilândia",
    neighborhood: "Ceilândia",
    address: "Setor O, Via Leste, QD 04",
    alsoKnownAs: null,
    postalCode: null,
    city: "Brasília",
    region: "DF",
    openingHours: null,
    mapsQuery: "Setor O Via Leste QD 04, Ceilândia, Brasília - DF",
    phone: null,
  },
];

export function mapsDirectionsUrl(store: Store) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.mapsQuery)}`;
}

export function mapsSearchUrl(store: Store) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapsQuery)}`;
}

export const NAV_LINKS = [
  { href: "/produtos", label: "Produtos" },
  { href: "/sobre", label: "Sobre" },
  { href: "/lojas", label: "Lojas" },
  { href: "/contato", label: "Contato" },
] as const;
