import { z } from "zod";
import { parsePriceInput } from "@/lib/format";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .optional()
    .transform((v) => (v ? v : ""));

const priceField = z
  .string()
  .trim()
  .optional()
  .transform((v) => v ?? "")
  .refine((v) => v === "" || parsePriceInput(v) !== null, "Valor inválido. Ex.: 1.299,90");

/** Campos do formulário (strings, como digitados). */
export const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Informe o nome do produto").max(140, "Nome muito longo"),
    category_id: z.string().uuid("Escolha uma categoria"),
    brand: optionalText(80),
    short_description: optionalText(280),
    description: optionalText(5000),
    size: optionalText(80),
    spring_type: optionalText(80),
    comfort_level: optionalText(80),
    height: optionalText(40),
    supported_weight: optionalText(40),
    fabric: optionalText(80),
    warranty: optionalText(80),
    price: priceField,
    promotional_price: priceField,
    featured: z.boolean(),
    promotion: z.boolean(),
    available: z.boolean(),
  })
  .superRefine((v, ctx) => {
    const p = parsePriceInput(v.price);
    const promo = parsePriceInput(v.promotional_price);
    if (p && promo && Number(promo) >= Number(p)) {
      ctx.addIssue({
        code: "custom",
        path: ["promotional_price"],
        message: "O preço promocional deve ser menor que o preço",
      });
    }
  });

export type ProductFormInput = z.input<typeof productFormSchema>;
export type ProductFormValues = z.output<typeof productFormSchema>;

export const productImageInputSchema = z.object({
  storage_path: z
    .string()
    .regex(/^products\/[0-9a-f-]{36}\/image-\d{2,3}\.(webp|jpg|png)$/, "Caminho de imagem inválido"),
  public_url: z.string().url(),
});

export const saveProductSchema = z.object({
  id: z.string().uuid(),
  values: productFormSchema,
  images: z
    .array(productImageInputSchema)
    .min(1, "Adicione pelo menos 1 foto")
    .max(10, "Máximo de 10 fotos"),
  published: z.boolean(),
});

export type SaveProductInput = z.input<typeof saveProductSchema>;

export function emptyProductForm(): ProductFormInput {
  return {
    name: "",
    category_id: "",
    brand: "",
    short_description: "",
    description: "",
    size: "",
    spring_type: "",
    comfort_level: "",
    height: "",
    supported_weight: "",
    fabric: "",
    warranty: "",
    price: "",
    promotional_price: "",
    featured: false,
    promotion: false,
    available: true,
  };
}
