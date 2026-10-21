import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendBookingAlert, sendBookingReceived } from "@/lib/email";
import { alertNewLead, toE164 } from "@/lib/whatsapp";
import { eventTypes } from "@/lib/site";
import { id } from "@/lib/server/ids";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

type Request_ = {
  id: string; name: string; email: string; company: string | null; phone: string | null;
  eventType: string | null; eventDate: string; headcount: number; location: string; notes: string | null;
};

/** Puts the request in the admin pipeline as a lead, reusing the client if this email booked before. */
async function addLead(r: Request_) {
  const { client, cateringEvent } = schema;
  const [existing] = await db.select({ id: client.id }).from(client).where(eq(client.email, r.email)).limit(1);
  const clientId = existing?.id ?? id();
  if (!existing) {
    await db.insert(client).values({ id: clientId, company: r.company ?? "", contactName: r.name, email: r.email, phone: r.phone ?? "" });
  }
  await db.insert(cateringEvent).values({
    id: id(),
    clientId,
    title: `${r.eventType ?? "Event"}${r.company ? ` · ${r.company}` : ""}`,
    eventType: r.eventType ?? "",
    date: r.eventDate,
    location: r.location,
    headcount: r.headcount,
    notes: r.notes ?? "",
    source: "website",
    bookingRequestId: r.id,
  });
}

/** "Book us for your event": saved to Neon, an email + WhatsApp to us, and a confirmation to the organizer. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  if (clean(body.website, 100)) return NextResponse.json({ ok: true }); // honeypot

  const name = clean(body.name, 80);
  const email = clean(body.email, 254).toLowerCase();
  const company = clean(body.company, 120) || null;
  const phone = toE164(clean(body.phone, 30));
  const eventType = (eventTypes as readonly string[]).includes(clean(body.eventType, 40)) ? clean(body.eventType, 40) : null;
  const eventDate = clean(body.eventDate, 10);
  const headcount = Number.parseInt(clean(body.headcount, 6), 10);
  const location = clean(body.location, 200);
  const notes = clean(body.notes, 2000) || null;

  if (!name) return NextResponse.json({ error: "Please add your name." }, { status: 400 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (!phone) return NextResponse.json({ error: "Please enter a phone number we can call you on." }, { status: 400 });
  if (!DATE_RE.test(eventDate) || Number.isNaN(Date.parse(eventDate)))
    return NextResponse.json({ error: "Please pick the event date." }, { status: 400 });
  if (!Number.isFinite(headcount) || headcount < 1 || headcount > 100000)
    return NextResponse.json({ error: "Please enter roughly how many people are coming." }, { status: 400 });
  if (!location) return NextResponse.json({ error: "Please tell us where the event is." }, { status: 400 });

  const request = { id: id(), name, email, company, phone, eventType, eventDate, headcount, location, notes };
  try {
    await db.insert(schema.bookingRequest).values(request);
    await addLead(request);
  } catch (err) {
    console.error("[booking] failed to store request", err);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }

  await Promise.all([
    sendBookingAlert(request).catch((e) => console.error("[booking alert email]", e)),
    sendBookingReceived(email, name, eventDate).catch((e) => console.error("[booking confirm email]", e)),
    alertNewLead(request).catch((e) => console.error("[booking whatsapp]", e)),
  ]);
  return NextResponse.json({ ok: true });
}
