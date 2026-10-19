import { createHmac, timingSafeEqual } from "node:crypto";
import { shopDate } from "./ids";

// The QR on a member's pass: VCC2.<memberCode>.<YYYYMMDD>.<signature>
// The signature is an HMAC of the code and today's date, so the pass changes every day
// and a screenshot of someone else's pass stops working tomorrow.

const secret = () => {
  const s = process.env.PASS_SIGNING_SECRET;
  if (!s) throw new Error("PASS_SIGNING_SECRET is not set");
  return s;
};

const sign = (memberCode: string, day: string) =>
  createHmac("sha256", secret()).update(`${memberCode}.${day}`).digest("base64url").slice(0, 12);

export function passPayload(memberCode: string, date = new Date()): string {
  const day = shopDate(date).replaceAll("-", "");
  return `VCC2.${memberCode}.${day}.${sign(memberCode, day)}`;
}

/** Returns the member code when the payload is genuine and issued today, otherwise null. */
export function verifyPass(payload: string): string | null {
  const parts = payload.trim().split(".");
  if (parts.length !== 4 || parts[0] !== "VCC2") return null;
  const [, code, day, sig] = parts;
  if (day !== shopDate().replaceAll("-", "")) return null;
  const expected = Buffer.from(sign(code, day));
  const given = Buffer.from(sig);
  return expected.length === given.length && timingSafeEqual(expected, given) ? code : null;
}
