import { and, asc, desc, eq, getTableColumns, gte, isNotNull, ne, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { calculateGroundCoffee } from "@/lib/brew";
import { CUPS_PER_GUEST, EVENT_CUP_OZ } from "./format";
import { withDefaults, type PricingSettings } from "@/lib/pricing";

const { client, cateringEvent, clientNote, product, sale } = schema;

export type EventRow = typeof cateringEvent.$inferSelect & { company: string; contactName: string };
export type ClientRow = typeof client.$inferSelect;
export type NoteRow = typeof clientNote.$inferSelect;
export type ProductRow = typeof product.$inferSelect;
export type SaleRow = typeof sale.$inferSelect;

const eventCols = getTableColumns(cateringEvent);

/** Events with their client's name, soonest first. */
export async function listEvents(): Promise<EventRow[]> {
  return db
    .select({ ...eventCols, company: client.company, contactName: client.contactName })
    .from(cateringEvent)
    .innerJoin(client, eq(client.id, cateringEvent.clientId))
    .orderBy(asc(cateringEvent.date));
}

export async function getEvent(id: string) {
  const [e] = await db
    .select({ ...eventCols, company: client.company, contactName: client.contactName })
    .from(cateringEvent)
    .innerJoin(client, eq(client.id, cateringEvent.clientId))
    .where(eq(cateringEvent.id, id));
  if (!e) return null;
  const [notes, sales] = await Promise.all([
    db.select().from(clientNote).where(eq(clientNote.eventId, id)).orderBy(desc(clientNote.createdAt)),
    db.select().from(sale).where(eq(sale.eventId, id)).orderBy(desc(sale.createdAt)),
  ]);
  return { event: e, notes, sales };
}

export async function listClients() {
  const [clients, events] = await Promise.all([
    db.select().from(client).orderBy(asc(client.company), asc(client.contactName)),
    db.select({ clientId: cateringEvent.clientId, status: cateringEvent.status, quoteCents: cateringEvent.quoteCents, date: cateringEvent.date }).from(cateringEvent),
  ]);
  return clients.map((c) => {
    const mine = events.filter((e) => e.clientId === c.id);
    const won = mine.filter((e) => e.status === "booked" || e.status === "completed");
    return {
      ...c,
      eventCount: mine.length,
      wonCents: won.reduce((s, e) => s + e.quoteCents, 0),
      lastDate: mine.map((e) => e.date).sort().at(-1) ?? "",
    };
  });
}

export async function getClient(id: string) {
  const [c] = await db.select().from(client).where(eq(client.id, id));
  if (!c) return null;
  const [events, notes] = await Promise.all([
    db.select().from(cateringEvent).where(eq(cateringEvent.clientId, id)).orderBy(desc(cateringEvent.date)),
    db.select().from(clientNote).where(eq(clientNote.clientId, id)).orderBy(desc(clientNote.createdAt)),
  ]);
  return { client: c, events, notes };
}

export const allClientsForPicker = () =>
  db.select({ id: client.id, company: client.company, contactName: client.contactName }).from(client).orderBy(asc(client.company));

// Starter menu, added the first time the POS opens. Edit it in the POS.
const DEFAULT_PRODUCTS = [
  { id: "drip-12", name: "Drip coffee · 12 oz", priceCents: 300, active: true, sort: 0 },
  { id: "drip-16", name: "Drip coffee · 16 oz", priceCents: 375, active: true, sort: 1 },
  { id: "coffee-box", name: "Coffee box (serves 10)", priceCents: 3500, active: true, sort: 2 },
];

export async function listProducts(): Promise<ProductRow[]> {
  const rows = await db.select().from(product).orderBy(asc(product.sort));
  if (rows.length) return rows;
  await db.insert(product).values(DEFAULT_PRODUCTS).onConflictDoNothing();
  return db.select().from(product).orderBy(asc(product.sort));
}

/** Sales since a moment (e.g. the start of today), newest first. */
export const salesSince = (since: Date) => db.select().from(sale).where(gte(sale.createdAt, since)).orderBy(desc(sale.createdAt));

/** Booked events from today on, for the POS event picker. */
export const upcomingBooked = (fromYmd: string) =>
  db
    .select({ id: cateringEvent.id, title: cateringEvent.title, date: cateringEvent.date })
    .from(cateringEvent)
    .where(and(gte(cateringEvent.date, fromYmd), ne(cateringEvent.status, "lost")))
    .orderBy(asc(cateringEvent.date))
    .limit(20);

/** How much ground coffee to bring for a headcount, using the brew planner's math. */
export function coffeeFor(headcount: number) {
  if (headcount <= 0) return null;
  const cups = Math.ceil(headcount * CUPS_PER_GUEST);
  const r = calculateGroundCoffee(cups, EVENT_CUP_OZ, 16);
  return { cups, lb: r.coffeeLb, bags5lb: r.bags.find((b) => b.label === "5 lb")?.bagsNeeded ?? 0 };
}

/** Midnight today in New York, as a Date. */
export function startOfShopDay(ymd: string) {
  // Find the UTC offset for New York at noon that day, then step back to midnight.
  const noon = new Date(`${ymd}T12:00:00Z`);
  const ny = new Date(noon.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const offsetMs = noon.getTime() - ny.getTime();
  return new Date(new Date(`${ymd}T00:00:00Z`).getTime() + offsetMs);
}

// ── Marketing list (waitlist + QR scans) ────────────────────
export type LeadRow = typeof schema.waitlist.$inferSelect;

export const listLeads = () => db.select().from(schema.waitlist).orderBy(desc(schema.waitlist.createdAt));

/** Scans and sign-ups per QR code, for the funnel table. */
export async function qrFunnel() {
  const [scans, leads] = await Promise.all([
    db.select({ code: schema.qrScan.code, n: sql<number>`count(*)::int` }).from(schema.qrScan).groupBy(schema.qrScan.code),
    db
      .select({ code: schema.waitlist.qrCode, n: sql<number>`count(*)::int` })
      .from(schema.waitlist)
      .where(isNotNull(schema.waitlist.qrCode))
      .groupBy(schema.waitlist.qrCode),
  ]);
  return { scans: new Map(scans.map((r) => [r.code, r.n])), leads: new Map(leads.map((r) => [r.code ?? "", r.n])) };
}

// ── Pricing (event quote calculator) ────────────────────────
export async function getPricing(): Promise<PricingSettings> {
  const [row] = await db.select().from(schema.appSetting).where(eq(schema.appSetting.key, "pricing"));
  return withDefaults(row?.value as Partial<PricingSettings> | undefined);
}
