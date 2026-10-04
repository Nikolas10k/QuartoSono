import "server-only";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { DB_SCHEMA } from "@/types/database";
import { supabaseEnv } from "./env";

/**
 * Cliente anônimo, sem cookies — usado nas páginas públicas para que
 * possam ser pré-renderizadas (ISR). RLS garante que só o publicado é lido.
 */
export function createPublicClient() {
  const { url, key } = supabaseEnv();
  return createClient<Database, typeof DB_SCHEMA>(url, key, {
    db: { schema: DB_SCHEMA },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
