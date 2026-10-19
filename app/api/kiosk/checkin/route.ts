import { and, eq } from "drizzle-orm";
import { points as rules } from "@/lib/app-data";
import { db, schema } from "@/lib/db";
import { error, findMember, isKiosk, json, pointsBalance } from "@/lib/server/app";
import { id } from "@/lib/server/ids";
import { verifyPass } from "@/lib/server/pass";

/** Event check-in at the door: { pass | phone, eventId }. Adds event points once per event. */
export async function POST(req: Request) {
  if (!isKiosk(req)) return error("Unauthorized", 401);
  const body = (await req.json().catch(() => ({}))) as { pass?: string; phone?: string; eventId?: string };
  if (!body.eventId) return error("eventId is required.");

  const memberCode = body.pass ? verifyPass(body.pass) : null;
  if (body.pass && !memberCode) return error("This pass isn't valid today.", 404);
  const m = await findMember({ memberCode, phone: body.pass ? null : body.phone });
  if (!m) return error("No member found.", 404);

  const [ev] = await db.select().from(schema.event).where(eq(schema.event.id, body.eventId));
  if (!ev) return error("Event not found.", 404);

  const where = and(eq(schema.rsvp.userId, m.userId), eq(schema.rsvp.eventId, ev.id));
  const [existing] = await db.select().from(schema.rsvp).where(where);
  if (existing?.checkedInAt) return error("Already checked in.", 409);
  if (existing) await db.update(schema.rsvp).set({ checkedInAt: new Date() }).where(where);
  else await db.insert(schema.rsvp).values({ userId: m.userId, eventId: ev.id, checkedInAt: new Date() });

  await db
    .insert(schema.pointsLedger)
    .values({ id: id(), userId: m.userId, delta: rules.perEvent, reason: "event", refId: `${ev.id}:${m.userId}`, note: `Event: ${ev.title}` })
    .onConflictDoNothing();

  return json({ ok: true, pointsAdded: rules.perEvent, points: await pointsBalance(m.userId) });
}
