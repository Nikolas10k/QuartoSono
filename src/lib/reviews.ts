/**
 * Depoimentos REAIS de clientes (copiados do Google, com autorização/
 * referência pública). Lista vazia = a seção mostra apenas a nota agregada.
 * NÃO inventar depoimentos.
 */
export type Review = {
  author: string;
  text: string;
  /** 1–5 */
  rating: number;
  /** ex.: "Google" */
  source: string;
  /** data ISO opcional */
  date?: string;
};

export const REVIEWS: Review[] = [];

export const GOOGLE_REVIEWS_URL =
  "https://www.google.com/maps/search/?api=1&query=Quarto+Sono+Colch%C3%B5es+Brazl%C3%A2ndia";
