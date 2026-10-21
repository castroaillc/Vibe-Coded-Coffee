import { Resend } from "resend";
import { site } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? `${site.name} <hello@vibecodedcoffee.com>`;

async function send(to: string, subject: string, html: string, text: string, replyTo?: string) {
  if (!resend) {
    // Local development without a Resend key: print the email instead of sending it.
    console.info(`\n[email] to=${to}\nsubject=${subject}\n${text}\n`);
    return;
  }
  const { error } = await resend.emails.send({ from: FROM, to, subject, html, text, ...(replyTo && { replyTo }) });
  if (error) throw new Error(`Resend: ${error.message}`);
}

const layout = (body: string) => `<!doctype html><html><body style="margin:0;background:#F8F6F2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#0A1F33">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border-radius:16px;padding:32px">
<tr><td>
<p style="margin:0 0 24px;font-weight:600;font-size:18px">vibe coded <span style="font-weight:400;color:#4F6077">coffee</span></p>
${body}
<p style="margin:32px 0 0;font-size:12px;color:#6B7C93">${site.name} · ${site.locationLabel}</p>
</td></tr></table></td></tr></table></body></html>`;

export async function sendSignInCode(email: string, otp: string) {
  await send(
    email,
    `${otp} is your Vibe Coded sign-in code`,
    layout(`<p style="margin:0 0 8px;font-size:16px">Your sign-in code:</p>
<p style="margin:0 0 16px;font-family:Menlo,Consolas,monospace;font-size:34px;letter-spacing:8px;font-weight:600">${otp}</p>
<p style="margin:0;font-size:14px;color:#4F6077">It expires in 10 minutes. If you didn't ask for it, you can ignore this email.</p>`),
    `Your Vibe Coded sign-in code is ${otp}. It expires in 10 minutes.`,
  );
}

export async function sendWaitlistWelcome(email: string, firstName?: string | null) {
  const hi = firstName ? `Hi ${firstName},` : "Hi,";
  await send(
    email,
    "You're on the Vibe Coded waitlist",
    layout(`<p style="margin:0 0 12px;font-size:16px">${hi}</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.5">You're on the list. Your first month of the Vibe Coded membership is free when we open in ${site.locationLabel}.</p>
<p style="margin:0;font-size:16px;line-height:1.5">We'll email you the opening date and your invite.</p>`),
    `${hi}\n\nYou're on the list. Your first month of the Vibe Coded membership is free when we open in ${site.locationLabel}. We'll email you the opening date and your invite.`,
  );
}

export async function sendMembershipStarted(email: string, trialEnd?: Date | null) {
  const until = trialEnd ? ` Your free month runs until ${trialEnd.toLocaleDateString("en-US", { month: "long", day: "numeric" })}.` : "";
  await send(
    email,
    "Your Vibe Coded membership is active",
    layout(`<p style="margin:0 0 12px;font-size:16px;line-height:1.5">Welcome in. Your membership is active.${until}</p>
<p style="margin:0;font-size:16px;line-height:1.5">Open the app, queue your drink, and scan your pass at the kiosk.</p>
<p style="margin:20px 0 0"><a href="${site.url}/order" style="display:inline-block;background:#3B82F6;color:#fff;text-decoration:none;font-weight:600;padding:12px 20px;border-radius:10px">Open the app</a></p>`),
    `Welcome in. Your membership is active.${until}\nOpen the app: ${site.url}/order`,
  );
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
const longDate = (ymd: string) =>
  new Date(`${ymd}T12:00:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

type BookingRequest = {
  id: string; name: string; email: string; company: string | null; phone: string | null; eventType: string | null;
  eventDate: string; headcount: number; location: string; notes: string | null;
};

/** To us: a new "Book us for your event" request. Goes to BOOKING_NOTIFY_EMAIL, or the site email. */
export async function sendBookingAlert(r: BookingRequest) {
  const to = process.env.BOOKING_NOTIFY_EMAIL || site.email;
  const rows: [string, string | number | null][] = [
    ["Name", r.name], ["Email", r.email], ["Company", r.company], ["Phone", r.phone],
    ["Event", r.eventType], ["Date", longDate(r.eventDate)], ["Headcount", r.headcount],
    ["Location", r.location], ["Notes", r.notes],
  ];
  const filled = rows.filter(([, v]) => v !== null && v !== "");
  await send(
    to,
    `New booking request: ${r.company ?? r.name}, ${r.headcount} people, ${r.eventDate}`,
    layout(`<p style="margin:0 0 16px;font-size:16px;font-weight:600">New booking request</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.5">
${filled.map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#6B7C93;vertical-align:top">${k}</td><td style="padding:4px 0">${esc(String(v))}</td></tr>`).join("\n")}
</table>
<p style="margin:16px 0 0;font-size:13px;color:#6B7C93">Reply to this email to answer ${esc(r.name)} directly. Request id ${r.id}.</p>`),
    filled.map(([k, v]) => `${k}: ${v}`).join("\n"),
    r.email,
  );
}

/** To the organizer: we got your request. */
export async function sendBookingReceived(email: string, name: string, eventDate: string) {
  const first = name.split(/\s+/)[0];
  await send(
    email,
    "We got your Vibe Coded Coffee booking request",
    layout(`<p style="margin:0 0 12px;font-size:16px">Hi ${esc(first)},</p>
<p style="margin:0 0 12px;font-size:16px;line-height:1.5">Thanks for thinking of us for your event on ${longDate(eventDate)}. We'll get back to you within one business day with a quote.</p>
<p style="margin:0;font-size:16px;line-height:1.5">Anything to add? Just reply to this email.</p>`),
    `Hi ${first},\n\nThanks for thinking of us for your event on ${longDate(eventDate)}. We'll get back to you within one business day with a quote.\n\nAnything to add? Just reply to this email.`,
  );
}
