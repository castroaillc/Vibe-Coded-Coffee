"use client";

import { track } from "@vercel/analytics";
import { useId, useState } from "react";
import { Icon } from "./Icons";

type Status = "idle" | "loading" | "success" | "error";

export function WaitlistForm({ source = "hero", tone = "dark" }: { source?: string; tone?: "dark" | "light" }) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      track("Waitlist signup", { source });
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className={`waitlist-done waitlist-done--${tone}`} role="status" aria-live="polite">
        <p className="waitlist-done__title">You&apos;re on the list.</p>
        <p>Your free first month is reserved. We&apos;ll email you the opening date and your invite.</p>
      </div>
    );
  }

  return (
    <form className={`waitlist waitlist--${tone}`} onSubmit={onSubmit} noValidate={false}>
      <div className="waitlist__fields">
        <label className="sr-only" htmlFor={`${id}-name`}>First name</label>
        <input id={`${id}-name`} name="firstName" type="text" autoComplete="given-name" placeholder="First name" maxLength={60} />
        <label className="sr-only" htmlFor={`${id}-email`}>Email address</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@email.com"
          required
          maxLength={254}
        />
        {/* Honeypot: hidden from people, bots fill it in */}
        <div className="hp" inert>
          <label htmlFor={`${id}-company`}>Company</label>
          <input id={`${id}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <button type="submit" className="btn" disabled={status === "loading"}>
          {status === "loading" ? "Joining…" : "Claim my free month"}
          <Icon name="arrow" size={16} />
        </button>
      </div>
      <p className="waitlist__note" aria-live="polite">
        {status === "error" ? <span className="waitlist__error">{message}</span> : "No card needed. Unsubscribe anytime."}
      </p>
    </form>
  );
}
