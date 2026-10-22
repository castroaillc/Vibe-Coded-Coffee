"use client";

import { track } from "@vercel/analytics";
import { useId, useState } from "react";
import { EMAIL_CONSENT_TEXT, SMS_CONSENT_TEXT } from "@/lib/marketing";

type Status = "idle" | "loading" | "success" | "error";

/** QR landing form: email or phone (or both), with separate email and SMS consent. */
export function FreeCoffeeForm({ source = "free_coffee" }: { source?: string }) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [hasPhone, setHasPhone] = useState(false);
  const [claimedAt, setClaimedAt] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const email = String(f.get("email") ?? "").trim();
    const phone = String(f.get("phone") ?? "").trim();
    if (!email && !phone) {
      setStatus("error");
      setMessage("Add your email or phone number.");
      return;
    }
    const q = new URLSearchParams(window.location.search);
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: f.get("firstName"),
          email,
          phone,
          company: f.get("company"),
          emailConsent: Boolean(email) && f.get("emailConsent") === "on",
          smsConsent: Boolean(phone) && f.get("smsConsent") === "on",
          source,
          utm: {
            source: q.get("utm_source"),
            medium: q.get("utm_medium"),
            campaign: q.get("utm_campaign"),
            content: q.get("utm_content"),
            term: q.get("utm_term"),
          },
          landingPath: window.location.pathname,
          referrer: document.referrer,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setName(String(f.get("firstName") ?? "").trim());
      setClaimedAt(new Date().toLocaleString("en-US", { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }));
      track("Free coffee claim", { source: String(source), utmSource: q.get("utm_source") ?? "direct" });
      setStatus("success");
      window.scrollTo({ top: 0 });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="free-done" role="status" aria-live="polite">
        <svg className="free-done__check" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="24" fill="#3875EA" />
          <path d="M14 24.5l7 7 13-14" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="free-done__title">You&apos;re in{name ? `, ${name}` : ""}.</p>
        <p className="free-done__show">Show this screen at the coffee station for your free cup.</p>
        <p className="free-done__stamp">Free coffee · {claimedAt}</p>
        <a className="free-done__link" href="/#book">Running a tech event? Book Vibe Coded Coffee</a>
      </div>
    );
  }

  return (
    <form className="free-form" onSubmit={onSubmit}>
      <label htmlFor={`${id}-name`}>First name</label>
      <input id={`${id}-name`} name="firstName" type="text" autoComplete="given-name" maxLength={60} />

      <label htmlFor={`${id}-email`}>Email</label>
      <input id={`${id}-email`} name="email" type="email" inputMode="email" autoComplete="email" placeholder="you@email.com" maxLength={254} />

      <label htmlFor={`${id}-phone`}>Mobile number</label>
      <input
        id={`${id}-phone`}
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(917) 555-0101"
        maxLength={40}
        onChange={(e) => setHasPhone(e.currentTarget.value.trim().length > 0)}
      />
      <p className="free-form__hint">Email, phone, or both.</p>

      {/* Honeypot: hidden from people, bots fill it in */}
      <div className="hp" inert>
        <label htmlFor={`${id}-company`}>Company</label>
        <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <label className="free-check">
        <input type="checkbox" name="emailConsent" defaultChecked />
        <span>{EMAIL_CONSENT_TEXT}</span>
      </label>
      <label className={`free-check${hasPhone ? "" : " free-check--quiet"}`}>
        <input type="checkbox" name="smsConsent" />
        <span>{SMS_CONSENT_TEXT} <a href="/privacy">Privacy &amp; SMS terms</a>.</span>
      </label>

      <button type="submit" className="free-btn" disabled={status === "loading"}>
        {status === "loading" ? "One sec…" : "Get my free coffee"}
      </button>
      <p className="free-form__error" aria-live="polite">{status === "error" ? message : ""}</p>
    </form>
  );
}
