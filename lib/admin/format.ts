// Safe in the browser (the POS uses it), so nothing here imports server code.
const SHOP_TZ = "America/New_York";

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

/** Whole dollars for tiles: $1,250 */
export const moneyShort = (cents: number) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/** "$12.50" typed by a person → 1250 cents */
export const toCents = (s: string) => Math.max(0, Math.round((Number(s.replace(/[$,\s]/g, "")) || 0) * 100));
export const fromCents = (cents: number) => (cents ? (cents / 100).toFixed(2) : "");

/** Today as YYYY-MM-DD in the shop's time zone. */
export const today = () => new Date().toLocaleDateString("en-CA", { timeZone: SHOP_TZ });

export const formatDate = (ymd: string) =>
  ymd
    ? new Date(`${ymd}T12:00:00`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "No date";

export const formatHm = (hm: string) =>
  hm ? new Date(`2000-01-01T${hm}:00`).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "";

export const formatStamp = (d: Date) =>
  d.toLocaleString("en-US", { timeZone: SHOP_TZ, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export const formatClock = (d: Date) =>
  d.toLocaleTimeString("en-US", { timeZone: SHOP_TZ, hour: "numeric", minute: "2-digit" });

/** Days from today to a YYYY-MM-DD date (negative = past). */
export const daysUntil = (ymd: string) =>
  Math.round((new Date(`${ymd}T12:00:00`).getTime() - new Date(`${today()}T12:00:00`).getTime()) / 86_400_000);

export const STATUS_LABELS = { lead: "Lead", quoted: "Quoted", booked: "Booked", completed: "Completed", lost: "Lost" } as const;
export const PAYMENT_LABELS = { unpaid: "Unpaid", deposit: "Deposit", paid: "Paid" } as const;
export const METHOD_LABELS = { card: "Card", cash: "Cash", comp: "Comp" } as const;

/** Rule of thumb for planning: cups per guest and cup size at catering events. */
export const CUPS_PER_GUEST = 1.5;
export const EVENT_CUP_OZ = 12;
