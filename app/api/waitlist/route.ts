import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { sendWaitlistWelcome } from "@/lib/email";
import { id } from "@/lib/server/ids";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Pre-launch waitlist: saved to Neon, welcome email via Resend. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (clean(body.company, 100)) return NextResponse.json({ ok: true }); // honeypot

  const email = clean(body.email, 254).toLowerCase();
  const firstName = clean(body.firstName, 60) || null;
  const source = clean(body.source, 30) || "unknown";
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  try {
    const inserted = await db
      .insert(schema.waitlist)
      .values({ id: id(), email, firstName, source })
      .onConflictDoNothing({ target: schema.waitlist.email })
      .returning({ id: schema.waitlist.id });
    // Only email people the first time they join.
    if (inserted.length) await sendWaitlistWelcome(email, firstName).catch((e) => console.error("[waitlist email]", e));
  } catch (err) {
    console.error("[waitlist] failed to store sign-up", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
