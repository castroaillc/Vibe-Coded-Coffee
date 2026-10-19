import { and, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { appState, error, getUser, json } from "@/lib/server/app";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);
  const { id } = await params;
  await db.delete(schema.favorite).where(and(eq(schema.favorite.id, id), eq(schema.favorite.userId, user.id)));
  return json(await appState(user.id));
}
