"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { applyQuote, savePricing } from "@/app/admin/actions";
import { formatDate, money } from "@/lib/admin/format";
import { quoteEvent, SERVICE_IDS, serviceForEventType, type PricingSettings, type ServiceId, type Supply, type SupplyUse } from "@/lib/pricing";

type EventInfo = { id: string; title: string; date: string; headcount: number; eventType: string; quoteCents: number };

const usd = (n: number) => money(Math.round(n * 100));
const fmt = (n: number, d = 1) => n.toLocaleString("en-US", { maximumFractionDigits: d });
const USE_LABELS: Record<SupplyUse, string> = { coffee: "Coffee (by brew math)", per_cup: "per cup", per_guest: "per guest", per_event: "per event day" };

export function QuoteCalculator({ settings: initial, event }: { settings: PricingSettings; event: EventInfo | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [s, setS] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [service, setService] = useState<ServiceId>(() => (event ? serviceForEventType(event.eventType) : "staffed"));
  const [guests, setGuests] = useState(String(event?.headcount || 100));
  const [days, setDays] = useState(service === "hackathon" ? "2" : "1");
  const [override, setOverride] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const q = useMemo(
    () => quoteEvent({ guests: Number(guests), days: Number(days), service, priceOverride: Number(override) || null }, s),
    [guests, days, service, override, s],
  );

  const edit = (patch: Partial<PricingSettings>) => { setS((x) => ({ ...x, ...patch })); setDirty(true); setMsg(null); };
  const editService = (id: ServiceId, patch: Partial<PricingSettings["services"][ServiceId]>) =>
    edit({ services: { ...s.services, [id]: { ...s.services[id], ...patch } } });
  const editSupply = (i: number, patch: Partial<Supply>) =>
    edit({ supplies: s.supplies.map((x, j) => (j === i ? { ...x, ...patch, estimate: "packPrice" in patch ? false : x.estimate } : x)) });

  function save() {
    startTransition(async () => {
      try {
        await savePricing(s);
        setDirty(false);
        setMsg({ ok: true, text: "Prices saved." });
        router.refresh();
      } catch {
        setMsg({ ok: false, text: "Couldn't save. Try again." });
      }
    });
  }

  function useForEvent() {
    if (!event) return;
    startTransition(async () => {
      await applyQuote(event.id, Math.round(q.price * 100));
      setMsg({ ok: true, text: `Quote for ${event.title} set to ${usd(q.price)}.` });
      router.refresh();
    });
  }

  const marginClass = q.margin >= 0.5 ? "msg--ok" : "msg--bad";
  const estimates = s.supplies.filter((x) => x.estimate);

  return (
    <>
      {event && <Link className="adm-back" href={`/admin/events/${event.id}`}>← {event.title}</Link>}
      <header className="adm-head">
        <div>
          <h1>Quote calculator</h1>
          <p>{event ? `${event.title} · ${formatDate(event.date)} · current quote ${money(event.quoteCents)}` : "What an event costs you, and what to charge."}</p>
        </div>
        <div className="adm-head__actions">
          <Link className="b b--ghost" href="/admin/pos">Back to POS</Link>
        </div>
      </header>

      <div className="cols cols--wide">
        <div>
          <section className="card">
            <h2>Event</h2>
            <div className="seg" role="group" aria-label="Service">
              {SERVICE_IDS.map((id) => (
                <button key={id} aria-pressed={service === id} onClick={() => { setService(id); if (id === "hackathon" && days === "1") setDays("2"); }}>
                  {s.services[id].label}
                </button>
              ))}
            </div>
            <div className="form" style={{ marginTop: 16 }}>
              <label className="f"><span>Guests</span><input type="number" min="1" inputMode="numeric" value={guests} onChange={(e) => setGuests(e.target.value)} /></label>
              <label className="f"><span>Days</span><input type="number" min="1" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} /></label>
              <label className="f f--wide">
                <span>Your price ($) <small>leave empty to use {usd(q.listPrice)}</small></span>
                <input inputMode="decimal" value={override} placeholder={q.listPrice.toFixed(2)} onChange={(e) => setOverride(e.target.value)} />
              </label>
            </div>
          </section>

          <section className="card">
            <h2>Shopping list <small>{fmt(q.cups, 0)} cups · {fmt(q.coffeeLb)} lb coffee</small></h2>
            <div className="table-scroll"><table className="table">
              <thead><tr><th>Supply</th><th className="num">Used</th><th className="num">Packs to buy</th><th className="num">Cost</th></tr></thead>
              <tbody>
                {q.lines.map((l) => (
                  <tr key={l.id}>
                    <td>{l.name}{l.estimate && <span className="badge" style={{ marginLeft: 6 }}>estimate</span>}</td>
                    <td className="num">{fmt(l.used)} {l.unit}</td>
                    <td className="num">{l.packsToBuy}</td>
                    <td className="num">{usd(l.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
            <p className="row__sub" style={{ marginTop: 10 }}>Cost counts only what the event uses; leftover packs carry over to the next event.</p>
          </section>
        </div>

        <div>
          <section className="card" aria-live="polite">
            <h2>Quote</h2>
            <p className="big">{usd(q.price)}</p>
            <p className="row__sub">
              {usd(q.pricePerGuest)} per guest{q.days > 1 ? " per day" : ""}
              {!override && q.minimumApplied && ` · minimum of ${usd(s.services[service].minimum)} applied`}
            </p>
            <dl className="kv" style={{ marginTop: 14 }}>
              <dt>Supplies</dt><dd>{usd(q.supplies)}</dd>
              <dt>Labor</dt><dd>{usd(q.labor)} <small>({fmt(q.staffHours)} hrs × {usd(s.laborRate)})</small></dd>
              <dt>Travel</dt><dd>{usd(q.travel)}</dd>
              <dt>Your cost</dt><dd><strong>{usd(q.cost)}</strong> <small>{usd(q.costPerGuest)}/guest</small></dd>
              <dt>Profit</dt><dd><strong>{usd(q.profit)}</strong></dd>
            </dl>
            <p className={`msg ${marginClass}`} style={{ marginTop: 12 }}>Margin {Math.round(q.margin * 100)}%{q.margin < 0.5 ? " · below the 50% target" : ""}</p>
            {event && (
              <button className="b" style={{ marginTop: 14, width: "100%" }} disabled={pending} onClick={useForEvent}>
                Use {usd(q.price)} as this event&apos;s quote
              </button>
            )}
            {msg && <p className={`msg ${msg.ok ? "msg--ok" : "msg--bad"}`} role="status" style={{ marginTop: 10 }}>{msg.text}</p>}
          </section>

          {estimates.length > 0 && (
            <section className="card">
              <h2>Update these prices</h2>
              <p className="row__sub">{estimates.map((x) => x.name).join(", ")} use placeholder prices. Enter what you pay below.</p>
            </section>
          )}
        </div>
      </div>

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Prices &amp; rates <small>saved for everyone who uses Coffee OS</small></h2>

        <h3 className="pricing-h3">What you charge</h3>
        <div className="table-scroll"><table className="table">
          <thead><tr><th>Service</th><th className="num">$ / guest / day</th><th className="num">Minimum $</th><th className="num">Service hrs / day</th><th className="num">Setup + travel hrs / day</th></tr></thead>
          <tbody>
            {SERVICE_IDS.map((id) => {
              const v = s.services[id];
              return (
                <tr key={id}>
                  <td>{v.label}</td>
                  <td className="num"><input className="cell" inputMode="decimal" aria-label={`${v.label} price per guest`} value={v.pricePerGuest} onChange={(e) => editService(id, { pricePerGuest: Number(e.target.value) })} /></td>
                  <td className="num"><input className="cell" inputMode="decimal" aria-label={`${v.label} minimum`} value={v.minimum} onChange={(e) => editService(id, { minimum: Number(e.target.value) })} /></td>
                  <td className="num"><input className="cell" inputMode="decimal" aria-label={`${v.label} service hours`} value={v.serviceHours} onChange={(e) => editService(id, { serviceHours: Number(e.target.value) })} /></td>
                  <td className="num"><input className="cell" inputMode="decimal" aria-label={`${v.label} setup and travel hours`} value={v.handlingHours} onChange={(e) => editService(id, { handlingHours: Number(e.target.value) })} /></td>
                </tr>
              );
            })}
          </tbody>
        </table></div>

        <div className="form" style={{ marginTop: 16 }}>
          <label className="f"><span>Labor ($ / staff hour)</span><input inputMode="decimal" value={s.laborRate} onChange={(e) => edit({ laborRate: Number(e.target.value) })} /></label>
          <label className="f"><span>Travel ($ / event day)</span><input inputMode="decimal" value={s.travelPerDay} onChange={(e) => edit({ travelPerDay: Number(e.target.value) })} /></label>
          <label className="f"><span>Cups per guest per day</span><input inputMode="decimal" value={s.cupsPerGuest} onChange={(e) => edit({ cupsPerGuest: Number(e.target.value) })} /></label>
          <label className="f"><span>Cup size (oz)</span><input inputMode="decimal" value={s.cupOz} onChange={(e) => edit({ cupOz: Number(e.target.value) })} /></label>
        </div>

        <h3 className="pricing-h3">What you pay for supplies</h3>
        <div className="table-scroll"><table className="table">
          <thead><tr><th>Item</th><th className="num">Pack price $</th><th className="num">Units in pack</th><th>Unit</th><th>Used</th><th className="num">Units each</th><th></th></tr></thead>
          <tbody>
            {s.supplies.map((x, i) => (
              <tr key={x.id}>
                <td><input className="cell cell--wide" aria-label="Item name" value={x.name} onChange={(e) => editSupply(i, { name: e.target.value })} /></td>
                <td className="num"><input className="cell" inputMode="decimal" aria-label={`${x.name} pack price`} value={x.packPrice} onChange={(e) => editSupply(i, { packPrice: Number(e.target.value) })} /></td>
                <td className="num"><input className="cell" inputMode="decimal" aria-label={`${x.name} units per pack`} value={x.packQty} onChange={(e) => editSupply(i, { packQty: Number(e.target.value) })} /></td>
                <td><input className="cell" aria-label={`${x.name} unit`} value={x.unit} onChange={(e) => editSupply(i, { unit: e.target.value })} /></td>
                <td>
                  <select className="cell" aria-label={`${x.name} used`} value={x.use} onChange={(e) => editSupply(i, { use: e.target.value as SupplyUse })}>
                    {(Object.keys(USE_LABELS) as SupplyUse[]).map((u) => <option key={u} value={u}>{USE_LABELS[u]}</option>)}
                  </select>
                </td>
                <td className="num">
                  {x.use === "coffee" ? "—" : <input className="cell" inputMode="decimal" aria-label={`${x.name} units used each`} value={x.perUse} onChange={(e) => editSupply(i, { perUse: Number(e.target.value) })} />}
                </td>
                <td><button className="b b--link" onClick={() => edit({ supplies: s.supplies.filter((_, j) => j !== i) })}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table></div>
        <button
          className="b b--ghost b--sm"
          style={{ marginTop: 10 }}
          onClick={() => edit({ supplies: [...s.supplies, { id: crypto.randomUUID().slice(0, 8), name: "", packPrice: 0, packQty: 1, unit: "each", use: "per_cup", perUse: 1 }] })}
        >
          Add supply
        </button>

        <div className="form__actions" style={{ marginTop: 18 }}>
          <button className="b" disabled={!dirty || pending} onClick={save}>{pending ? "Saving…" : "Save prices"}</button>
          {dirty && <span className="row__sub">Unsaved changes. The quote above already uses them.</span>}
        </div>
      </section>
    </>
  );
}
