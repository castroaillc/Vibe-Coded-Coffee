"use client";

import { track } from "@vercel/analytics";
import { useEffect, useId, useRef, useState } from "react";
import { eventTypes, site } from "@/lib/site";
import { Icon } from "./Icons";
import { QUOTE_EVENT, type QuoteHandoff } from "./InstantQuote";

type Status = "idle" | "loading" | "success" | "error";

/** "Book us for your event": posts to /api/booking. */
export function BookingForm({ defaultEventType = "" }: { defaultEventType?: string } = {}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const today = new Date().toLocaleDateString("en-CA");
  const formRef = useRef<HTMLFormElement>(null);
  const [quote, setQuote] = useState<QuoteHandoff | null>(null);

  // "Book this price" in the instant-price calculator fills in headcount, event type and the price.
  useEffect(() => {
    function onQuote(e: Event) {
      const q = (e as CustomEvent<QuoteHandoff>).detail;
      setQuote(q);
      const form = formRef.current;
      if (!form) return;
      const set = (name: string, value: string) => {
        const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
        if (el && value) el.value = value;
      };
      set("headcount", String(q.guests));
      set("eventType", q.eventType);
      form.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true });
    }
    window.addEventListener(QUOTE_EVENT, onQuote);
    return () => window.removeEventListener(QUOTE_EVENT, onQuote);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, page: window.location.pathname }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      track("Booking request", { eventType: String(data.eventType || "unspecified"), headcount: Number(data.headcount) || 0, quoted: quote ? quote.price : 0 });
      setStatus("success");
      setQuote(null);
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="booking-done" role="status" aria-live="polite">
        <p className="booking-done__title">Request received.</p>
        <p>Thanks! We&apos;ll confirm your date and price within one business day. Check your inbox for a confirmation.</p>
      </div>
    );
  }

  const f = (name: string) => `${id}-${name}`;
  return (
    <form className="booking" onSubmit={onSubmit} ref={formRef}>
      {quote && (
        <p className="booking__quote">
          <strong>{quote.summary}</strong> Add your details and we&apos;ll lock in this price.
          <input type="hidden" name="quote" value={quote.summary} />
        </p>
      )}
      <div className="booking__grid">
        <div className="booking__field">
          <label htmlFor={f("name")}>Your name</label>
          <input id={f("name")} name="name" type="text" autoComplete="name" required maxLength={80} />
        </div>
        <div className="booking__field">
          <label htmlFor={f("email")}>Work email</label>
          <input id={f("email")} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} />
        </div>
        <div className="booking__field">
          <label htmlFor={f("company")}>Company or community <span>optional</span></label>
          <input id={f("company")} name="company" type="text" autoComplete="organization" maxLength={120} />
        </div>
        <div className="booking__field">
          <label htmlFor={f("phone")}>Phone</label>
          <input id={f("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" required maxLength={30} />
        </div>
        <div className="booking__field">
          <label htmlFor={f("eventType")}>Type of event</label>
          <select id={f("eventType")} name="eventType" defaultValue={defaultEventType}>
            <option value="" disabled>Choose one</option>
            {eventTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="booking__field">
          <label htmlFor={f("eventDate")}>Event date</label>
          <input id={f("eventDate")} name="eventDate" type="date" min={today} required />
        </div>
        <div className="booking__field">
          <label htmlFor={f("headcount")}>Number of guests</label>
          <input id={f("headcount")} name="headcount" type="number" inputMode="numeric" min={1} max={100000} required />
        </div>
        <div className="booking__field">
          <label htmlFor={f("location")}>Venue or neighborhood</label>
          <input id={f("location")} name="location" type="text" required maxLength={200} placeholder="e.g. Brooklyn Navy Yard" />
        </div>
        <div className="booking__field booking__field--wide">
          <label htmlFor={f("notes")}>Anything else? <span>optional</span></label>
          <textarea id={f("notes")} name="notes" rows={3} maxLength={2000} placeholder="Start and end times, how long you need coffee for, setup details…" />
        </div>
        {/* Honeypot: hidden from people, bots fill it in */}
        <div className="hp" inert>
          <label htmlFor={f("website")}>Website</label>
          <input id={f("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <div className="booking__actions">
        <button type="submit" className="btn" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : quote ? "Hold my date" : "Check my date"}
          <Icon name="arrow" size={16} />
        </button>
        <p className="booking__note" aria-live="polite">
          {status === "error" ? <span className="booking__error">{message}</span> : "No commitment, no card. We confirm within one business day."}
        </p>
      </div>
      <p className="booking__consent">
        By submitting, you agree {site.name} may call, text or WhatsApp you at this number about your event. Msg &amp; data rates may apply.
      </p>
    </form>
  );
}
