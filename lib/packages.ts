// ─────────────────────────────────────────────────────────────
//  Public catering prices. The pricing section, the instant-price
//  calculator, the FAQ, the JSON-LD and /llms.txt all read from here,
//  so change a number once and the whole site updates.
//
//  Positioning: published, all-in prices that sit below the typical
//  NYC espresso-cart starting price (~$699 in Oct 2026).
//  Every price includes the on-site station, staffing, coffee, cups,
//  creamer, sugar, setup, cleanup and travel within the five boroughs.
// ─────────────────────────────────────────────────────────────

export type Package = {
  id: "meetup" | "team" | "event";
  name: string;
  price: number; // $ flat
  maxGuests: number;
  hours: number; // service hours included
  bestFor: string;
  featured?: boolean;
};

export const packages: Package[] = [
  { id: "meetup", name: "Meetup", price: 450, maxGuests: 25, hours: 2, bestFor: "Meetups, workshops, small team mornings" },
  { id: "team", name: "Team", price: 650, maxGuests: 50, hours: 3, bestFor: "All-hands, demo nights, launch parties", featured: true },
  { id: "event", name: "Event", price: 1050, maxGuests: 100, hours: 4, bestFor: "Conferences, demo days, big offsites" },
];

/** Over 100 guests: per guest, 4 hours included. */
export const largeEvent = { perGuest: 10.5, hours: 4 };

/** All-day service (up to 10 hours), priced per guest per day. Built for hackathons. */
export const allDay = { perGuestPerDay: 12, minimumPerDay: 900, hours: 10, maxDays: 3 };

/** Extra service hours beyond what a package includes. */
export const extraHour = { upTo50: 100, over50: 150 };

/** The reference point we price against (typical NYC espresso-cart starting price). */
export const marketStartingPrice = 699;

export const startingPrice = Math.min(...packages.map((p) => p.price));

export const pricingPromises = [
  "Price shown up front: no quote call needed",
  "Pay for your headcount, not the next package up",
  "Unlimited drip coffee during your service window",
  "No travel fees anywhere in the five boroughs",
  "Staff, cups, creamer, sugar, setup and cleanup included",
] as const;

export type QuoteRequest = { guests: number; hours: number; allDayDays?: number };

export type InstantQuote = {
  price: number;
  perGuest: number;
  label: string; // which package / rate applied
  hours: number;
  days: number;
  includedHours: number;
  extraHours: number;
  custom: boolean; // very large events we confirm by hand
  cheaperAllDay?: number; // set when all-day service would cost less than this many hours
};

const round = (n: number) => Math.round(n);

/** Instant price for a headcount and service length. Pure, safe in the browser. */
export function instantQuote({ guests, hours, allDayDays }: QuoteRequest): InstantQuote | null {
  const g = Math.floor(guests);
  if (!Number.isFinite(g) || g < 1) return null;
  const custom = g > 500;

  if (allDayDays && allDayDays > 0) {
    const days = Math.min(Math.max(1, Math.floor(allDayDays)), allDay.maxDays);
    const perDay = Math.max(allDay.minimumPerDay, round(allDay.perGuestPerDay * g));
    const price = perDay * days;
    return {
      price,
      perGuest: price / (g * days),
      label: `All-day (up to ${allDay.hours} hrs/day)`,
      hours: allDay.hours,
      days,
      includedHours: allDay.hours,
      extraHours: 0,
      custom,
    };
  }

  const h = Math.max(1, Math.floor(hours || 1));
  const i = packages.findIndex((p) => g <= p.maxGuests);
  const pkg = i >= 0 ? packages[i] : undefined;
  const prev = i > 0 ? packages[i - 1] : undefined;
  // Between sizes you pay for your headcount, not the next package up:
  // the price rises evenly from the smaller package to this one.
  const base = !pkg
    ? round(largeEvent.perGuest * g)
    : prev
      ? round(prev.price + ((pkg.price - prev.price) * (g - prev.maxGuests)) / (pkg.maxGuests - prev.maxGuests))
      : pkg.price;
  const includedHours = pkg ? pkg.hours : largeEvent.hours;
  const extraHours = Math.max(0, h - includedHours);
  const rate = g <= 50 ? extraHour.upTo50 : extraHour.over50;
  const price = base + extraHours * rate;
  const allDayPrice = Math.max(allDay.minimumPerDay, round(allDay.perGuestPerDay * g));
  return {
    cheaperAllDay: h <= allDay.hours && allDayPrice < price ? allDayPrice : undefined,
    price,
    perGuest: price / g,
    label: pkg ? `${pkg.name} package` : `${usd(largeEvent.perGuest, true)} per guest (100+ guests)`,
    hours: Math.max(h, includedHours),
    days: 1,
    includedHours,
    extraHours,
    custom,
  };
}

export const usd = (n: number, cents = false) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

/** One-line summary used in the FAQ, JSON-LD and llms.txt. */
export const pricingSummary = `${packages
  .map((p) => `${p.name} ${usd(p.price)} (up to ${p.maxGuests} guests, ${p.hours} hrs)`)
  .join("; ")}; headcounts between sizes are priced in proportion, not rounded up to the next package; over 100 guests ${usd(largeEvent.perGuest, true)} per guest (${largeEvent.hours} hrs); all-day hackathon service ${usd(allDay.perGuestPerDay)} per guest per day (${usd(allDay.minimumPerDay)} minimum). Extra hours ${usd(extraHour.upTo50)} (up to 50 guests) or ${usd(extraHour.over50)}. No travel fees in the five boroughs.`;
