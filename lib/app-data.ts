// ─────────────────────────────────────────────────────────────
//  Ordering app options, points rules and events.
//  Drinks come from the website menu (lib/menu.ts) so the two
//  never drift apart. Edit options and rules here.
// ─────────────────────────────────────────────────────────────
import { menu } from "./menu";

export type Option = { id: string; label: string; detail?: string };

export const drinks = menu
  .filter((s) => s.id !== "pastries")
  .flatMap((s) => s.items.map((i) => ({ id: i.verb.toLowerCase(), verb: i.verb, name: i.name, category: s.id })));

export type Drink = (typeof drinks)[number];

export const sizes: Option[] = [
  { id: "s", label: "Small", detail: "8 oz" },
  { id: "m", label: "Medium", detail: "12 oz" },
  { id: "l", label: "Large", detail: "16 oz" },
];

/** Beans only apply to coffee drinks. */
export const beans: Option[] = [
  { id: "main", label: "main", detail: "House blend · chocolatey, balanced" },
  { id: "feature", label: "feature/ethiopia", detail: "Single origin · bright, floral" },
  { id: "decaf", label: "--dry-run", detail: "Decaf · all flavor, no caffeine" },
];

export const milks: Option[] = [
  { id: "none", label: "No milk" },
  { id: "whole", label: "Whole" },
  { id: "oat", label: "Oat" },
  { id: "almond", label: "Almond" },
  { id: "skim", label: "Skim" },
];

export const addons: Option[] = [
  { id: "shot", label: "Extra shot" },
  { id: "vanilla", label: "Vanilla" },
  { id: "caramel", label: "Caramel" },
  { id: "cinnamon", label: "Cinnamon" },
  { id: "foam", label: "Cold foam" },
  { id: "iced", label: "Iced" },
];

/** Drinks that are served without milk by default. */
const blackByDefault = new Set(["brewing", "compiling", "deploying", "steeping", "hydrating"]);

export type Order = { drink: string; size: string; bean: string; milk: string; addons: string[] };

export function defaultOrder(drinkId = "rejoicing"): Order {
  return { drink: drinkId, size: "m", bean: "main", milk: blackByDefault.has(drinkId) ? "none" : "oat", addons: [] };
}

export const findDrink = (id: string) => drinks.find((d) => d.id === id) ?? drinks[0];
const label = (list: Option[], id: string) => list.find((o) => o.id === id)?.label ?? id;

/** "Rejoicing… · Medium · Oat · Vanilla" */
export function describe(o: Order): string {
  const d = findDrink(o.drink);
  const parts = [`${d.verb}…`, label(sizes, o.size)];
  if (d.category === "coffee") parts.push(label(beans, o.bean));
  if (o.milk !== "none") parts.push(label(milks, o.milk));
  o.addons.forEach((a) => parts.push(label(addons, a)));
  return parts.join(" · ");
}

/** Short code printed in the QR so the kiosk can make the drink, e.g. "REJ-M-MAIN-OAT-VANILLA". */
export function orderCode(o: Order): string {
  return [o.drink.slice(0, 3), o.size, o.bean, o.milk, ...o.addons].join("-").toUpperCase();
}

// ── Points ────────────────────────────────────────────────────
export const points = {
  perCoffee: 10, // each daily coffee collected
  perEvent: 15, // each event check-in
  rewardAt: 100, // points needed for a reward
  reward: "a free pastry",
};

// ── Events (SAMPLE — replace with your real calendar) ────────
export type CoffeeEvent = {
  id: string;
  title: string;
  verb: string;
  weekday: number; // 0 = Sunday
  start: string; // "18:30", shop local time
  minutes: number;
  time: string;
  body: string;
  spots: number;
};

export const events: CoffeeEvent[] = [
  { id: "demo-night", title: "Demo Night", verb: "Shipping", weekday: 4, start: "18:30", minutes: 120, time: "6:30 – 8:30 PM", body: "Five builders, five minutes each. Show what you made this month; get real feedback.", spots: 40 },
  { id: "build-session", title: "Saturday Build Session", verb: "Compiling", weekday: 6, start: "09:00", minutes: 180, time: "9:00 AM – 12:00 PM", body: "Three hours of heads-down work with other builders. Bottomless batch brew for members.", spots: 30 },
  { id: "latte-art", title: "Latte Art: </> and { }", verb: "Pouring", weekday: 3, start: "19:00", minutes: 60, time: "7:00 – 8:00 PM", body: "Our baristas teach the house rosetta, then the code-shaped designs. Milk and cups on us.", spots: 12 },
  { id: "founder-chat", title: "Founder Coffee Chat", verb: "Pondering", weekday: 2, start: "08:00", minutes: 60, time: "8:00 – 9:00 AM", body: "Small-group morning chat with a local founder. Bring questions, leave with a plan.", spots: 15 },
];

/** Next date (from today) that falls on the event's weekday. */
export function nextDate(weekday: number, from = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  d.setDate(d.getDate() + ((weekday - d.getDay() + 7) % 7));
  return d;
}

/** Server-side check that an order only uses known options. */
export function parseOrder(input: unknown): Order | null {
  if (!input || typeof input !== "object") return null;
  const o = input as Record<string, unknown>;
  const has = (list: Option[], v: unknown) => typeof v === "string" && list.some((x) => x.id === v);
  if (typeof o.drink !== "string" || !drinks.some((d) => d.id === o.drink)) return null;
  if (!has(sizes, o.size) || !has(beans, o.bean) || !has(milks, o.milk)) return null;
  if (!Array.isArray(o.addons) || o.addons.length > addons.length || !o.addons.every((a) => has(addons, a))) return null;
  return { drink: o.drink, size: o.size as string, bean: o.bean as string, milk: o.milk as string, addons: [...new Set(o.addons as string[])] };
}
