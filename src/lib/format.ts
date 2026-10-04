const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** Preços chegam do Postgres como string (numeric) — nunca convertidos para float em cálculo. */
export function formatPrice(value: string | number | null | undefined): string | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return brl.format(n);
}

export type PriceDisplay =
  | { kind: "consult" }
  | { kind: "single"; price: string }
  | { kind: "promo"; price: string; promotional: string };

export function priceDisplay(
  price: string | number | null,
  promotional: string | number | null,
): PriceDisplay {
  const p = formatPrice(price);
  const promo = formatPrice(promotional);
  if (p && promo) return { kind: "promo", price: p, promotional: promo };
  if (promo) return { kind: "single", price: promo };
  if (p) return { kind: "single", price: p };
  return { kind: "consult" };
}

/** "1.299,90" | "1299.90" | "1299" → "1299.90" (string decimal p/ numeric) */
export function parsePriceInput(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^\d,.-]/g, "").trim();
  if (!cleaned) return null;
  let normalized = cleaned;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  }
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [int, dec = ""] = normalized.split(".");
  return `${int.replace(/^0+(?=\d)/, "")}.${dec.padEnd(2, "0")}`;
}

/** "1299.90" → "1.299,90" para preencher input */
export function priceToInput(value: string | null): string {
  if (!value) return "";
  const [int, dec = "00"] = value.split(".");
  return `${int.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${dec.padEnd(2, "0").slice(0, 2)}`;
}
