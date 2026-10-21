// Event coffee math for the public site (same rule the admin brew planner uses).
import { calculateGroundCoffee } from "./brew";
import { CUPS_PER_GUEST, EVENT_CUP_OZ } from "./admin/format";

export { CUPS_PER_GUEST, EVENT_CUP_OZ };

/** Cups, gallons and pounds of ground coffee for a headcount over a number of event days. */
export function planCoffee(guests: number, days = 1, cupsPerGuest: number = CUPS_PER_GUEST) {
  const cups = Math.max(1, Math.ceil(guests * cupsPerGuest * days));
  const r = calculateGroundCoffee(cups, EVENT_CUP_OZ, 16);
  return {
    guests,
    days,
    cups,
    gallons: Math.round(((cups * EVENT_CUP_OZ) / 128) * 10) / 10,
    lb: Math.round(r.coffeeLb * 10) / 10,
  };
}
