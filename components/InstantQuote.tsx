"use client";

import { track } from "@vercel/analytics";
import { useId, useState } from "react";
import { allDay, instantQuote, usd } from "@/lib/packages";
import { Icon } from "./Icons";

export type QuoteHandoff = { guests: number; eventType: string; summary: string; price: number };
export const QUOTE_EVENT = "vcc:quote";

const LENGTHS = [
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "4", label: "4 hours" },
  { value: "5", label: "5 hours" },
  { value: "6", label: "6 hours" },
  { value: "day1", label: `All day (up to ${allDay.hours} hrs)` },
  { value: "day2", label: "2 days, all day" },
  { value: "day3", label: "3 days, all day" },
];

/** Headcount + service length → price on the spot. "Book this price" fills in the booking form. */
export function InstantQuote({ defaultGuests = 50, defaultLength = "3" }: { defaultGuests?: number; defaultLength?: string }) {
  const id = useId();
  const [guests, setGuests] = useState(defaultGuests);
  const [length, setLength] = useState(defaultLength);
  const allDayDays = length.startsWith("day") ? Number(length.slice(3)) : 0;
  const q = instantQuote({ guests, hours: allDayDays ? 0 : Number(length), allDayDays });

  function book() {
    if (!q) return;
    const span = q.days > 1 ? `${q.days} days, all day` : allDayDays ? "all day" : `${q.hours} hours`;
    const summary = `Instant price: ${usd(q.price)} for ${guests} guests, ${span} (${q.label}).`;
    const handoff: QuoteHandoff = { guests, eventType: allDayDays ? "Hackathon" : "", summary, price: q.price };
    window.dispatchEvent(new CustomEvent<QuoteHandoff>(QUOTE_EVENT, { detail: handoff }));
    track("Instant price booked", { price: q.price, guests });
    document.getElementById("book")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="iq">
      <div className="iq__fields">
        <div>
          <label htmlFor={`${id}-g`}>Guests</label>
          <input
            id={`${id}-g`}
            type="number"
            inputMode="numeric"
            min={1}
            max={5000}
            value={guests || ""}
            onChange={(e) => setGuests(Number(e.target.value))}
          />
        </div>
        <div>
          <label htmlFor={`${id}-l`}>How long</label>
          <select id={`${id}-l`} value={length} onChange={(e) => setLength(e.target.value)}>
            {LENGTHS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="iq__out" aria-live="polite">
        {q ? (
          <>
            <p className="iq__label">Your price</p>
            <p className="iq__price">{usd(q.price)}</p>
            <p className="iq__meta">
              {usd(q.perGuest, true)} per guest{q.days > 1 ? " per day" : ""} · {q.label}
              {q.extraHours > 0 ? ` + ${q.extraHours} extra ${q.extraHours === 1 ? "hour" : "hours"}` : ""}
            </p>
            {q.cheaperAllDay && (
              <p className="iq__note">
                Tip: all-day service (up to {allDay.hours} hrs) is {usd(q.cheaperAllDay)}.{" "}
                <button type="button" className="iq__link" onClick={() => setLength("day1")}>Switch to all day</button>
              </p>
            )}
            {q.custom && <p className="iq__note">Over 500 guests: we&apos;ll confirm staffing and this price within a business day.</p>}
          </>
        ) : (
          <p className="iq__label">Enter your headcount to see a price</p>
        )}
      </div>

      <div className="iq__actions">
        <button type="button" className="btn" onClick={book} disabled={!q}>
          Book this price <Icon name="arrow" size={16} />
        </button>
        <p className="iq__fine">All-in: staff, coffee, cups, setup, cleanup and travel in NYC. No card needed to request.</p>
      </div>
    </div>
  );
}
