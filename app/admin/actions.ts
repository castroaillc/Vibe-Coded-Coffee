"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, ADMIN_COOKIE_MAX_AGE, adminToken, isAdminPassword, requireAdmin } from "@/lib/admin/auth";
import { toCents } from "@/lib/admin/format";
import { db, schema } from "@/lib/db";
import { EVENT_STATUSES, PAYMENT_METHODS, PAYMENT_STATUSES, type SaleItem } from "@/lib/db/schema";
import { id } from "@/lib/server/ids";
import { DEFAULT_PRICING, SERVICE_IDS, type PricingSettings, type Supply, type SupplyUse } from "@/lib/pricing";

const { client, cateringEvent, clientNote, product, sale } = schema;

// ── helpers ────────────────────────────────────────────────
const str = (f: FormData, key: string, max = 200) => String(f.get(key) ?? "").trim().slice(0, max);
const int = (f: FormData, key: string, max = 100_000) => Math.min(max, Math.max(0, Math.round(Number(f.get(key)) || 0)));
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function oneOf<T extends string>(list: readonly T[], v: unknown, fallback: T): T {
  return typeof v === "string" && (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

const refresh = () => revalidatePath("/admin", "layout");

function clientValues(f: FormData) {
  return {
    company: str(f, "company", 120),
    contactName: str(f, "contactName", 80),
    email: str(f, "email", 254).toLowerCase(),
    phone: str(f, "phone", 30),
  };
}

function eventValues(f: FormData) {
  const date = str(f, "date");
  const startTime = str(f, "startTime");
  if (!DATE_RE.test(date)) throw new Error("Pick the event date.");
  const paymentStatus = oneOf(PAYMENT_STATUSES, f.get("paymentStatus"), "unpaid");
  const quoteCents = toCents(str(f, "quote"));
  let paidCents = toCents(str(f, "paid"));
  if (paymentStatus === "paid" && paidCents < quoteCents) paidCents = quoteCents;
  return {
    title: str(f, "title", 120) || str(f, "eventType", 40) || "Event",
    eventType: str(f, "eventType", 40),
    date,
    startTime: TIME_RE.test(startTime) ? startTime : "",
    location: str(f, "location", 200),
    headcount: int(f, "headcount"),
    status: oneOf(EVENT_STATUSES, f.get("status"), "lead"),
    quoteCents,
    paidCents,
    paymentStatus,
    notes: str(f, "notes", 4000),
  };
}

// ── Sign in ────────────────────────────────────────────────
export async function adminSignIn(_prev: string, f: FormData) {
  if (!isAdminPassword(String(f.get("password") ?? ""))) {
    await new Promise((r) => setTimeout(r, 1000)); // slow down guessing
    return "Wrong password.";
  }
  (await cookies()).set(ADMIN_COOKIE, adminToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  redirect("/admin");
}

export async function adminSignOut() {
  (await cookies()).delete({ name: ADMIN_COOKIE, path: "/admin" });
  redirect("/admin/sign-in");
}

// ── Clients ────────────────────────────────────────────────
export async function createClient(f: FormData) {
  await requireAdmin();
  const values = clientValues(f);
  if (!values.company && !values.contactName) throw new Error("Add a company or a contact name.");
  const clientId = id();
  await db.insert(client).values({ id: clientId, ...values, notes: str(f, "notes", 4000) });
  refresh();
  redirect(`/admin/clients/${clientId}`);
}

export async function updateClient(clientId: string, f: FormData) {
  await requireAdmin();
  await db.update(client).set({ ...clientValues(f), notes: str(f, "notes", 4000) }).where(eq(client.id, clientId));
  refresh();
}

export async function deleteClient(clientId: string) {
  await requireAdmin();
  const events = await db.select({ id: cateringEvent.id }).from(cateringEvent).where(eq(cateringEvent.clientId, clientId)).limit(1);
  if (events.length) throw new Error("This client has events. Delete those first.");
  await db.delete(client).where(eq(client.id, clientId));
  refresh();
  redirect("/admin/clients");
}

// ── Events (the pipeline) ──────────────────────────────────
/** New event for an existing client (clientId) or a new one (company, contactName, email, phone). */
export async function createEvent(f: FormData) {
  await requireAdmin();
  const values = eventValues(f);
  let clientId = str(f, "clientId", 60);
  if (!clientId) {
    const c = clientValues(f);
    if (!c.company && !c.contactName) throw new Error("Pick a client or add a new one.");
    clientId = id();
    await db.insert(client).values({ id: clientId, ...c });
  }
  const eventId = id();
  await db.insert(cateringEvent).values({ id: eventId, clientId, ...values });
  refresh();
  redirect(`/admin/events/${eventId}`);
}

export async function updateEvent(eventId: string, f: FormData) {
  await requireAdmin();
  await db.update(cateringEvent).set(eventValues(f)).where(eq(cateringEvent.id, eventId));
  refresh();
}

/** One-tap move along the pipeline. */
export async function setEventStatus(eventId: string, status: string) {
  await requireAdmin();
  await db
    .update(cateringEvent)
    .set({ status: oneOf(EVENT_STATUSES, status, "lead") })
    .where(eq(cateringEvent.id, eventId));
  refresh();
}

export async function deleteEvent(eventId: string) {
  await requireAdmin();
  await db.delete(clientNote).where(eq(clientNote.eventId, eventId));
  await db.delete(cateringEvent).where(eq(cateringEvent.id, eventId));
  refresh();
  redirect("/admin/pipeline");
}

// ── Notes (CRM activity log) ───────────────────────────────
export async function addNote(clientId: string, eventId: string | null, f: FormData) {
  await requireAdmin();
  const text = str(f, "text", 4000);
  if (!text) return;
  await db.insert(clientNote).values({ id: id(), clientId, eventId, text });
  refresh();
}

export async function deleteNote(noteId: string) {
  await requireAdmin();
  await db.delete(clientNote).where(eq(clientNote.id, noteId));
  refresh();
}

// ── POS ────────────────────────────────────────────────────
export type ProductInput = { id?: string; name: string; priceCents: number; active: boolean };

/** Saves the whole menu from the POS editor. Products left out are hidden, not deleted, so old sales keep their names. */
export async function saveProducts(list: ProductInput[]) {
  await requireAdmin();
  const rows = list
    .map((p, i) => ({
      id: p.id || id(),
      name: String(p.name ?? "").trim().slice(0, 80),
      priceCents: Math.max(0, Math.round(Number(p.priceCents) || 0)),
      active: p.active !== false,
      sort: i,
    }))
    .filter((p) => p.name);
  const keep = rows.map((r) => r.id);
  const existing = await db.select({ id: product.id }).from(product);
  const gone = existing.map((e) => e.id).filter((x) => !keep.includes(x));
  if (gone.length) await db.update(product).set({ active: false }).where(inArray(product.id, gone));
  for (const r of rows) {
    await db.insert(product).values(r).onConflictDoUpdate({ target: product.id, set: { name: r.name, priceCents: r.priceCents, active: r.active, sort: r.sort } });
  }
  refresh();
}

export type CartLine = { productId: string | null; name?: string; qty: number; unitCents?: number };

/**
 * Records a checkout. Product prices come from the database, so a stale screen can't undercharge.
 * Returns an error message instead of throwing so the POS can show it.
 */
export async function recordSale(input: { lines: CartLine[]; method: string; eventId: string | null }) {
  await requireAdmin();
  const method = oneOf(PAYMENT_METHODS, input.method, "card");
  const ids = input.lines.map((l) => l.productId).filter((x): x is string => Boolean(x));
  const products = ids.length ? await db.select().from(product).where(inArray(product.id, ids)) : [];
  const byId = new Map(products.map((p) => [p.id, p]));

  const items: SaleItem[] = [];
  for (const l of input.lines) {
    const qty = Math.min(1000, Math.max(1, Math.round(Number(l.qty) || 1)));
    if (l.productId) {
      const p = byId.get(l.productId);
      if (!p) return { error: "A product in the cart no longer exists. Refresh and try again." };
      items.push({ productId: p.id, name: p.name, qty, unitCents: p.priceCents });
    } else {
      items.push({ productId: null, name: String(l.name ?? "").trim().slice(0, 80) || "Custom amount", qty, unitCents: Math.max(0, Math.round(Number(l.unitCents) || 0)) });
    }
  }
  if (!items.length) return { error: "The cart is empty." };

  let eventId: string | null = null;
  if (input.eventId) {
    const [e] = await db.select({ id: cateringEvent.id }).from(cateringEvent).where(eq(cateringEvent.id, input.eventId));
    eventId = e?.id ?? null;
  }
  const totalCents = method === "comp" ? 0 : items.reduce((sum, i) => sum + i.qty * i.unitCents, 0);
  await db.insert(sale).values({ id: id(), eventId, items, totalCents, method });
  refresh();
  return { ok: true as const, totalCents };
}

export async function voidSale(saleId: string) {
  await requireAdmin();
  await db.delete(sale).where(eq(sale.id, saleId));
  refresh();
}

// ── Pricing ────────────────────────────────────────────────
const num = (v: unknown, max = 1_000_000) => Math.min(max, Math.max(0, Number(v) || 0));
const USES: SupplyUse[] = ["coffee", "per_cup", "per_guest", "per_event"];

/** Saves supply prices, labor and service rates for the quote calculator. */
export async function savePricing(input: PricingSettings) {
  await requireAdmin();
  const clean: PricingSettings = {
    cupsPerGuest: num(input.cupsPerGuest, 10) || DEFAULT_PRICING.cupsPerGuest,
    cupOz: num(input.cupOz, 40) || DEFAULT_PRICING.cupOz,
    ratio: num(input.ratio, 30) || DEFAULT_PRICING.ratio,
    laborRate: num(input.laborRate, 1000),
    travelPerDay: num(input.travelPerDay, 10_000),
    services: Object.fromEntries(
      SERVICE_IDS.map((sid) => {
        const v = input.services?.[sid] ?? DEFAULT_PRICING.services[sid];
        return [sid, {
          label: String(v.label ?? DEFAULT_PRICING.services[sid].label).slice(0, 60),
          pricePerGuest: num(v.pricePerGuest, 1000),
          minimum: num(v.minimum),
          serviceHours: num(v.serviceHours, 24),
          handlingHours: num(v.handlingHours, 24),
        }];
      }),
    ) as PricingSettings["services"],
    supplies: (input.supplies ?? []).slice(0, 40).map((x, i): Supply => ({
      id: String(x.id || `s${i}`).slice(0, 40),
      name: String(x.name ?? "").trim().slice(0, 120) || "Supply",
      packPrice: num(x.packPrice),
      packQty: num(x.packQty),
      unit: String(x.unit ?? "").slice(0, 20),
      use: USES.includes(x.use) ? x.use : "per_cup",
      perUse: num(x.perUse, 1000),
      estimate: Boolean(x.estimate),
    })),
  };
  const { appSetting } = schema;
  await db
    .insert(appSetting)
    .values({ key: "pricing", value: clean, updatedAt: new Date() })
    .onConflictDoUpdate({ target: appSetting.key, set: { value: clean, updatedAt: new Date() } });
  revalidatePath("/admin/pricing");
  return { ok: true as const };
}

/** "Use this price": sets an event's quote from the calculator. */
export async function applyQuote(eventId: string, priceCents: number) {
  await requireAdmin();
  const cents = Math.max(0, Math.round(Number(priceCents) || 0));
  await db.update(cateringEvent).set({ quoteCents: cents }).where(eq(cateringEvent.id, eventId));
  refresh();
  return { ok: true as const };
}

