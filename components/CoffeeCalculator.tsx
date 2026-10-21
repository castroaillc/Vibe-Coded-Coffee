"use client";

import { useId, useState } from "react";
import { planCoffee } from "@/lib/coffee-plan";

const RATES = [
  { value: 1, label: "Light (1 cup each)" },
  { value: 1.5, label: "Typical (1.5 cups each)" },
  { value: 2, label: "Heavy (2 cups each)" },
];

/** Headcount → cups, gallons and pounds of ground coffee. */
export function CoffeeCalculator() {
  const id = useId();
  const [guests, setGuests] = useState(100);
  const [days, setDays] = useState(1);
  const [rate, setRate] = useState(1.5);
  const ok = guests > 0 && guests <= 100000 && days > 0 && days <= 14;
  const r = ok ? planCoffee(guests, days, rate) : null;

  return (
    <div className="calc">
      <div className="calc__fields">
        <div>
          <label htmlFor={`${id}-g`}>Guests</label>
          <input id={`${id}-g`} type="number" inputMode="numeric" min={1} max={100000} value={guests || ""} onChange={(e) => setGuests(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor={`${id}-d`}>Event days</label>
          <input id={`${id}-d`} type="number" inputMode="numeric" min={1} max={14} value={days || ""} onChange={(e) => setDays(Number(e.target.value))} />
        </div>
        <div>
          <label htmlFor={`${id}-r`}>Coffee drinkers</label>
          <select id={`${id}-r`} value={rate} onChange={(e) => setRate(Number(e.target.value))}>
            {RATES.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}
          </select>
        </div>
      </div>
      <dl className="calc__out" aria-live="polite">
        <div><dt>12 oz cups</dt><dd>{r ? r.cups.toLocaleString() : "–"}</dd></div>
        <div><dt>Gallons of coffee</dt><dd>{r ? r.gallons.toLocaleString() : "–"}</dd></div>
        <div><dt>Ground coffee</dt><dd>{r ? `${r.lb.toLocaleString()} lb` : "–"}</dd></div>
      </dl>
    </div>
  );
}
