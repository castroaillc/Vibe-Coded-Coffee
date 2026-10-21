"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { recordSale, saveProducts, voidSale, type CartLine } from "@/app/admin/actions";
import type { ProductRow } from "@/lib/admin/data";
import { formatDate, fromCents, METHOD_LABELS, money, toCents } from "@/lib/admin/format";
import type { SaleItem } from "@/lib/db/schema";

type Sale = { id: string; eventId: string | null; items: SaleItem[]; totalCents: number; method: keyof typeof METHOD_LABELS; createdAt: string };
type EventOption = { id: string; title: string; date: string };
type Line = CartLine & { key: string; name: string; unitCents: number };

const clock = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

export function Pos({ products, sales, events, todayYmd }: { products: ProductRow[]; sales: Sale[]; events: EventOption[]; todayYmd: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cart, setCart] = useState<Line[]>([]);
  const [method, setMethod] = useState<keyof typeof METHOD_LABELS>("card");
  const [eventId, setEventId] = useState(() => events.find((e) => e.date === todayYmd)?.id ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [editing, setEditing] = useState(false);

  const active = products.filter((p) => p.active);
  const subtotal = cart.reduce((s, l) => s + l.qty * l.unitCents, 0);
  const total = method === "comp" ? 0 : subtotal;
  const salesTotal = useMemo(() => sales.reduce((s, x) => s + x.totalCents, 0), [sales]);

  function add(p: ProductRow) {
    setMsg(null);
    setCart((c) => {
      const hit = c.find((l) => l.productId === p.id);
      if (hit) return c.map((l) => (l === hit ? { ...l, qty: l.qty + 1 } : l));
      return [...c, { key: p.id, productId: p.id, name: p.name, qty: 1, unitCents: p.priceCents }];
    });
  }

  function addCustom() {
    const amount = prompt("Custom amount ($)");
    if (!amount) return;
    const cents = toCents(amount);
    if (!cents) return;
    setMsg(null);
    setCart((c) => [...c, { key: crypto.randomUUID(), productId: null, name: "Custom amount", qty: 1, unitCents: cents }]);
  }

  const step = (key: string, d: number) =>
    setCart((c) => c.map((l) => (l.key === key ? { ...l, qty: l.qty + d } : l)).filter((l) => l.qty > 0));

  function charge() {
    startTransition(async () => {
      const res = await recordSale({
        lines: cart.map(({ productId, name, qty, unitCents }) => ({ productId, name, qty, unitCents })),
        method,
        eventId: eventId || null,
      });
      if ("error" in res) return setMsg({ ok: false, text: res.error ?? "Couldn't record the sale." });
      setCart([]);
      setMsg({ ok: true, text: `Recorded ${money(res.totalCents)} · ${METHOD_LABELS[method]}` });
      router.refresh();
    });
  }

  if (editing) return <ProductEditor products={products} onDone={() => { setEditing(false); router.refresh(); }} />;

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>POS</h1>
          <p>Today: {money(salesTotal)} from {sales.length} sales</p>
        </div>
        <div className="adm-head__actions">
          <button className="b b--ghost" onClick={() => setEditing(true)}>Edit menu</button>
        </div>
      </header>

      <div className="pos">
        <div>
          <div className="pos-items">
            {active.map((p) => (
              <button key={p.id} className="pos-item" onClick={() => add(p)}>
                <strong>{p.name}</strong>
                <span>{money(p.priceCents)}</span>
              </button>
            ))}
            <button className="pos-item pos-item--custom" onClick={addCustom}>
              <strong>Custom amount</strong>
              <span>$</span>
            </button>
          </div>

          <section className="card" style={{ marginTop: 16 }}>
            <h2>Today&apos;s sales</h2>
            <div className="list">
              {sales.map((s) => (
                <div key={s.id} className="row">
                  <div className="row__main">
                    <p className="row__title">{s.items.map((i) => `${i.qty}× ${i.name}`).join(", ")}</p>
                    <p className="row__sub">
                      {clock(s.createdAt)} · {METHOD_LABELS[s.method]}
                      {s.eventId && ` · ${events.find((e) => e.id === s.eventId)?.title ?? "event"}`}
                    </p>
                  </div>
                  <div className="row__end">
                    <p>{money(s.totalCents)}</p>
                    <button
                      className="b b--link"
                      style={{ fontSize: 13 }}
                      disabled={pending}
                      onClick={() => {
                        if (confirm("Void this sale?")) startTransition(async () => { await voidSale(s.id); router.refresh(); });
                      }}
                    >
                      Void
                    </button>
                  </div>
                </div>
              ))}
              {!sales.length && <p className="empty">No sales yet today.</p>}
            </div>
          </section>
        </div>

        <aside className="card cart" aria-label="Cart">
          <h2>Order <small>{cart.length ? `${cart.reduce((s, l) => s + l.qty, 0)} items` : "empty"}</small></h2>
          <div>
            {cart.map((l) => (
              <div key={l.key} className="cart-line">
                <div className="row__main">
                  <p className="row__title">{l.name}</p>
                  <p className="row__sub">{money(l.unitCents)} each</p>
                </div>
                <div className="qty">
                  <button aria-label={`One less ${l.name}`} onClick={() => step(l.key, -1)}>−</button>
                  <span>{l.qty}</span>
                  <button aria-label={`One more ${l.name}`} onClick={() => step(l.key, 1)}>+</button>
                </div>
                <p className="row__end">{money(l.qty * l.unitCents)}</p>
              </div>
            ))}
            {!cart.length && <p className="empty">Tap an item to add it.</p>}
          </div>

          <label className="f" style={{ marginTop: 14 }}>
            <span>Event</span>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)}>
              <option value="">No event (walk-up)</option>
              {events.map((e) => <option key={e.id} value={e.id}>{formatDate(e.date)} · {e.title}</option>)}
            </select>
          </label>

          <div className="seg" role="group" aria-label="Payment method" style={{ marginTop: 12 }}>
            {(Object.keys(METHOD_LABELS) as (keyof typeof METHOD_LABELS)[]).map((m) => (
              <button key={m} aria-pressed={method === m} onClick={() => setMethod(m)}>{METHOD_LABELS[m]}</button>
            ))}
          </div>

          <div className="cart-total"><span>Total{method === "comp" && " (comped)"}</span><strong>{money(total)}</strong></div>
          <button className="b charge" disabled={!cart.length || pending} onClick={charge}>
            {pending ? "Saving…" : method === "card" ? `Card paid · record ${money(total)}` : method === "cash" ? `Cash received · record ${money(total)}` : "Record comp"}
          </button>
          {cart.length > 0 && <button className="b b--link" style={{ marginTop: 10 }} onClick={() => setCart([])}>Clear order</button>}
          {msg && <p className={`msg ${msg.ok ? "msg--ok" : "msg--bad"}`} role="status">{msg.text}</p>}
          <p className="pos-note">
            Card: take the payment on your Stripe reader or with Tap to Pay in the Stripe Dashboard app, then record it here.
          </p>
        </aside>
      </div>
    </>
  );
}

