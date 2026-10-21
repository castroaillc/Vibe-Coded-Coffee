import Link from "next/link";
import { clientName } from "@/components/admin/bits";
import { requireAdmin } from "@/lib/admin/auth";
import { listClients } from "@/lib/admin/data";
import { formatDate, moneyShort } from "@/lib/admin/format";

export const metadata = { title: "Clients" };

export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const all = await listClients();
  const clients = q
    ? all.filter((c) => [c.company, c.contactName, c.email, c.phone].some((v) => v.toLowerCase().includes(q)))
    : all;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Clients</h1>
          <p>{all.length} companies and organizers who&apos;ve booked or asked about booking.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="b" href="/admin/clients/new">New client</Link>
        </div>
      </header>

      <form style={{ marginBottom: 16 }}>
        <input className="search" type="search" name="q" defaultValue={q} placeholder="Search name, company, email, phone" aria-label="Search clients" />
      </form>

      <section className="card">
        <div className="list">
          {clients.map((c) => (
            <Link key={c.id} href={`/admin/clients/${c.id}`} className="row">
              <div className="row__main">
                <p className="row__title">{clientName(c)}</p>
                <p className="row__sub">{[c.company && c.contactName, c.email, c.phone].filter(Boolean).join(" · ") || "No contact details"}</p>
              </div>
              <div className="row__end">
                <p>{moneyShort(c.wonCents)}</p>
                <p className="row__sub">{c.eventCount} events{c.lastDate && ` · last ${formatDate(c.lastDate)}`}</p>
              </div>
            </Link>
          ))}
          {!clients.length && <p className="empty">{q ? "No clients match that search." : "No clients yet. Booking requests from the website add them automatically."}</p>}
        </div>
      </section>
    </>
  );
}
