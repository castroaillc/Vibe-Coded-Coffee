import Link from "next/link";
import { clientName, PaymentBadge, StatusBadge } from "@/components/admin/bits";
import { requireAdmin } from "@/lib/admin/auth";
import { coffeeFor, listEvents, salesSince, startOfShopDay } from "@/lib/admin/data";
import { daysUntil, formatDate, formatStamp, money, moneyShort, today } from "@/lib/admin/format";

export const metadata = { title: "Dashboard" };

export default async function Dashboard() {
  await requireAdmin();
  const ymd = today();
  const monthStart = startOfShopDay(`${ymd.slice(0, 7)}-01`);
  const [events, monthSales] = await Promise.all([listEvents(), salesSince(monthStart)]);

  const leads = events.filter((e) => e.status === "lead").sort((a, b) => +b.createdAt - +a.createdAt);
  const quoted = events.filter((e) => e.status === "quoted");
  const upcoming = events.filter((e) => e.status === "booked" && e.date >= ymd);
  const owed = events
    .filter((e) => e.status === "booked" || e.status === "completed")
    .reduce((s, e) => s + Math.max(0, e.quoteCents - e.paidCents), 0);
  const dayStart = startOfShopDay(ymd);
  const todaySales = monthSales.filter((s) => s.createdAt >= dayStart);
  const sum = (list: { totalCents: number }[]) => list.reduce((s, x) => s + x.totalCents, 0);

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Dashboard</h1>
          <p>{formatDate(ymd)}</p>
        </div>
        <div className="adm-head__actions">
          <Link className="b b--ghost" href="/admin/pos">Open POS</Link>
          <Link className="b" href="/admin/events/new">New event</Link>
        </div>
      </header>

      <dl className="tiles">
        <div className="tile">
          <dt>Open leads</dt>
          <dd>{leads.length + quoted.length}<small>{leads.length} need a quote · {quoted.length} quoted</small></dd>
        </div>
        <div className="tile">
          <dt>Booked, coming up</dt>
          <dd>{upcoming.length}<small>{moneyShort(upcoming.reduce((s, e) => s + e.quoteCents, 0))} in quotes</small></dd>
        </div>
        <div className="tile">
          <dt>Still owed</dt>
          <dd>{moneyShort(owed)}<small>on booked and completed events</small></dd>
        </div>
        <div className="tile">
          <dt>POS today</dt>
          <dd>{money(sum(todaySales))}<small>{todaySales.length} sales · {moneyShort(sum(monthSales))} this month</small></dd>
        </div>
      </dl>

      <div className="cols">
        <section className="card">
          <h2>New leads <small>from the website and added by hand</small></h2>
          <div className="list">
            {leads.slice(0, 8).map((e) => (
              <Link key={e.id} href={`/admin/events/${e.id}`} className="row">
                <div className="row__main">
                  <p className="row__title">{clientName(e)}</p>
                  <p className="row__sub">{e.eventType || e.title} · {formatDate(e.date)} · {e.headcount} guests · {e.location || "No location"}</p>
                </div>
                <div className="row__end">
                  <p className="row__sub">{e.source === "website" ? "Website" : "Manual"}</p>
                  <p className="row__sub">{formatStamp(e.createdAt)}</p>
                </div>
              </Link>
            ))}
            {!leads.length && <p className="empty">No new leads. Booking requests from the website show up here.</p>}
          </div>
        </section>

        <section className="card">
          <h2>Coming up <small>booked events</small></h2>
          <div className="list">
            {upcoming.slice(0, 8).map((e) => {
              const coffee = coffeeFor(e.headcount);
              const days = daysUntil(e.date);
              return (
                <Link key={e.id} href={`/admin/events/${e.id}`} className="row">
                  <div className="row__main">
                    <p className="row__title">{e.title}</p>
                    <p className="row__sub">
                      {formatDate(e.date)} ({days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`}) · {e.headcount} guests
                      {coffee && ` · bring ≈ ${coffee.lb} lb coffee`}
                    </p>
                  </div>
                  <div className="row__end">
                    <p>{money(e.quoteCents)}</p>
                    <PaymentBadge status={e.paymentStatus} />
                  </div>
                </Link>
              );
            })}
            {!upcoming.length && <p className="empty">Nothing booked yet.</p>}
          </div>
        </section>
      </div>

      {quoted.length > 0 && (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Waiting on the client <small>quoted, not booked yet</small></h2>
          <div className="list">
            {quoted.map((e) => (
              <Link key={e.id} href={`/admin/events/${e.id}`} className="row">
                <div className="row__main">
                  <p className="row__title">{clientName(e)}</p>
                  <p className="row__sub">{e.title} · {formatDate(e.date)}</p>
                </div>
                <div className="row__end"><p>{money(e.quoteCents)}</p><StatusBadge status={e.status} /></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
