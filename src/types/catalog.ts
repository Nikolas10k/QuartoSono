import type { CategoryRow, ProductImageRow, ProductRow } from "./database";

export type Category = Pick<CategoryRow, "id" | "name" | "slug" | "position">;

export type ProductImage = Pick<
  ProductImageRow,
  "id" | "storage_path" | "public_url" | "position" | "is_cover"
>;

export type Product = ProductRow & {
  category: Category | null;
  images: ProductImage[];
};

export type ProductSummary = Pick<
  ProductRow,
  | "id"
  | "name"
  | "slug"
  | "brand"
  | "short_description"
  | "size"
  | "price"
  | "promotional_price"
  | "featured"
  | "promotion"
  | "available"
  | "published"
  | "created_at"
  | "updated_at"
> & {
  category: Category | null;
  cover: ProductImage | null;
};

export type CatalogFilters = {
  q?: string;
  categoria?: string;
  marca?: string;
  tamanho?: string;
};
