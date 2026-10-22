// Event quoting: what an event costs you (supplies, labor, travel) and what to charge.
// Pure functions, safe in the browser. Settings are saved in the app_setting table ("pricing").
import { calculateGroundCoffee } from "./brew";

export type SupplyUse = "coffee" | "per_cup" | "per_guest" | "per_event";

export type Supply = {
  id: string;
  name: string;
  packPrice: number; // $ for one pack/bag
  packQty: number; // lb for coffee, otherwise units in the pack (cups, packets, oz of milk…)
  unit: string; // "lb", "cups", "packets", "oz"…
  use: SupplyUse;
  perUse: number; // how many units per cup / per guest / per event (ignored for coffee)
  estimate?: boolean; // a placeholder price to replace with what you actually pay
};

export type ServiceId = "dropoff" | "staffed" | "hackathon";

export type Service = {
  label: string;
  pricePerGuest: number; // $ per guest per day
  minimum: number; // $ per event
  serviceHours: number; // staffed hours per day (0 for drop-off)
  handlingHours: number; // setup, cleanup and travel time per day
};

export type PricingSettings = {
  cupsPerGuest: number; // per guest per day
  cupOz: number;
  ratio: number; // water : coffee by weight
  laborRate: number; // $ per staff hour
  travelPerDay: number; // $ gas, tolls, parking per event day
  services: Record<ServiceId, Service>;
  supplies: Supply[];
};

export const SERVICE_IDS: ServiceId[] = ["dropoff", "staffed", "hackathon"];

export const DEFAULT_PRICING: PricingSettings = {
  cupsPerGuest: 1.5,
  cupOz: 12,
  ratio: 16,
  laborRate: 25,
  travelPerDay: 40,
  services: {
    dropoff: { label: "Drop-off", pricePerGuest: 5, minimum: 250, serviceHours: 0, handlingHours: 1.5 },
    staffed: { label: "Staffed station (4 hrs)", pricePerGuest: 7.5, minimum: 400, serviceHours: 4, handlingHours: 1.5 },
    hackathon: { label: "Hackathon (per day)", pricePerGuest: 6.5, minimum: 600, serviceHours: 10, handlingHours: 1.5 },
  },
  supplies: [
    { id: "coffee", name: "Brooklyn Coffee House Blend, whole bean (5 lb)", packPrice: 59.99, packQty: 5, unit: "lb", use: "coffee", perUse: 0 },
    { id: "sugar", name: "Sweetmo sugar variety + stirrers (300)", packPrice: 24.99, packQty: 300, unit: "packets", use: "per_cup", perUse: 1 },
    { id: "napkins", name: "JollyPack napkins (1,000)", packPrice: 13.99, packQty: 1000, unit: "napkins", use: "per_guest", perUse: 2 },
    { id: "cups", name: "Ginkgo 12 oz cups + lids + sleeves (300)", packPrice: 73.99, packQty: 300, unit: "cups", use: "per_cup", perUse: 1 },
    { id: "creamer", name: "Coffee mate creamer singles, variety (200)", packPrice: 31.05, packQty: 200, unit: "singles", use: "per_cup", perUse: 1 },
    { id: "filters", name: "Brewer filters (1,000)", packPrice: 44.99, packQty: 1000, unit: "filters", use: "per_cup", perUse: 0.2, estimate: true },
  ],
};

/** Saved settings merged over the defaults, so new fields always have a value. */
export function withDefaults(saved: Partial<PricingSettings> | null | undefined): PricingSettings {
  if (!saved) return DEFAULT_PRICING;
  return {
    ...DEFAULT_PRICING,
    ...saved,
    services: { ...DEFAULT_PRICING.services, ...(saved.services ?? {}) },
    supplies: saved.supplies?.length ? saved.supplies : DEFAULT_PRICING.supplies,
  };
}

export type QuoteInput = { guests: number; days: number; service: ServiceId; priceOverride?: number | null };

export type QuoteLine = { id: string; name: string; used: number; unit: string; packsToBuy: number; cost: number; estimate?: boolean };

export function quoteEvent(input: QuoteInput, s: PricingSettings) {
  const guests = Math.max(0, Math.floor(input.guests || 0));
  const days = Math.max(1, Math.floor(input.days || 1));
  const svc = s.services[input.service];
  const guestDays = guests * days;
  const cups = Math.ceil(guestDays * s.cupsPerGuest);
  const coffeeLb = cups > 0 ? calculateGroundCoffee(cups, s.cupOz, s.ratio).coffeeLb : 0;

  const lines: QuoteLine[] = s.supplies.map((x) => {
    const used =
      x.use === "coffee" ? coffeeLb : x.use === "per_cup" ? cups * x.perUse : x.use === "per_guest" ? guestDays * x.perUse : days * x.perUse;
    const unitCost = x.packQty > 0 ? x.packPrice / x.packQty : 0;
    return {
      id: x.id,
      name: x.name,
      used,
      unit: x.unit,
      packsToBuy: x.packQty > 0 ? Math.ceil(used / x.packQty) : 0,
      cost: used * unitCost,
      estimate: x.estimate,
    };
  });

  const supplies = lines.reduce((a, l) => a + l.cost, 0);
  const staffHours = (svc.serviceHours + svc.handlingHours) * days;
  const labor = staffHours * s.laborRate;
  const travel = s.travelPerDay * days;
  const cost = supplies + labor + travel;
  const listPrice = Math.max(svc.minimum, svc.pricePerGuest * guestDays);
  const price = input.priceOverride && input.priceOverride > 0 ? input.priceOverride : listPrice;
  const profit = price - cost;

  return {
    guests,
    days,
    cups,
    coffeeLb,
    lines,
    supplies,
    staffHours,
    labor,
    travel,
    cost,
    listPrice,
    minimumApplied: svc.pricePerGuest * guestDays < svc.minimum,
    price,
    profit,
    margin: price > 0 ? profit / price : 0,
    costPerGuest: guestDays ? cost / guestDays : 0,
    pricePerGuest: guestDays ? price / guestDays : 0,
  };
}

export const serviceForEventType = (eventType: string): ServiceId => (/hackathon/i.test(eventType) ? "hackathon" : "staffed");
