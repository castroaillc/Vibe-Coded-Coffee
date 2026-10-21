import { eq, or } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { sendWaitlistWelcome } from "@/lib/email";
import { isQrCode, normalizePhone, SCAN_COOKIE, SMS_CONSENT_TEXT } from "@/lib/marketing";
import { id } from "@/lib/server/ids";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const orNull = (v: string) => v || null;

/**
 * Marketing list sign-up (site forms and QR landing pages).
 * Takes an email, a phone, or both, plus per-channel consent and UTM attribution.
 * Saved to Neon; a welcome email goes out the first time an email address joins.
 */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (clean(body.company, 100)) return NextResponse.json({ ok: true }); // honeypot

  const email = clean(body.email, 254).toLowerCase() || null;
  const phoneInput = clean(body.phone, 40);
  const phone = phoneInput ? normalizePhone(phoneInput) : null;
  const firstName = clean(body.firstName, 60) || null;
  const source = clean(body.source, 30) || "unknown";

  if (!email && !phoneInput) return NextResponse.json({ error: "Add your email or phone number." }, { status: 400 });
  if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (phoneInput && !phone) return NextResponse.json({ error: "Please enter a valid phone number." }, { status: 400 });

  // Older forms only ask for an email and say we'll email them, so an email there counts as email consent.
  const emailConsent = Boolean(email) && (body.emailConsent === undefined ? true : body.emailConsent === true);
  const smsConsent = Boolean(phone) && body.smsConsent === true;

  const utm = (body.utm ?? {}) as Record<string, unknown>;
  const scan = (await cookies()).get(SCAN_COOKIE)?.value ?? "";
  const [scanCode, scanId] = scan.split(".");
  const now = new Date();
  const attribution = {
    utmSource: orNull(clean(utm.source, 80)),
    utmMedium: orNull(clean(utm.medium, 80)),
    utmCampaign: orNull(clean(utm.campaign, 80)),
    utmContent: orNull(clean(utm.content, 80)),
    utmTerm: orNull(clean(utm.term, 80)),
    qrCode: scanCode && isQrCode(scanCode) ? scanCode : null,
    scanId: scanCode && isQrCode(scanCode) ? orNull(clean(scanId, 40)) : null,
    landingPath: orNull(clean(body.landingPath, 200)),
    referrer: orNull(clean(body.referrer, 300)),
  };
  const evidence = {
    consentIp: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
    consentUserAgent: (req.headers.get("user-agent") ?? "").slice(0, 300) || null,
  };

  const { waitlist } = schema;
  let isNew = false;
  try {
    const matches = await db
      .select()
      .from(waitlist)
      .where(or(...[email ? eq(waitlist.email, email) : undefined, phone ? eq(waitlist.phone, phone) : undefined].filter(Boolean)));

    if (!matches.length) {
      await db.insert(waitlist).values({
        id: id(),
        email,
        phone,
        firstName,
        source,
        emailConsent,
        emailConsentAt: emailConsent ? now : null,
        smsConsent,
        smsConsentAt: smsConsent ? now : null,
        smsConsentText: smsConsent ? SMS_CONSENT_TEXT : null,
        ...attribution,
        ...evidence,
      });
      isNew = true;
    } else {
      // Same person again: fill in what's new, keep first-touch attribution, never remove consent here.
      const row = matches.find((m) => email && m.email === email) ?? matches[0];
      const other = matches.find((m) => m.id !== row.id);
      const update: Partial<typeof waitlist.$inferInsert> = { updatedAt: now };
      if (!row.firstName && firstName) update.firstName = firstName;
      if (!row.email && email && other?.email !== email) update.email = email;
      if (!row.phone && phone && other?.phone !== phone) update.phone = phone;
      if (emailConsent && (!row.emailConsent || row.emailOptOutAt)) {
        Object.assign(update, { emailConsent: true, emailConsentAt: now, emailOptOutAt: null, ...evidence });
      }
      if (smsConsent && (!row.smsConsent || row.smsOptOutAt)) {
        Object.assign(update, { smsConsent: true, smsConsentAt: now, smsConsentText: SMS_CONSENT_TEXT, smsOptOutAt: null, ...evidence });
      }
      if (!row.utmSource && !row.qrCode) Object.assign(update, attribution);
      await db.update(waitlist).set(update).where(eq(waitlist.id, row.id));
      isNew = !row.email && Boolean(update.email); // first time we have their email
    }
    if (isNew && email) await sendWaitlistWelcome(email, firstName).catch((e) => console.error("[waitlist email]", e));
  } catch (err) {
    console.error("[waitlist] failed to store sign-up", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
