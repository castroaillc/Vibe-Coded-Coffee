"use client";

import { useId, useState } from "react";
import { eventTypes } from "@/lib/site";
import { Icon } from "./Icons";

type Status = "idle" | "loading" | "success" | "error";

/** "Book us for your event": posts to /api/booking. */
export function BookingForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const today = new Date().toLocaleDateString("en-CA");

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
        body: JSON.stringify(data),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setStatus("success");
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
        <p>Thanks! We&apos;ll reply within one business day with a quote. Check your inbox for a confirmation.</p>
      </div>
    );
  }

  const f = (name: string) => `${id}-${name}`;
  return (
    <form className="booking" onSubmit={onSubmit}>
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
          <label htmlFor={f("phone")}>Phone <span>optional</span></label>
          <input id={f("phone")} name="phone" type="tel" autoComplete="tel" inputMode="tel" maxLength={30} />
        </div>
        <div className="booking__field">
          <label htmlFor={f("eventType")}>Type of event</label>
          <select id={f("eventType")} name="eventType" defaultValue="">
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
        <div className="hp" aria-hidden="true">
          <label htmlFor={f("website")}>Website</label>
          <input id={f("website")} name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
      </div>
      <div className="booking__actions">
        <button type="submit" className="btn" disabled={status === "loading"}>
          {status === "loading" ? "Sending…" : "Request a quote"}
          <Icon name="arrow" size={16} />
        </button>
        <p className="booking__note" aria-live="polite">
          {status === "error" ? <span className="booking__error">{message}</span> : "No commitment. We reply within one business day."}
        </p>
      </div>
    </form>
  );
}
