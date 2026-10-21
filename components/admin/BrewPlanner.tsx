"use client";

import { useEffect, useMemo, useState } from "react";
import { BAG_SIZES, CUP_SIZES, STRENGTHS, ValidationError, calculateCupCost, calculateGroundCoffee, type CupSizeId, type StrengthId } from "@/lib/brew";
import { money } from "@/lib/admin/format";

// The brew + cost calculators from coffee-app, as one admin screen. Math lives in lib/brew.ts.

const WEIGHT_UNITS = [
  { id: "lb", key: "coffeeLb" },
  { id: "oz", key: "coffeeOz" },
  { id: "g", key: "coffeeGrams" },
] as const;
type WeightUnit = (typeof WEIGHT_UNITS)[number]["id"];

const DEFAULT_PRICES = { bagPrice: "32", bagOz: 40 as number, cup: "0.12", sleeve: "0.05", lid: "0.04" };
type Prices = typeof DEFAULT_PRICES;
const STORAGE_KEY = "coffee-os:prices";

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 2 });
const toPrice = (s: string) => Math.max(0, Number(s) || 0);
const dollars = (n: number) => money(Math.round(n * 100));

export function BrewPlanner({ initialCups }: { initialCups: number }) {
  const [cups, setCups] = useState(String(initialCups));
  const [size, setSize] = useState<CupSizeId | "custom">("tall");
  const [customOz, setCustomOz] = useState("10");
  const [strength, setStrength] = useState<StrengthId>("classic");
  const [unit, setUnit] = useState<WeightUnit>("lb");
  const [prices, setPrices] = useState<Prices>(DEFAULT_PRICES);

  // Supplier prices are remembered on this device.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPrices((p) => ({ ...p, ...JSON.parse(saved) }));
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prices));
    } catch {}
  }, [prices]);
  const setPrice = <K extends keyof Prices>(k: K, v: Prices[K]) => setPrices((p) => ({ ...p, [k]: v }));

  const cupSizeOz = size === "custom" ? Number(customOz) : CUP_SIZES.find((s) => s.id === size)!.oz;
  const ratio = STRENGTHS.find((s) => s.id === strength)!.ratio;

  const { result, cost, error } = useMemo(() => {
    try {
      const result = calculateGroundCoffee(Number(cups), cupSizeOz, ratio);
      const cost = calculateCupCost(cupSizeOz, ratio, {
        bagPrice: toPrice(prices.bagPrice),
        bagOz: prices.bagOz,
        cupPrice: toPrice(prices.cup),
        sleevePrice: toPrice(prices.sleeve),
        lidPrice: toPrice(prices.lid),
      });
      return { result, cost, error: null };
    } catch (err) {
      if (err instanceof ValidationError) return { result: null, cost: null, error: err.message };
      throw err;
    }
  }, [cups, cupSizeOz, ratio, prices]);

  const parts = cost
    ? [
        { label: "Coffee", value: cost.coffee },
        { label: "Cup", value: cost.cup },
        { label: "Sleeve", value: cost.sleeve },
        { label: "Lid", value: cost.lid },
      ]
    : [];

  return (
    <>
      <header className="adm-head">
        <div>
          <h1>Brew planner</h1>
          <p>How much coffee to bring, and what each cup costs you.</p>
        </div>
      </header>

      <div className="cols cols--wide">
        <section className="card">
          <h2>Cup size <small>fl oz</small></h2>
          <div className="sizes">
            {CUP_SIZES.map((s) => (
              <button key={s.id} aria-pressed={size === s.id} onClick={() => setSize(s.id)}>
                {s.label}<small>{s.oz} oz</small>
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 8 }}>
            <button className={`b b--sm ${size === "custom" ? "" : "b--ghost"}`} onClick={() => setSize("custom")}>Custom size</button>
            {size === "custom" && (
              <label className="f" style={{ width: 120 }}>
                <input type="number" min="0" step="any" inputMode="decimal" aria-label="Custom size in fl oz" value={customOz} onChange={(e) => setCustomOz(e.target.value)} />
              </label>
            )}
          </div>

          <div className="form" style={{ marginTop: 18 }}>
            <label className="f">
              <span>Cups</span>
              <input type="number" min="1" inputMode="numeric" value={cups} onChange={(e) => setCups(e.target.value)} />
            </label>
            <div className="f">
              <span>Strength (water : coffee)</span>
              <div className="seg" role="group" aria-label="Strength">
                {STRENGTHS.map((s) => (
                  <button key={s.id} aria-pressed={strength === s.id} onClick={() => setStrength(s.id)}>{s.label} {s.ratio}:1</button>
                ))}
              </div>
            </div>
          </div>

          <h2 style={{ marginTop: 24 }}>Supplies <small>saved on this device</small></h2>
          <div className="form">
            <div className="f f--wide">
              <span>Bag size</span>
              <div className="seg" role="group" aria-label="Bag size">
                {BAG_SIZES.map((b) => (
                  <button key={b.label} aria-pressed={prices.bagOz === b.oz} onClick={() => setPrice("bagOz", b.oz)}>{b.label}</button>
                ))}
              </div>
            </div>
            <label className="f"><span>Bag price ($)</span><input inputMode="decimal" value={prices.bagPrice} onChange={(e) => setPrice("bagPrice", e.target.value)} /></label>
            <label className="f"><span>Cup ($ each)</span><input inputMode="decimal" value={prices.cup} onChange={(e) => setPrice("cup", e.target.value)} /></label>
            <label className="f"><span>Sleeve ($ each)</span><input inputMode="decimal" value={prices.sleeve} onChange={(e) => setPrice("sleeve", e.target.value)} /></label>
            <label className="f"><span>Lid ($ each)</span><input inputMode="decimal" value={prices.lid} onChange={(e) => setPrice("lid", e.target.value)} /></label>
          </div>
        </section>

        <div>
          <section className="card" aria-live="polite">
            {error || !result ? (
              <p className="msg msg--bad">{error ?? "Enter how many cups."}</p>
            ) : (
              <>
                <h2>
                  You&apos;ll need
                  <span className="seg" role="group" aria-label="Weight unit" style={{ flex: "0 0 auto" }}>
                    {WEIGHT_UNITS.map((u) => (
                      <button key={u.id} aria-pressed={unit === u.id} onClick={() => setUnit(u.id)} style={{ minHeight: 32 }}>{u.id}</button>
                    ))}
                  </span>
                </h2>
                <p className="big">{fmt(result[WEIGHT_UNITS.find((u) => u.id === unit)!.key])}<small>{unit}</small></p>
                <p className="row__sub">of ground coffee for {fmt(result.cups)} × {result.cupSizeOz} fl oz · {fmt(result.waterOz)} oz water</p>
                <table className="table" style={{ marginTop: 16 }}>
                  <thead><tr><th>Bag size</th><th className="num">To buy</th><th className="num">Brews per bag</th></tr></thead>
                  <tbody>
                    {result.bags.map((b) => (
                      <tr key={b.label}><td>{b.label}</td><td className="num">{b.bagsNeeded}</td><td className="num">{b.brewsPerBag || "—"}</td></tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </section>

          {cost && result && (
            <section className="card">
              <h2>Cost per cup</h2>
              <p className="big">{dollars(cost.total)}</p>
              <div className="list" style={{ marginTop: 12 }}>
                {parts.map((p) => (
                  <div key={p.label} style={{ padding: "6px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                      <span>{p.label}</span><span>${p.value.toFixed(3)}</span>
                    </div>
                    <div className="bar"><div style={{ width: `${cost.total > 0 ? (p.value / cost.total) * 100 : 0}%` }} /></div>
                  </div>
                ))}
              </div>
              <dl className="kv" style={{ marginTop: 14 }}>
                <dt>{fmt(result.cups)} cups cost you</dt><dd><strong>{dollars(cost.total * result.cups)}</strong></dd>
                <dt>Cups per bag</dt><dd>{cost.cupsPerBag}</dd>
              </dl>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
