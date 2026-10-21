import Link from "next/link";
import { clientName, PaymentBadge } from "@/components/admin/bits";
import { requireAdmin } from "@/lib/admin/auth";
import { listEvents } from "@/lib/admin/data";
import { formatDate, money, STATUS_LABELS, today } from "@/lib/admin/format";

export const metadata = { title: "Pipeline" };

const COLUMNS = ["lead", "quoted", "booked", "completed"] as const;

export default async function Pipeline({ searchParams }: { searchParams: Promise<{ show?: string }> }) {
  await requireAdmin();
  const { show } = await searchParams;
  const events = await listEvents();
  const ymd = today();
  const lost = events.filter((e) => e.status === "lost");

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Pipeline</h1>
          <p>Every catering job from first inquiry to done. Tap a card to quote, book or log a note.</p>
        </div>
        <div className="adm-head__actions">
          <Link className="b b--ghost" href={show === "lost" ? "/admin/pipeline" : "/admin/pipeline?show=lost"}>
            {show === "lost" ? "Hide lost" : `Show lost (${lost.length})`}
          </Link>
          <Link className="b" href="/admin/events/new">New event</Link>
        </div>
      </header>

      <div className="kanban">
        {[...COLUMNS, ...(show === "lost" ? (["lost"] as const) : [])].map((status) => {
          let list = events.filter((e) => e.status === status);
          // Completed: most recent first, and only the last 12.
          if (status === "completed" || status === "lost") list = list.reverse().slice(0, 12);
          const total = list.reduce((s, e) => s + e.quoteCents, 0);
          return (
            <section key={status} className="kcol" aria-label={STATUS_LABELS[status]}>
              <h2>{STATUS_LABELS[status]} <span>{list.length}{total > 0 && ` · ${money(total)}`}</span></h2>
              {list.map((e) => (
                <Link key={e.id} href={`/admin/events/${e.id}`} className="kcard">
                  <p className="kcard__title">{e.title}</p>
                  <p className="kcard__meta">{clientName(e)}</p>
                  <p className="kcard__meta">
                    {formatDate(e.date)}{e.date < ymd && status !== "completed" && status !== "lost" ? " · past" : ""} · {e.headcount} guests
                  </p>
                  <div className="kcard__foot">
                    <span>{e.quoteCents ? money(e.quoteCents) : "No quote"}</span>
                    {(status === "booked" || status === "completed") && <PaymentBadge status={e.paymentStatus} />}
                  </div>
                </Link>
              ))}
              {!list.length && <p className="empty" style={{ padding: "4px 6px" }}>Nothing here.</p>}
            </section>
          );
        })}
      </div>
    </>
  );
}
