import { desc, eq } from "drizzle-orm";
import { describe, orderCode } from "@/lib/app-data";
import { db, schema } from "@/lib/db";
import { collectedToday, error, findMember, getMembership, isKiosk, json, pointsBalance, queuedOrder } from "@/lib/server/app";
import { verifyPass } from "@/lib/server/pass";

/**
 * Kiosk step 1: look a member up by the QR on their pass ({ pass }) or their phone number ({ phone }).
 * Returns who they are and which drink to make. Nothing is changed until /api/kiosk/collect.
 */
export async function POST(req: Request) {
  if (!isKiosk(req)) return error("Unauthorized", 401);
  const body = (await req.json().catch(() => ({}))) as { pass?: string; phone?: string };

  let memberCode: string | null = null;
  if (body.pass) {
    memberCode = verifyPass(body.pass);
    if (!memberCode) return error("This pass isn't valid today. Ask the member to open their app.", 404);
  }
  const m = await findMember({ memberCode, phone: body.pass ? null : body.phone });
  if (!m) return error("No member found.", 404);

  const [[u], membership, done, queued, points, [topFav]] = await Promise.all([
    db.select({ name: schema.user.name }).from(schema.user).where(eq(schema.user.id, m.userId)),
    getMembership(m.userId),
    collectedToday(m.userId),
    queuedOrder(m.userId),
    pointsBalance(m.userId),
    db.select().from(schema.favorite).where(eq(schema.favorite.userId, m.userId)).orderBy(desc(schema.favorite.createdAt)).limit(1),
  ]);

  const order = queued?.order ?? topFav?.order ?? null;
  const blocked = !membership.active ? "Membership isn't active." : done ? "Today's coffee was already collected." : !order ? "No drink queued and no favorites saved." : null;

  return json({
    member: { name: u?.name ?? "Member", memberCode: m.memberCode, phoneLast4: m.phone.slice(-4), points },
    canCollect: !blocked,
    reason: blocked,
    source: queued ? "queued" : topFav ? "favorite" : null,
    orderId: queued?.id ?? null,
    order: order ? { ...order, description: describe(order), code: orderCode(order) } : null,
  });
}
