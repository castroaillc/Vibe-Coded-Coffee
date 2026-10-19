import { randomBytes } from "node:crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

/** Short, unambiguous random id, e.g. "7F3K2Q". */
export function shortId(length = 6): string {
  return Array.from(randomBytes(length), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

export const id = () => shortId(16);

/** Today's date (YYYY-MM-DD) in the shop's time zone — the "one coffee per day" boundary. */
export const SHOP_TZ = "America/New_York";
export function shopDate(d = new Date()): string {
  return d.toLocaleDateString("en-CA", { timeZone: SHOP_TZ });
}
