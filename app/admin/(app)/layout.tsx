import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";

// Every admin page reads live data and is behind sign-in.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">{children}</main>
    </div>
  );
}
