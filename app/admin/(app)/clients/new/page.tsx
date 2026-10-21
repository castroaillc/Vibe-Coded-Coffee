import Link from "next/link";
import { createClient } from "@/app/admin/actions";
import { ClientForm } from "@/components/admin/ClientForm";
import { requireAdmin } from "@/lib/admin/auth";

export const metadata = { title: "New client" };

export default async function NewClient() {
  await requireAdmin();
  return (
    <>
      <Link className="adm-back" href="/admin/clients">← Clients</Link>
      <header className="adm-head"><h1>New client</h1></header>
      <section className="card" style={{ maxWidth: 720 }}>
        <ClientForm action={createClient} submitLabel="Add client" />
      </section>
    </>
  );
}
