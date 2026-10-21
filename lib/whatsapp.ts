import { site } from "@/lib/site";

/**
 * Speed to lead: when a booking request comes in, WhatsApp LEAD_ALERT_PHONE the details (Meta WhatsApp Cloud API).
 * Business-started messages must use an approved template; create it with `pnpm whatsapp:template`.
 * Off until WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID and LEAD_ALERT_PHONE are set.
 */
export const WHATSAPP_TEMPLATE = "new_lead_alert";
export const GRAPH = "https://graph.facebook.com/v25.0";

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const TO = process.env.LEAD_ALERT_PHONE;

/** US-first E.164: "(917) 555-0101" → "+19175550101". Null if it can't be a real number. */
export function toE164(input: string) {
  const digits = input.replace(/\D/g, "");
  if (input.trim().startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

// Template parameters can't hold newlines, tabs or long runs of spaces.
const param = (s: string) => ({ type: "text", text: s.replace(/\s+/g, " ").trim().slice(0, 200) || "-" });

type Lead = {
  name: string; company: string | null; phone: string | null; eventType: string | null;
  eventDate: string; headcount: number; location: string;
};

const shortDate = (ymd: string) => new Date(`${ymd}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

/** WhatsApps LEAD_ALERT_PHONE about a new lead. No-op when WhatsApp isn't configured. */
export async function alertNewLead(r: Lead) {
  if (!TOKEN || !PHONE_ID || !TO) return;
  const who = r.company ? `${r.name} (${r.company})` : r.name;
  const what = `${r.eventType ?? "Event"}, ${r.headcount} people, ${shortDate(r.eventDate)}, ${r.location}`;

  const res = await fetch(`${GRAPH}/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: TO.replace(/\D/g, ""),
      type: "template",
      template: {
        name: WHATSAPP_TEMPLATE,
        language: { code: "en_US" },
        components: [{ type: "body", parameters: [who, what, r.phone ?? "no phone", `${site.url}/admin/pipeline`].map(param) }],
      },
    }),
  });
  if (!res.ok) throw new Error(`WhatsApp: ${res.status} ${await res.text()}`);
}
