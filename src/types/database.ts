/**
 * Tipos do schema `quartosono` (espelham supabase/migrations).
 * numeric chega como string pelo PostgREST quando precisão importa;
 * aqui aceitamos string | number e tratamos sempre como decimal textual.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Timestamps = { created_at: string; updated_at: string };

export type CategoryRow = { id: string; name: string; slug: string; position: number } & Timestamps;

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  brand: string | null;
  short_description: string | null;
  description: string | null;
  size: string | null;
  spring_type: string | null;
  comfort_level: string | null;
  height: string | null;
  supported_weight: string | null;
  fabric: string | null;
  warranty: string | null;
  price: string | null;
  promotional_price: string | null;
  featured: boolean;
  promotion: boolean;
  available: boolean;
  published: boolean;
} & Timestamps;

export type ProductImageRow = {
  id: string;
  product_id: string;
  storage_path: string;
  public_url: string;
  position: number;
  is_cover: boolean;
  created_at: string;
};

export type AdminRow = { user_id: string; created_at: string };

type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type Table<Row, Insert, Rel extends unknown[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: Rel;
};

export type Database = {
  quartosono: {
    Tables: {
      admins: Table<AdminRow, Optional<AdminRow, "created_at">>;
      categories: Table<
        CategoryRow,
        Optional<CategoryRow, "id" | "position" | "created_at" | "updated_at">
      >;
      products: Table<
        ProductRow,
        Optional<
          ProductRow,
          | "id"
          | "brand"
          | "short_description"
          | "description"
          | "size"
          | "spring_type"
          | "comfort_level"
          | "height"
          | "supported_weight"
          | "fabric"
          | "warranty"
          | "price"
          | "promotional_price"
          | "featured"
          | "promotion"
          | "available"
          | "published"
          | "created_at"
          | "updated_at"
        >,
        [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ]
      >;
      product_images: Table<
        ProductImageRow,
        Optional<ProductImageRow, "id" | "position" | "is_cover" | "created_at">,
        [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ]
      >;
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

export const DB_SCHEMA = "quartosono" as const;
export const STORAGE_BUCKET = "quartosono" as const;
