import { NextResponse } from "next/server";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { points as rules } from "@/lib/app-data";
import { passPayload } from "./pass";
import { shopDate } from "./ids";

const { member, subscription, favorite, coffeeOrder, pointsLedger, event, rsvp, user } = schema;

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const error = (message: string, status = 400) => NextResponse.json({ error: message }, { status });

/** The signed-in user for an API request, or null. */
export async function getUser(req: Request) {
  const s = await auth.api.getSession({ headers: req.headers });
  return s?.user ?? null;
}

export async function getMembership(userId: string) {
  const rows = await db
    .select()
    .from(subscription)
    .where(eq(subscription.referenceId, userId))
    .orderBy(desc(subscription.periodEnd));
  const live = rows.find((r) => r.status === "active" || r.status === "trialing");
  const latest = live ?? rows[0];
  return {
    active: Boolean(live),
    status: latest?.status ?? null,
    trialEnd: latest?.trialEnd ?? null,
    periodEnd: latest?.periodEnd ?? null,
    cancelAtPeriodEnd: latest?.cancelAtPeriodEnd ?? false,
  };
}

export async function pointsBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${pointsLedger.delta}), 0)::int` })
    .from(pointsLedger)
    .where(eq(pointsLedger.userId, userId));
  return row?.total ?? 0;
}

export async function collectedToday(userId: string): Promise<boolean> {
  const rows = await db
    .select({ id: coffeeOrder.id })
    .from(coffeeOrder)
    .where(and(eq(coffeeOrder.userId, userId), eq(coffeeOrder.status, "collected"), eq(coffeeOrder.collectedOn, shopDate())))
    .limit(1);
  return rows.length > 0;
}

export async function queuedOrder(userId: string) {
  const [row] = await db
    .select()
    .from(coffeeOrder)
    .where(and(eq(coffeeOrder.userId, userId), eq(coffeeOrder.status, "queued")))
    .limit(1);
  return row ?? null;
}

/** Everything the app needs on screen, in one request. */
export async function appState(userId: string) {
  const [[u], [m], membership, favs, queued, pts, today, history, upcoming, myRsvps] = await Promise.all([
    db.select({ name: user.name, email: user.email }).from(user).where(eq(user.id, userId)),
    db.select().from(member).where(eq(member.userId, userId)),
    getMembership(userId),
    db.select().from(favorite).where(eq(favorite.userId, userId)).orderBy(desc(favorite.createdAt)),
    queuedOrder(userId),
    pointsBalance(userId),
    collectedToday(userId),
    db.select().from(pointsLedger).where(eq(pointsLedger.userId, userId)).orderBy(desc(pointsLedger.createdAt)).limit(10),
    db.select().from(event).where(gt(event.endsAt, new Date())).orderBy(event.startsAt).limit(20),
    db.select().from(rsvp).where(eq(rsvp.userId, userId)),
  ]);

  const rsvpByEvent = new Map(myRsvps.map((r) => [r.eventId, r]));
  return {
    user: u ?? null,
    member: m ? { phone: m.phone, memberCode: m.memberCode } : null,
    pass: m ? passPayload(m.memberCode) : null,
    membership,
    favorites: favs.map((f) => ({ id: f.id, name: f.name, order: f.order })),
    queued: queued ? { id: queued.id, order: queued.order } : null,
    collectedToday: today,
    points: pts,
    rules,
    history: history.map((h) => ({
      id: h.id,
      label: h.note ?? (h.reason === "coffee" ? "Coffee" : h.reason === "event" ? "Event" : h.reason),
      pts: h.delta,
      date: h.createdAt.toISOString(),
    })),
    events: upcoming.map((e) => ({
      id: e.id,
      title: e.title,
      verb: e.verb,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      body: e.body,
      spots: e.spots,
      going: rsvpByEvent.has(e.id),
      checkedIn: Boolean(rsvpByEvent.get(e.id)?.checkedInAt),
    })),
  };
}

export type AppStateResponse = Awaited<ReturnType<typeof appState>>;

/** Kiosk: find a member by the daily pass code or by phone number. */
export async function findMember(by: { memberCode?: string | null; phone?: string | null }) {
  if (by.memberCode) {
    const [m] = await db.select().from(member).where(eq(member.memberCode, by.memberCode));
    return m ?? null;
  }
  const digits = (by.phone ?? "").replace(/\D/g, "").slice(-10);
  if (digits.length < 10) return null;
  const [m] = await db.select().from(member).where(eq(member.phone, digits));
  return m ?? null;
}

/** Kiosk requests carry `Authorization: Bearer <KIOSK_API_KEY>`. */
export function isKiosk(req: Request): boolean {
  const key = process.env.KIOSK_API_KEY;
  const header = req.headers.get("authorization") ?? "";
  if (!key || !header.startsWith("Bearer ")) return false;
  const given = header.slice(7);
  if (given.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) diff |= key.charCodeAt(i) ^ given.charCodeAt(i);
  return diff === 0;
}

