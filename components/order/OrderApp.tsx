"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addons, beans, defaultOrder, describe, drinks, findDrink, milks, sizes, type Option, type Order,
} from "@/lib/app-data";
import { authClient } from "@/lib/auth-client";
import { qrPath } from "@/lib/qr";
import { InstallPrompt } from "./InstallPrompt";
import { useAppState, type AppData } from "./useAppState";

type Tab = "order" | "favorites" | "pass" | "events";
const TABS: { id: Tab; label: string }[] = [
  { id: "order", label: "Order" },
  { id: "favorites", label: "Favorites" },
  { id: "pass", label: "Pass" },
  { id: "events", label: "Events" },
];

type App = ReturnType<typeof useAppState>;

export function OrderApp() {
  const app = useAppState();
  const [tab, setTab] = useState<Tab>("order");

  // Deep links from home-screen shortcuts and Stripe's return URL: /order#pass, /order#events …
  useEffect(() => {
    const fromHash = () => {
      const h = window.location.hash.slice(1) as Tab;
      if (TABS.some((t) => t.id === h)) setTab(h);
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  const go = (t: Tab) => {
    setTab(t);
    history.replaceState(null, "", `#${t}`);
    window.scrollTo({ top: 0 });
  };

  if (app.loading) return <div className="app-shell" aria-busy="true" />;
  if (!app.session.data) return <SignIn />;
  if (!app.data) {
    return (
      <div className="app-shell app-welcome">
        <p className="app-muted">Couldn&apos;t load your account.</p>
        <button type="button" className="app-btn" onClick={() => app.reload()}>Try again</button>
      </div>
    );
  }
  if (!app.data.member) return <ProfileSetup app={app} data={app.data} />;

  const data = app.data;
  const first = (data.user?.name ?? "").split(" ")[0] || "there";

  return (
    <div className="app-shell">
      <header className="app-top">
        <div className="app-top__hello">
          <img src="/brand/icon-192.png" alt="" width={36} height={36} />
          <p>Hi, {first}</p>
        </div>
        <button type="button" className="pts-chip" onClick={() => go("pass")} aria-label={`${data.points} points. Open pass`}>
          {data.points} pts
        </button>
      </header>

      {app.error && (
        <div className="app-alert" role="alert">
          <p>{app.error}</p>
          <button type="button" className="install__close" onClick={app.clearError} aria-label="Dismiss">
            <CloseIcon />
          </button>
        </div>
      )}

      <main className="app-main">
        {tab === "order" && <OrderTab app={app} data={data} onQueued={() => go("pass")} />}
        {tab === "favorites" && <FavoritesTab app={app} data={data} onQueued={() => go("pass")} onBuild={() => go("order")} />}
        {tab === "pass" && <PassTab app={app} data={data} onOrder={() => go("order")} />}
        {tab === "events" && <EventsTab app={app} data={data} />}
      </main>

      <nav className="tabbar" aria-label="App">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tabbar__btn${tab === t.id ? " is-active" : ""}`}
            aria-current={tab === t.id ? "page" : undefined}
            onClick={() => go(t.id)}
          >
            <TabIcon id={t.id} />
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ── Sign in with an emailed code ──────────────────────────── */
function SignIn() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function sendCode(e?: React.FormEvent) {
    e?.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await authClient.emailOtp.sendVerificationOtp({ email: email.trim(), type: "sign-in" });
    setBusy(false);
    if (err) setError(err.message ?? "Couldn't send the code. Check the email address.");
    else setStep("code");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error: err } = await authClient.signIn.emailOtp({ email: email.trim(), otp: code.trim() });
    setBusy(false);
    if (err) setError(err.message ?? "That code didn't work. Try again or send a new one.");
    // On success the session updates and OrderApp moves on by itself.
  }

  return (
    <div className="app-shell app-welcome">
      <img src="/brand/logo-stacked-on-dark.svg" alt="Vibe Coded Coffee" width={220} height={192} className="app-welcome__logo" />
      <h1 className="app-h1">Your daily coffee, one scan away.</h1>
      <p className="app-muted">Sign in with your email. We&apos;ll send you a 6-digit code, no password needed.</p>

      {step === "email" ? (
        <form className="app-form" onSubmit={sendCode}>
          <label className="app-field">
            <span>Email</span>
            <input type="email" inputMode="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          {error && <p className="app-error" role="alert">{error}</p>}
          <button className="app-btn app-btn--block" type="submit" disabled={busy || !email.includes("@")}>
            {busy ? "Sending…" : "Email me a code"}
          </button>
        </form>
      ) : (
        <form className="app-form" onSubmit={verify}>
          <label className="app-field">
            <span>Code sent to {email}</span>
            <input
              className="app-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              required
              autoFocus
            />
          </label>
          {error && <p className="app-error" role="alert">{error}</p>}
          <button className="app-btn app-btn--block" type="submit" disabled={busy || code.length !== 6}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <div className="app-row">
            <button type="button" className="app-link" onClick={() => { setStep("email"); setCode(""); setError(""); }}>Use a different email</button>
            <button type="button" className="app-link" onClick={() => sendCode()} disabled={busy}>Send a new code</button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ── First-time profile: name + phone for the kiosk ─────────── */
function ProfileSetup({ app, data }: { app: App; data: AppData }) {
  const suggested = data.user?.name && !data.user.name.includes("@") ? data.user.name : "";
  const [name, setName] = useState(suggested);
  const [phone, setPhone] = useState("");
  const valid = name.trim().length > 0 && phone.replace(/\D/g, "").length >= 10;

  return (
    <div className="app-shell app-welcome">
      <h1 className="app-h1">Set up your pass</h1>
      <p className="app-muted">Your number lets the kiosk find you if you forget your phone.</p>
      <form className="app-form" onSubmit={(e) => { e.preventDefault(); if (valid) void app.saveProfile(name, phone); }}>
        <label className="app-field">
          <span>First name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" required maxLength={40} />
        </label>
        <label className="app-field">
          <span>Mobile number</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" inputMode="tel" autoComplete="tel" placeholder="(555) 555-0123" required />
        </label>
        {app.error && <p className="app-error" role="alert">{app.error}</p>}
        <button className="app-btn app-btn--block" type="submit" disabled={!valid || app.busy}>
          {app.busy ? "Saving…" : "Create my pass"}
        </button>
        <button type="button" className="app-link" onClick={() => void app.signOut()}>Sign out</button>
      </form>
    </div>
  );
}

/* ── Membership call-to-action ─────────────────────────────── */
function MembershipCard({ app }: { app: App }) {
  return (
    <section className="member-card" aria-labelledby="member-title">
      <h2 id="member-title" className="member-card__title">Your first month is free</h2>
      <p className="member-card__text">Start your membership to order your daily coffee. Cancel anytime during the free month.</p>
      <button type="button" className="app-btn app-btn--block" onClick={() => void app.startMembership()} disabled={app.busy}>
        {app.busy ? "Opening checkout…" : "Start my free month"}
      </button>
    </section>
  );
}

/* ── Order builder ─────────────────────────────────────────── */
function OrderTab({ app, data, onQueued }: { app: App; data: AppData; onQueued: () => void }) {
  const [order, setOrder] = useState<Order>(() => data.queued?.order ?? data.favorites[0]?.order ?? defaultOrder());
  const [saving, setSaving] = useState(false);
  const [favName, setFavName] = useState("");
  const [savedMsg, setSavedMsg] = useState("");
  const drink = findDrink(order.drink);
  const isCoffee = drink.category === "coffee";
  const active = data.membership.active;

  const set = (patch: Partial<Order>) => setOrder((o) => ({ ...o, ...patch }));
  const pickDrink = (id: string) => setOrder((o) => ({ ...defaultOrder(id), size: o.size, addons: o.addons }));
  const toggleAddon = (id: string) =>
    setOrder((o) => ({ ...o, addons: o.addons.includes(id) ? o.addons.filter((a) => a !== id) : [...o.addons, id] }));

  const groups = [
    { id: "coffee", label: "Coffee" },
    { id: "matcha", label: "Matcha" },
    { id: "tea", label: "Tea" },
  ];

  return (
    <div className="order">
      <InstallPrompt />
      {!active && <MembershipCard app={app} />}
      <StatusCard data={data} />

      <h1 className="app-h1">Build your drink</h1>

      <section className="opt" aria-labelledby="opt-drink">
        <h2 id="opt-drink" className="opt__label">Drink</h2>
        {groups.map((g) => (
          <div key={g.id} className="drink-group">
            <p className="drink-group__name">{g.label}</p>
            <div className="drink-row" role="radiogroup" aria-label={g.label}>
              {drinks.filter((d) => d.category === g.id).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  role="radio"
                  aria-checked={order.drink === d.id}
                  className={`drink${order.drink === d.id ? " is-on" : ""}`}
                  onClick={() => pickDrink(d.id)}
                >
                  <span className="drink__verb">{d.verb}…</span>
                  <span className="drink__name">{d.name}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Choice title="Size" options={sizes} value={order.size} onPick={(size) => set({ size })} variant="segment" />
      {isCoffee && <Choice title="Bean" options={beans} value={order.bean} onPick={(bean) => set({ bean })} variant="list" mono />}
      <Choice title="Milk" options={milks} value={order.milk} onPick={(milk) => set({ milk })} variant="pills" />

      <section className="opt" aria-labelledby="opt-addons">
        <h2 id="opt-addons" className="opt__label">Add-ons <span className="opt__hint">pick any</span></h2>
        <div className="pills">
          {addons.map((a) => (
            <button
              key={a.id}
              type="button"
              aria-pressed={order.addons.includes(a.id)}
              className={`pill${order.addons.includes(a.id) ? " is-on" : ""}`}
              onClick={() => toggleAddon(a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </section>

      {saving && (
        <form
          className="save-sheet"
          onSubmit={async (e) => {
            e.preventDefault();
            if (await app.saveFavorite(favName, order)) {
              setSaving(false);
              setSavedMsg("Saved to favorites");
              setTimeout(() => setSavedMsg(""), 2500);
            }
          }}
        >
          <label className="app-field">
            <span>Name this favorite</span>
            <input autoFocus value={favName} onChange={(e) => setFavName(e.target.value)} placeholder="Morning default" maxLength={40} />
          </label>
          <div className="save-sheet__actions">
            <button type="button" className="app-btn app-btn--ghost" onClick={() => setSaving(false)}>Cancel</button>
            <button type="submit" className="app-btn" disabled={app.busy}>Save favorite</button>
          </div>
        </form>
      )}

      <div className="order-bar">
        <p className="order-bar__summary" aria-live="polite">{savedMsg || describe(order)}</p>
        <div className="order-bar__actions">
          <button type="button" className="app-btn app-btn--ghost" onClick={() => { setFavName(""); setSaving(true); }}>
            Save
          </button>
          {active ? (
            <button
              type="button"
              className="app-btn app-btn--grow"
              disabled={data.collectedToday || app.busy}
              onClick={async () => { if (await app.queue(order)) onQueued(); }}
            >
              {data.collectedToday ? "Collected today" : app.busy ? "Queuing…" : data.queued ? "Update my order" : "Queue my coffee"}
            </button>
          ) : (
            <button type="button" className="app-btn app-btn--grow" disabled={app.busy} onClick={() => void app.startMembership()}>
              Start my free month
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Choice({
  title, options, value, onPick, variant, mono,
}: {
  title: string;
  options: Option[];
  value: string;
  onPick: (id: string) => void;
  variant: "segment" | "pills" | "list";
  mono?: boolean;
}) {
  const id = `opt-${title.toLowerCase()}`;
  return (
    <section className="opt" aria-labelledby={id}>
      <h2 id={id} className="opt__label">{title}</h2>
      <div className={variant === "segment" ? "segment" : variant === "list" ? "choice-list" : "pills"} role="radiogroup" aria-labelledby={id}>
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={value === o.id}
            className={`${variant === "segment" ? "segment__btn" : variant === "list" ? "choice" : "pill"}${value === o.id ? " is-on" : ""}`}
            onClick={() => onPick(o.id)}
          >
            <span className={mono ? "mono" : undefined}>{o.label}</span>
            {o.detail && <small>{o.detail}</small>}
          </button>
        ))}
      </div>
    </section>
  );
}

function StatusCard({ data }: { data: AppData }) {
  if (data.collectedToday) return <p className="status status--done">Today&apos;s coffee: collected. See you tomorrow.</p>;
  if (data.queued) return <p className="status status--queued">Queued: {describe(data.queued.order)}. Show your pass at the kiosk.</p>;
  return null;
}

/* ── Favorites ─────────────────────────────────────────────── */
function FavoritesTab({ app, data, onQueued, onBuild }: { app: App; data: AppData; onQueued: () => void; onBuild: () => void }) {
  const favs = data.favorites;
  return (
    <div>
      <h1 className="app-h1">Favorites</h1>
      {favs.length === 0 ? (
        <div className="empty">
          <p>No favorites yet. Build a drink and tap <strong>Save</strong> to reorder it in one tap.</p>
          <button type="button" className="app-btn" onClick={onBuild}>Build a drink</button>
        </div>
      ) : (
        <ul className="fav-list">
          {favs.map((f) => (
            <li key={f.id} className="fav">
              <div className="fav__text">
                <p className="fav__name">{f.name}</p>
                <p className="fav__desc">{describe(f.order)}</p>
              </div>
              <div className="fav__actions">
                <button
                  type="button"
                  className="app-btn app-btn--sm"
                  disabled={!data.membership.active || data.collectedToday || app.busy}
                  onClick={async () => { if (await app.queue(f.order)) onQueued(); }}
                >
                  Queue
                </button>
                <button type="button" className="icon-btn" onClick={() => void app.removeFavorite(f.id)} aria-label={`Remove ${f.name}`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.6 8.5h5.8l.6-8.5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ── Pass (QR) + points + account ──────────────────────────── */
function PassTab({ app, data, onOrder }: { app: App; data: AppData; onOrder: () => void }) {
  const { member, pass, queued, points: pts, rules, history, membership } = data;
  const qr = useMemo(() => (pass ? qrPath(pass) : null), [pass]);
  const toReward = rules.rewardAt - (pts % rules.rewardAt);
  const rewards = Math.floor(pts / rules.rewardAt);
  const fmt = (iso: Date | string | null) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "";

  const membershipText = membership.active
    ? membership.status === "trialing"
      ? `Free month until ${fmt(membership.trialEnd)}`
      : membership.cancelAtPeriodEnd
        ? `Active until ${fmt(membership.periodEnd)}`
        : "Active"
    : "Not active";

  return (
    <div className="pass">
      <div className="pass__card">
        <p className="pass__name">{data.user?.name}</p>
        <p className="pass__id mono">member {member?.memberCode}</p>
        {qr && (
          <svg className="pass__qr" viewBox={`0 0 ${qr.size} ${qr.size}`} role="img" aria-label="Your member QR code">
            <rect width={qr.size} height={qr.size} fill="#fff" />
            <path d={qr.d} fill="#0A1F33" />
          </svg>
        )}
        <p className="pass__hint">
          Scan at the kiosk, or say the number ending <strong>{member?.phone.slice(-4)}</strong>. Your code refreshes daily.
        </p>
        {queued ? (
          <div className="pass__order">
            <p className="pass__order-label">Your order</p>
            <p className="pass__order-desc">{describe(queued.order)}</p>
            <div className="pass__order-actions">
              <button type="button" className="app-link" onClick={onOrder}>Change</button>
              <button type="button" className="app-link" onClick={() => void app.cancelQueued()}>Cancel</button>
            </div>
          </div>
        ) : (
          <div className="pass__order">
            <p className="pass__order-desc">
              {data.collectedToday
                ? "Today's coffee is collected."
                : data.favorites.length
                  ? "No drink queued. The kiosk will offer your latest favorite."
                  : "No drink queued yet."}
            </p>
            {!data.collectedToday && <button type="button" className="app-link" onClick={onOrder}>Build a drink</button>}
          </div>
        )}
      </div>

      <section className="points" aria-labelledby="points-title">
        <div className="points__head">
          <h2 id="points-title" className="opt__label">Points</h2>
          <p className="points__total">{pts}</p>
        </div>
        <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={rules.rewardAt} aria-valuenow={pts % rules.rewardAt}>
          <span style={{ width: `${((pts % rules.rewardAt) / rules.rewardAt) * 100}%` }} />
        </div>
        <p className="app-muted">
          {toReward} points to {rules.reward}.{rewards > 0 && ` You've earned ${rewards} so far.`} +{rules.perCoffee} per coffee, +{rules.perEvent} per event.
        </p>
        {history.length > 0 && (
          <ul className="history">
            {history.slice(0, 5).map((h) => (
              <li key={h.id}><span>{h.label}</span><span className="mono">+{h.pts}</span></li>
            ))}
          </ul>
        )}
      </section>

      <section className="points account" aria-labelledby="account-title">
        <h2 id="account-title" className="opt__label">Account</h2>
        <dl className="account__list">
          <div><dt>Email</dt><dd>{data.user?.email}</dd></div>
          <div><dt>Membership</dt><dd>{membershipText}</dd></div>
        </dl>
        {!membership.active && (
          <button type="button" className="app-btn app-btn--block" onClick={() => void app.startMembership()} disabled={app.busy}>
            Start my free month
          </button>
        )}
        <button type="button" className="app-link" onClick={() => void app.signOut()}>Sign out</button>
      </section>
    </div>
  );
}

/* ── Events ────────────────────────────────────────────────── */
function EventsTab({ app, data }: { app: App; data: AppData }) {
  const { events, rules } = data;
  const time = (iso: string) => new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  return (
    <div>
      <h1 className="app-h1">Events</h1>
      <p className="app-muted app-lead">Members-only nights for people who build. RSVP so we save you a seat; check in at the door for +{rules.perEvent} points.</p>
      {events.length === 0 ? (
        <div className="empty"><p>No events on the calendar yet. Check back soon.</p></div>
      ) : (
        <ul className="events">
          {events.map((e) => {
            const d = new Date(e.startsAt);
            return (
              <li key={e.id} className="event">
                <div className="event__date" aria-hidden="true">
                  <span>{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                  <strong>{d.getDate()}</strong>
                  <span>{d.toLocaleDateString("en-US", { month: "short" })}</span>
                </div>
                <div className="event__body">
                  <p className="event__verb mono">{e.verb}…</p>
                  <h2 className="event__title">{e.title}</h2>
                  <p className="event__meta">
                    <time dateTime={e.startsAt}>{d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</time>
                    , {time(e.startsAt)} – {time(e.endsAt)}
                  </p>
                  <p className="event__text">{e.body}</p>
                  <div className="event__actions">
                    {e.checkedIn ? (
                      <span className="event__spots">Checked in, +{rules.perEvent}</span>
                    ) : (
                      <button
                        type="button"
                        className={`app-btn app-btn--sm${e.going ? " app-btn--ghost" : ""}`}
                        aria-pressed={e.going}
                        disabled={app.busy}
                        onClick={() => void app.toggleRsvp(e.id)}
                      >
                        {e.going ? "Going ✓" : "RSVP"}
                      </button>
                    )}
                    <span className="event__spots">{e.spots} spots</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ── Icons (inline stroke SVG) ─────────────────────────────── */
function CloseIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
}

function TabIcon({ id }: { id: Tab }) {
  const p = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      {id === "order" && (<><path {...p} d="M5 9h12v4a6 6 0 0 1-12 0V9Z" /><path {...p} d="M17 10.5h1.5a2.5 2.5 0 0 1 0 5H16.5" /><path {...p} d="M8 12.5l2 1.5-2 1.5" /></>)}
      {id === "favorites" && <path {...p} d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />}
      {id === "pass" && (<><rect {...p} x="4" y="4" width="6" height="6" rx="1" /><rect {...p} x="14" y="4" width="6" height="6" rx="1" /><rect {...p} x="4" y="14" width="6" height="6" rx="1" /><path {...p} d="M14 14h2v2M20 14v6h-6v-2M17 17h0" /></>)}
      {id === "events" && (<><rect {...p} x="4" y="5" width="16" height="15" rx="2" /><path {...p} d="M4 10h16M9 3v4M15 3v4" /></>)}
    </svg>
  );
}
