import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabase/server";

export class AuthError extends Error {}

/**
 * Retorna o usuário autenticado SE ele for admin do Quarto Sono
 * (tabela quartosono.admins). auth.users é compartilhado com outras apps,
 * então estar logado não basta.
 */
export const getAdmin = cache(async () => {
  const supabase = await createServerSupabase();
  const { data: userData, error } = await supabase.auth.getUser();
  if (error || !userData.user) return null;
  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (!admin) return null;
  return { user: userData.user, supabase };
});

/** Para páginas/layouts do admin. */
export async function requireAdminPage() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

/** Para server actions: lança erro em vez de redirecionar. */
export async function requireAdminAction() {
  const admin = await getAdmin();
  if (!admin) throw new AuthError("Sessão expirada ou sem permissão. Entre novamente.");
  return admin;
}
