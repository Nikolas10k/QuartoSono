import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Entrar" };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getAdmin()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" && sp.next.startsWith("/admin") ? sp.next : undefined;

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-10 block text-center text-[0.875rem] font-semibold uppercase tracking-[0.2em]">
          Quarto <span className="font-serif text-[1.05em] font-normal normal-case italic tracking-normal">Sono</span>
        </Link>
        <div className="rounded-[var(--radius-md)] border border-graphite/10 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(13,13,13,0.35)] sm:p-8">
          <h1 className="text-xl font-semibold tracking-tight">Painel da loja</h1>
          <p className="mb-6 mt-1 text-sm text-stone">Entre para cadastrar e gerenciar produtos.</p>
          <LoginForm next={next} />
        </div>
        <p className="mt-6 text-center text-[0.8125rem] text-stone">Acesso restrito à equipe Quarto Sono.</p>
      </div>
    </main>
  );
}
