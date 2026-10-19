import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { appState, error, getUser, json } from "@/lib/server/app";

/** Toggle the member's RSVP for an event. */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);
  const { id: eventId } = await params;

  const [ev] = await db.select({ id: schema.event.id }).from(schema.event).where(eq(schema.event.id, eventId));
  if (!ev) return error("Event not found", 404);

  const where = and(eq(schema.rsvp.userId, user.id), eq(schema.rsvp.eventId, eventId));
  const [existing] = await db.select().from(schema.rsvp).where(where);
  if (existing) {
    if (existing.checkedInAt) return error("You've already checked in to this event.", 409);
    await db.delete(schema.rsvp).where(where);
  } else {
    await db.insert(schema.rsvp).values({ userId: user.id, eventId });
  }
  return json(await appState(user.id));
}
