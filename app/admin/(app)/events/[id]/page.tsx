import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEvent, setEventStatus, updateEvent } from "@/app/admin/actions";
import { clientName, PaymentBadge } from "@/components/admin/bits";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { EventForm } from "@/components/admin/EventForm";
import { Notes } from "@/components/admin/Notes";
import { requireAdmin } from "@/lib/admin/auth";
import { coffeeFor, getEvent } from "@/lib/admin/data";
import { CUPS_PER_GUEST, EVENT_CUP_OZ, formatDate, formatHm, formatStamp, METHOD_LABELS, money, STATUS_LABELS } from "@/lib/admin/format";

export const metadata = { title: "Event" };

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const found = await getEvent(id);
  if (!found) notFound();
  const { event: e, notes, sales } = found;
  const coffee = coffeeFor(e.headcount);
  const posTotal = sales.reduce((s, x) => s + x.totalCents, 0);
  const balance = Math.max(0, e.quoteCents - e.paidCents);

  return (
    <>
      <Link className="adm-back" href="/admin/pipeline">← Pipeline</Link>
      <header className="adm-head">
        <div>
          <h1>{e.title}</h1>
          <p>
            <Link href={`/admin/clients/${e.clientId}`}>{clientName(e)}</Link> · {formatDate(e.date)}
            {e.startTime && ` at ${formatHm(e.startTime)}`} · {e.source === "website" ? "Booked through the website" : "Added by hand"}
          </p>
        </div>
        <div className="steps-bar" role="group" aria-label="Status">
          {Object.entries(STATUS_LABELS).map(([s, label]) => (
            <form key={s} action={setEventStatus.bind(null, e.id, s)}>
              <button aria-pressed={e.status === s}>{label}</button>
            </form>
          ))}
        </div>
      </header>

      <div className="cols cols--wide">
        <div>
          <section className="card">
            <h2>Details</h2>
            <EventForm action={updateEvent.bind(null, e.id)} event={e} submitLabel="Save changes" />
          </section>
          <Notes clientId={e.clientId} eventId={e.id} notes={notes} title="Notes on this event" />
        </div>

        <div>
          <section className="card">
            <h2>Money <PaymentBadge status={e.paymentStatus} /></h2>
            <dl className="kv">
              <dt>Quote</dt><dd>{money(e.quoteCents)}</dd>
              <dt>Paid</dt><dd>{money(e.paidCents)}</dd>
              <dt>Balance</dt><dd><strong>{money(balance)}</strong></dd>
              <dt>POS at event</dt><dd>{money(posTotal)} · {sales.length} sales</dd>
            </dl>
            <p className="pos-note">
              Bill the client from your Stripe Dashboard (Invoices → Create), then record the payment here.
            </p>
          </section>

          <section className="card">
            <h2>What to bring <small>{CUPS_PER_GUEST} cups per guest, {EVENT_CUP_OZ} oz</small></h2>
            {coffee ? (
              <dl className="kv">
                <dt>Cups</dt><dd>≈ {coffee.cups}</dd>
                <dt>Ground coffee</dt><dd>{coffee.lb} lb</dd>
                <dt>5 lb bags</dt><dd>{coffee.bags5lb}</dd>
              </dl>
            ) : (
              <p className="empty">Add the number of guests to see how much coffee to bring.</p>
            )}
            <p className="pos-note"><Link href={`/admin/brew?cups=${coffee?.cups ?? ""}`}>Open in the brew planner →</Link></p>
          </section>

          {sales.length > 0 && (
            <section className="card">
              <h2>POS sales at this event</h2>
              <div className="list">
                {sales.map((s) => (
                  <div key={s.id} className="row">
                    <div className="row__main">
                      <p className="row__title">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                      <p className="row__sub">{formatStamp(s.createdAt)} · {METHOD_LABELS[s.method]}</p>
                    </div>
                    <p className="row__end">{money(s.totalCents)}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="card">
            <form action={deleteEvent.bind(null, e.id)}>
              <ConfirmButton message="Delete this event? Its notes go too.">Delete event</ConfirmButton>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
