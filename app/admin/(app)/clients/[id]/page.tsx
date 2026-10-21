import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteClient, updateClient } from "@/app/admin/actions";
import { clientName, StatusBadge } from "@/components/admin/bits";
import { ClientForm } from "@/components/admin/ClientForm";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { Notes } from "@/components/admin/Notes";
import { requireAdmin } from "@/lib/admin/auth";
import { getClient } from "@/lib/admin/data";
import { formatDate, money } from "@/lib/admin/format";

export const metadata = { title: "Client" };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = await getClient(id);
  if (!found) notFound();
  const { client: c, events, notes } = found;
  const won = events.filter((e) => e.status === "booked" || e.status === "completed");
  const billed = won.reduce((s, e) => s + e.quoteCents, 0);
  const paid = won.reduce((s, e) => s + e.paidCents, 0);

  return (
    <>
      <Link className="adm-back" href="/admin/clients">← Clients</Link>
      <header className="adm-head">
        <div>
          <h1>{clientName(c)}</h1>
          <p>
            {[c.company && c.contactName, c.email && <a key="e" href={`mailto:${c.email}`}>{c.email}</a>, c.phone && <a key="p" href={`tel:${c.phone}`}>{c.phone}</a>]
              .filter(Boolean)
              .flatMap((x, i) => (i ? [" · ", x] : [x]))}
          </p>
        </div>
        <div className="adm-head__actions">
          <Link className="b" href={`/admin/events/new?client=${c.id}`}>New event for {c.company || c.contactName || "this client"}</Link>
        </div>
      </header>

      <dl className="tiles">
        <div className="tile"><dt>Events</dt><dd>{events.length}<small>{won.length} booked or completed</small></dd></div>
        <div className="tile"><dt>Booked value</dt><dd>{money(billed)}</dd></div>
        <div className="tile"><dt>Paid</dt><dd>{money(paid)}</dd></div>
        <div className="tile"><dt>Owed</dt><dd>{money(Math.max(0, billed - paid))}</dd></div>
      </dl>

      <div className="cols">
        <div>
          <section className="card">
            <h2>Events</h2>
            <div className="list">
              {events.map((e) => (
                <Link key={e.id} href={`/admin/events/${e.id}`} className="row">
                  <div className="row__main">
                    <p className="row__title">{e.title}</p>
                    <p className="row__sub">{formatDate(e.date)} · {e.headcount} guests</p>
                  </div>
                  <div className="row__end"><p>{money(e.quoteCents)}</p><StatusBadge status={e.status} /></div>
                </Link>
              ))}
              {!events.length && <p className="empty">No events yet.</p>}
            </div>
          </section>
          <Notes clientId={c.id} eventId={null} notes={notes} />
        </div>
        <div>
          <section className="card">
            <h2>Contact details</h2>
            <ClientForm action={updateClient.bind(null, c.id)} client={c} submitLabel="Save changes" />
          </section>
          {!events.length && (
            <section className="card">
              <form action={deleteClient.bind(null, c.id)}>
                <ConfirmButton message="Delete this client and their notes?">Delete client</ConfirmButton>
              </form>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
