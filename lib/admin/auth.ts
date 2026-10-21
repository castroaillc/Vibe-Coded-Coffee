import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/** One shared password for /admin, set as ADMIN_PASSWORD. */
export const ADMIN_COOKIE = "coffee_os_admin";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

const same = (a: string, b: string) => {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

/** Cookie value: an HMAC of the password, so changing ADMIN_PASSWORD signs everyone out. */
export function adminToken() {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD isn't set.");
  return createHmac("sha256", `${process.env.BETTER_AUTH_SECRET ?? ""}:${password}`).update("coffee-os-admin").digest("hex");
}

export const isAdminPassword = (input: string) => Boolean(process.env.ADMIN_PASSWORD) && same(input, process.env.ADMIN_PASSWORD!);

/** Redirects to the admin sign-in page unless the admin cookie is valid. Call at the top of every admin page and action. */
export async function requireAdmin() {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token || !process.env.ADMIN_PASSWORD || !same(token, adminToken())) redirect("/admin/sign-in");
}
