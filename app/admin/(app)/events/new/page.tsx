import Link from "next/link";
import { createEvent } from "@/app/admin/actions";
import { EventForm } from "@/components/admin/EventForm";
import { requireAdmin } from "@/lib/admin/auth";
import { allClientsForPicker } from "@/lib/admin/data";

export const metadata = { title: "New event" };

export default async function NewEvent({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  await requireAdmin();
  const { client } = await searchParams;
  const clients = await allClientsForPicker();
  return (
    <>
      <Link className="adm-back" href="/admin/pipeline">← Pipeline</Link>
      <header className="adm-head"><h1>New event</h1></header>
      <section className="card" style={{ maxWidth: 820 }}>
        <EventForm action={createEvent} clients={clients} defaultClientId={client} submitLabel="Add event" />
      </section>
    </>
  );
}
