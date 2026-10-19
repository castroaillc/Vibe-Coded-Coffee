import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { appState, error, getUser, json } from "@/lib/server/app";
import { shortId } from "@/lib/server/ids";

/** Create or update the member profile: name + mobile number (used by the kiosk). */
export async function POST(req: Request) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);

  const body = (await req.json().catch(() => ({}))) as { name?: unknown; phone?: unknown };
  const name = typeof body.name === "string" ? body.name.trim().slice(0, 60) : "";
  const phone = typeof body.phone === "string" ? body.phone.replace(/\D/g, "").slice(-10) : "";
  if (!name) return error("Please enter your first name.");
  if (phone.length !== 10) return error("Please enter a 10-digit mobile number.");

  const [taken] = await db.select({ userId: schema.member.userId }).from(schema.member).where(eq(schema.member.phone, phone));
  if (taken && taken.userId !== user.id) return error("That number is already linked to another member.", 409);

  await db.update(schema.user).set({ name }).where(eq(schema.user.id, user.id));
  const [existing] = await db.select().from(schema.member).where(eq(schema.member.userId, user.id));
  if (existing) {
    await db.update(schema.member).set({ phone }).where(eq(schema.member.userId, user.id));
  } else {
    // Retry on the (very unlikely) chance of a duplicate member code.
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await db.insert(schema.member).values({ userId: user.id, phone, memberCode: shortId(6) });
        break;
      } catch (e) {
        if (attempt === 4) throw e;
      }
    }
  }
  return json(await appState(user.id));
}
