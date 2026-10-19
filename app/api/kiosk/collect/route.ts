import { and, eq } from "drizzle-orm";
import { describe, parseOrder, points as rules } from "@/lib/app-data";
import { db, schema } from "@/lib/db";
import { collectedToday, error, findMember, getMembership, isKiosk, json, pointsBalance } from "@/lib/server/app";
import { id, shopDate } from "@/lib/server/ids";

const { coffeeOrder, pointsLedger } = schema;

/**
 * Kiosk step 2: the barista hands over the drink.
 * Body: { memberCode, orderId } for a queued order, or { memberCode, order } for a drink made from a favorite.
 * Marks it collected (one per member per day) and adds points.
 */
export async function POST(req: Request) {
  if (!isKiosk(req)) return error("Unauthorized", 401);
  const body = (await req.json().catch(() => ({}))) as { memberCode?: string; orderId?: string; order?: unknown };

  const m = await findMember({ memberCode: body.memberCode ?? null });
  if (!m) return error("No member found.", 404);
  if (!(await getMembership(m.userId)).active) return error("Membership isn't active.", 402);
  if (await collectedToday(m.userId)) return error("Today's coffee was already collected.", 409);

  const now = new Date();
  let orderId = body.orderId ?? null;
  let note: string;

  if (orderId) {
    const updated = await db
      .update(coffeeOrder)
      .set({ status: "collected", collectedAt: now, collectedOn: shopDate(now) })
      .where(and(eq(coffeeOrder.id, orderId), eq(coffeeOrder.userId, m.userId), eq(coffeeOrder.status, "queued")))
      .returning({ order: coffeeOrder.order });
    if (!updated.length) return error("That order isn't waiting to be collected.", 409);
    note = describe(updated[0].order);
  } else {
    const order = parseOrder(body.order);
    if (!order) return error("Send orderId or a valid order.");
    orderId = id();
    await db.insert(coffeeOrder).values({ id: orderId, userId: m.userId, order, status: "collected", collectedAt: now, collectedOn: shopDate(now) });
    note = describe(order);
  }

  await db
    .insert(pointsLedger)
    .values({ id: id(), userId: m.userId, delta: rules.perCoffee, reason: "coffee", refId: orderId, note: `Coffee: ${note}` })
    .onConflictDoNothing();

  return json({ ok: true, orderId, pointsAdded: rules.perCoffee, points: await pointsBalance(m.userId) });
}
