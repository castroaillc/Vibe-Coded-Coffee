import { appState, error, getUser, json } from "@/lib/server/app";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getUser(req);
  if (!user) return error("Not signed in", 401);
  return json(await appState(user.id));
}
