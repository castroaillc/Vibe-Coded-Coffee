import { and, eq } from "drizzle-orm";
import { parseOrder } from "@/lib/app-data";
import { db, schema } from "@/lib/db";
import { appState, collectedToday, error, getMembership, getUser, json } from "@/lib/server/app";
import { id } from "@/lib/server/ids";

const { coffeeOrder } = schema;

/** Queue (or replace) today's drink. */
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);

  const order = parseOrder((await req.json().catch(() => ({}))).order);
  if (!order) return error("That drink isn't on the menu.");

  const membership = await getMembership(user.id);
  if (!membership.active) return error("Start your membership to order.", 402);
  if (await collectedToday(user.id)) return error("You've already had today's coffee. See you tomorrow!", 409);

  await db
    .update(coffeeOrder)
    .set({ status: "cancelled" })
    .where(and(eq(coffeeOrder.userId, user.id), eq(coffeeOrder.status, "queued")));
  await db.insert(coffeeOrder).values({ id: id(), userId: user.id, order, status: "queued" });
  return json(await appState(user.id));
}

/** Cancel the queued drink. */
export async function DELETE(req: Request) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);
  await db
    .update(coffeeOrder)
    .set({ status: "cancelled" })
    .where(and(eq(coffeeOrder.userId, user.id), eq(coffeeOrder.status, "queued")));
  return json(await appState(user.id));
}
