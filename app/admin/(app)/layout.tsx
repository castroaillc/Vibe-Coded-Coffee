import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/admin/auth";

// Every admin page reads live data and is behind sign-in.
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="adm">
      <AdminNav email={user.email} />
      <main className="adm-main">{children}</main>
    </div>
  );
}
