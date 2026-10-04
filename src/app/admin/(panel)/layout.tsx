import { requireAdminPage } from "@/lib/auth";
import { AdminHeader } from "@/components/admin/AdminHeader";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  return (
    <>
      <AdminHeader email={user.email ?? ""} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:py-8">{children}</main>
    </>
  );
}
