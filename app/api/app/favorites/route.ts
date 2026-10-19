import { describe, parseOrder } from "@/lib/app-data";
import { db, schema } from "@/lib/db";
import { appState, error, getUser, json } from "@/lib/server/app";
import { id } from "@/lib/server/ids";

export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);
  const body = (await req.json().catch(() => ({}))) as { name?: unknown; order?: unknown };
  const order = parseOrder(body.order);
  if (!order) return error("That drink isn't on the menu.");
  const name = (typeof body.name === "string" && body.name.trim().slice(0, 40)) || describe(order);
  await db.insert(schema.favorite).values({ id: id(), userId: user.id, name, order });
  return json(await appState(user.id));
}
