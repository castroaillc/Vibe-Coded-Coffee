import { site } from "@/lib/site";

// ─────────────────────────────────────────────────────────────
//  Printed QR codes. Each code is a short link, /q/<code>, that
//  logs the scan and forwards to a landing page with UTM tags.
//  To add a new sign, flyer or sticker: add a line here and point
//  its QR at `${site.url}/q/<code>`. Changing `to` later re-routes
//  every printed copy without reprinting.
// ─────────────────────────────────────────────────────────────
export const qrCodes = {
  coffee: { to: "/free", label: "A4 acrylic sign: Free coffee", utm: { source: "acrylic_sign", medium: "qr", campaign: "free_coffee" } },
  cup: { to: "/free", label: "Cup sticker", utm: { source: "cup_sticker", medium: "qr", campaign: "free_coffee" } },
} as const satisfies Record<string, { to: string; label: string; utm: { source: string; medium: string; campaign: string } }>;

export type QrCode = keyof typeof qrCodes;
export const isQrCode = (c: string): c is QrCode => Object.hasOwn(qrCodes, c);
export const qrUrl = (code: QrCode) => `${site.url}/q/${code}`;

/** Cookie set by /q/<code> so a later sign-up is tied to the scan. */
export const SCAN_COOKIE = "vcc_scan";

// ─────────────────────────────────────────────────────────────
//  Consent wording. What people see is what gets stored with
//  their sign-up, so edit it here only. US texting law (TCPA)
//  requires an unchecked box, this disclosure, and proof of it.
// ─────────────────────────────────────────────────────────────
export const EMAIL_CONSENT_TEXT = `Email me about free coffee, events and offers from ${site.name}. Unsubscribe anytime.`;

export const SMS_CONSENT_TEXT =
  `Text me offers and event updates from ${site.name}. By checking this box, I agree to receive recurring automated marketing ` +
  `text messages at the number provided. Consent is not a condition of any purchase or of getting free coffee. ` +
  `Msg frequency varies. Msg & data rates may apply. Reply STOP to unsubscribe, HELP for help.`;

/** US-first phone normalizer → E.164 ("+19175550101"), or null if it doesn't look like a phone number. */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  if (raw.startsWith("+")) return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

/** "+19175550101" → "(917) 555-0101" for display. */
export function formatPhone(e164: string | null | undefined) {
  if (!e164) return "";
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}
