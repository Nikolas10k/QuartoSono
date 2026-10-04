import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { DB_SCHEMA } from "@/types/database";
import { supabaseEnv } from "./env";

/** Cliente com a sessão do usuário (cookies) — admin, server actions. */
export async function createServerSupabase() {
  const { url, key } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database, typeof DB_SCHEMA>(url, key, {
    db: { schema: DB_SCHEMA },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: o proxy renova a sessão.
        }
      },
    },
  });
}
