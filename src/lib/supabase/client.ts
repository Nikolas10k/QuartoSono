"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { DB_SCHEMA } from "@/types/database";

let client: ReturnType<typeof createBrowserClient<Database, typeof DB_SCHEMA>> | null = null;

/** Cliente do navegador (apenas no admin: upload de fotos com a sessão do admin). */
export function getBrowserSupabase() {
  if (!client) {
    client = createBrowserClient<Database, typeof DB_SCHEMA>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { db: { schema: DB_SCHEMA } },
    );
  }
  return client;
}
