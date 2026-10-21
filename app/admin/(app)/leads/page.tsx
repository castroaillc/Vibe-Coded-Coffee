import { requireAdmin } from "@/lib/admin/auth";
import { listLeads, qrFunnel } from "@/lib/admin/data";
import { formatStamp } from "@/lib/admin/format";
import { formatPhone, qrCodes, qrUrl, type QrCode } from "@/lib/marketing";

export const metadata = { title: "Leads" };

const pct = (a: number, b: number) => (b ? `${Math.round((a / b) * 100)}%` : "–");

export default async function Leads({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().toLowerCase();
  const [all, funnel] = await Promise.all([listLeads(), qrFunnel()]);
  const leads = q
    ? all.filter((l) => [l.firstName, l.email, l.phone, l.utmCampaign, l.utmSource, l.source].some((v) => (v ?? "").toLowerCase().includes(q)))
    : all;

  const emailable = all.filter((l) => l.email && l.emailConsent && !l.emailOptOutAt).length;
  const textable = all.filter((l) => l.phone && l.smsConsent && !l.smsOptOutAt).length;
  const weekAgo = Date.now() - 7 * 864e5;
  const thisWeek = all.filter((l) => +l.createdAt >= weekAgo).length;
  const totalScans = [...funnel.scans.values()].reduce((a, b) => a + b, 0);
  const qrLeads = all.filter((l) => l.qrCode).length;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Leads</h1>
          <p>Everyone on the marketing list, where they came from, and what they agreed to.</p>
        </div>
        <div className="adm-head__actions">
          <a className="b b--ghost" href="/admin/leads/export?list=sms">Export SMS list</a>
          <a className="b" href="/admin/leads/export?list=email">Export email list</a>
        </div>
      </header>

      <dl className="tiles">
        <div className="tile"><dt>On the list</dt><dd>{all.length}<small>{thisWeek} joined in the last 7 days</small></dd></div>
        <div className="tile"><dt>Can email</dt><dd>{emailable}<small>opted in, not unsubscribed</small></dd></div>
        <div className="tile"><dt>Can text</dt><dd>{textable}<small>SMS opt-in, not stopped</small></dd></div>
        <div className="tile"><dt>QR scans</dt><dd>{totalScans}<small>{qrLeads} joined · {pct(qrLeads, totalScans)} conversion</small></dd></div>
      </dl>

      <section className="card">
        <h2>QR codes <small>scans → sign-ups</small></h2>
        <table className="table">
          <thead><tr><th>Code</th><th>Link</th><th className="num">Scans</th><th className="num">Joined</th><th className="num">Conversion</th></tr></thead>
          <tbody>
            {(Object.keys(qrCodes) as QrCode[]).map((code) => {
              const scans = funnel.scans.get(code) ?? 0;
              const joined = funnel.leads.get(code) ?? 0;
              return (
                <tr key={code}>
                  <td>{qrCodes[code].label}</td>
                  <td><code>{qrUrl(code).replace(/^https?:\/\//, "")}</code></td>
                  <td className="num">{scans}</td>
                  <td className="num">{joined}</td>
                  <td className="num">{pct(joined, scans)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h2>People <small>{leads.length} shown</small></h2>
        <form style={{ marginBottom: 12 }}>
          <input className="search" type="search" name="q" defaultValue={q} placeholder="Search name, email, phone, campaign" aria-label="Search leads" />
        </form>
        <div className="list">
          {leads.map((l) => (
            <div key={l.id} className="row">
              <div className="row__main">
                <p className="row__title">{l.firstName || l.email || formatPhone(l.phone)}</p>
                <p className="row__sub">{[l.email, formatPhone(l.phone)].filter(Boolean).join(" · ")}</p>
                <p className="row__sub">
                  {l.emailConsent && !l.emailOptOutAt ? "✓ Email" : "✗ Email"} · {l.smsConsent && !l.smsOptOutAt ? "✓ SMS" : "✗ SMS"}
                  {" · "}
                  {[l.utmSource, l.utmCampaign].filter(Boolean).join(" / ") || l.source}
                </p>
              </div>
              <div className="row__end"><p className="row__sub">{formatStamp(l.createdAt)}</p></div>
            </div>
          ))}
          {!leads.length && <p className="empty">{q ? "No one matches that search." : "No sign-ups yet. Scan your sign's QR code to test it."}</p>}
        </div>
      </section>
    </>
  );
}
