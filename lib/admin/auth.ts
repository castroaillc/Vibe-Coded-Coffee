import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

/** Comma-separated list of emails allowed into /admin, e.g. ADMIN_EMAILS=steve@vibecodedcoffee.com */
const adminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);

export const isAdminEmail = (email: string) => adminEmails().includes(email.toLowerCase());

/** The signed-in admin, or a redirect to the admin sign-in page. Call at the top of every admin page and action. */
export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/admin/sign-in");
  if (!isAdminEmail(session.user.email)) redirect("/admin/sign-in?denied=1");
  return session.user;
}