function ProductEditor({ products, onDone }: { products: ProductRow[]; onDone: () => void }) {
  const [rows, setRows] = useState(() => products.map((p) => ({ id: p.id, name: p.name, price: fromCents(p.priceCents), active: p.active })));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const set = (i: number, patch: Partial<(typeof rows)[number]>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <>
      <header className="adm-head">
        <div><h1>Edit menu</h1><p>Prices change for new sales only. Untick an item to hide it from the POS.</p></div>
      </header>
      <section className="card" style={{ maxWidth: 720 }}>
        {rows.map((r, i) => (
          <div key={r.id || i} className="prod-edit">
            <input type="text" aria-label="Name" value={r.name} onChange={(e) => set(i, { name: e.target.value })} placeholder="Item name" />
            <input inputMode="decimal" aria-label="Price" value={r.price} onChange={(e) => set(i, { price: e.target.value })} placeholder="0.00" />
            <label><input type="checkbox" checked={r.active} onChange={(e) => set(i, { active: e.target.checked })} /> On menu</label>
            <button className="b b--link" onClick={() => setRows((x) => x.filter((_, j) => j !== i))}>Remove</button>
          </div>
        ))}
        <button className="b b--ghost b--sm" style={{ marginTop: 8 }} onClick={() => setRows((r) => [...r, { id: "", name: "", price: "", active: true }])}>
          Add item
        </button>
        <div className="form__actions" style={{ marginTop: 18 }}>
          <button
            className="b"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await saveProducts(rows.map((r) => ({ id: r.id || undefined, name: r.name, priceCents: toCents(r.price), active: r.active })));
                  onDone();
                } catch {
                  setError("Couldn't save the menu. Try again.");
                }
              })
            }
          >
            {pending ? "Saving…" : "Save menu"}
          </button>
          <button className="b b--ghost" onClick={onDone}>Cancel</button>
          {error && <p className="msg msg--bad">{error}</p>}
        </div>
      </section>
    </>
  );
}
