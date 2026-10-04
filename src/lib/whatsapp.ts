import { SITE } from "./site";

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsapp.number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function productWhatsappMessage(productName: string) {
  return `Olá! Vi o produto "${productName}" no site da Quarto Sono e gostaria de saber mais informações e condições.`;
}

export function productWhatsappUrl(productName: string) {
  return whatsappUrl(productWhatsappMessage(productName));
}

export const GENERIC_WHATSAPP_MESSAGE =
  "Olá! Vim pelo site da Quarto Sono e gostaria de fazer um orçamento.";
