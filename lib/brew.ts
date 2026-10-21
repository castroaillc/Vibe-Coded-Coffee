// Brew math, brought over from coffee-app (server/coffee.ts). Pure functions, safe in the browser.

// Starbucks drink sizes, in US fluid ounces.
export const CUP_SIZES = [
  { id: "short", label: "Short", oz: 8, note: "Hot only" },
  { id: "tall", label: "Tall", oz: 12 },
  { id: "grande", label: "Grande", oz: 16 },
  { id: "venti", label: "Venti", oz: 20, note: "Hot" },
  { id: "venti-iced", label: "Venti Iced", oz: 24, note: "Iced" },
  { id: "trenta", label: "Trenta", oz: 30, note: "Iced only" },
] as const;

export type CupSizeId = (typeof CUP_SIZES)[number]["id"];

// Water-to-coffee ratios by weight. Lower = stronger.
export const STRENGTHS = [
  { id: "strong", label: "Strong", ratio: 15 },
  { id: "classic", label: "Classic", ratio: 16 },
  { id: "mild", label: "Mild", ratio: 18 },
] as const;

export type StrengthId = (typeof STRENGTHS)[number]["id"];

// Standard retail bag sizes from coffee roasters, in ounces by weight.
export const BAG_SIZES = [
  { label: "12 oz", oz: 12 },
  { label: "2.5 lb", oz: 40 },
  { label: "5 lb", oz: 80 },
];

const GRAMS_PER_FL_OZ_WATER = 29.5735;
const GRAMS_PER_OZ = 28.3495;
const ML_PER_FL_OZ = 29.5735;
// A level tablespoon of medium-ground coffee weighs roughly 5 g.
const GRAMS_PER_TBSP = 5;

export interface BagUsage {
  label: string;
  bagsNeeded: number;
  brewsPerBag: number;
}

export interface CoffeeResult {
  cups: number;
  cupSizeOz: number;
  ratio: number;
  coffeeGrams: number;
  coffeeOz: number;
  coffeeLb: number;
  tablespoons: number;
  waterOz: number;
  waterMl: number;
  bags: BagUsage[];
}

export class ValidationError extends Error {
  field: string;
  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}

/** Looks up a Starbucks cup size by id (e.g. "grande"). */
export function findCupSize(id: string) {
  return CUP_SIZES.find((s) => s.id === id.toLowerCase());
}

/** Looks up a strength preset by id (e.g. "strong"). */
export function findStrength(id: string) {
  return STRENGTHS.find((s) => s.id === id.toLowerCase());
}

function assertPositive(field: string, value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new ValidationError(field, `\`${field}\` must be a number greater than zero.`);
  }
}

const round = (n: number, places: number) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

/**
 * Calculates how much ground coffee is needed to brew a given
 * number of cups of coffee.
 *
 * - Water is measured by volume; ground coffee is measured by weight.
 * - 1 US fluid ounce of water ≈ 29.5735 grams; 1 oz by weight ≈ 28.3495 grams.
 *
 * @param cups - Number of cups to brew.
 * @param cupSizeOz - Water volume per cup in US fluid ounces. Default: 16 (Grande).
 * @param ratio - Water-to-coffee ratio by weight. Default: 16.
 *
 * @throws ValidationError if any input is not a positive number.
 */
export function calculateGroundCoffee(
  cups: number,
  cupSizeOz: number = 16,
  ratio: number = 16
): CoffeeResult {
  assertPositive("cups", cups);
  assertPositive("cupSizeOz", cupSizeOz);
  assertPositive("ratio", ratio);

  const waterOz = cups * cupSizeOz;
  if (!Number.isFinite(waterOz * GRAMS_PER_FL_OZ_WATER)) {
    throw new ValidationError("cups", "That is too much coffee to calculate.");
  }
  const coffeeGrams = (waterOz * GRAMS_PER_FL_OZ_WATER) / ratio;
  const coffeeOz = coffeeGrams / GRAMS_PER_OZ;

  // Whole bags needed for this brew, and how many full brews one bag holds
  // (0 when a single bag isn't enough for one brew).
  const bags = BAG_SIZES.map((bag) => ({
    label: bag.label,
    bagsNeeded: Math.ceil(coffeeOz / bag.oz),
    brewsPerBag: Math.floor(bag.oz / coffeeOz),
  }));

  return {
    cups,
    cupSizeOz,
    ratio,
    coffeeGrams: round(coffeeGrams, 1),
    coffeeOz: round(coffeeOz, 2),
    coffeeLb: round(coffeeOz / 16, 2),
    tablespoons: round(coffeeGrams / GRAMS_PER_TBSP, 1),
    waterOz: round(waterOz, 1),
    waterMl: Math.round(waterOz * ML_PER_FL_OZ),
    bags,
  };
}

export interface SupplyPrices {
  bagPrice: number;
  bagOz: number;
  cupPrice: number;
  sleevePrice: number;
  lidPrice: number;
}

export interface CupCost {
  coffee: number;
  cup: number;
  sleeve: number;
  lid: number;
  total: number;
  cupsPerBag: number;
}

/**
 * Cost to serve one cup: the coffee it uses (priced from the bag) plus a cup,
 * sleeve, and lid. Unrounded; format for display.
 *
 * @throws ValidationError if the bag size is not positive or a price is negative.
 */
export function calculateCupCost(cupSizeOz: number, ratio: number, prices: SupplyPrices): CupCost {
  assertPositive("cupSizeOz", cupSizeOz);
  assertPositive("ratio", ratio);
  assertPositive("bagOz", prices.bagOz);
  for (const field of ["bagPrice", "cupPrice", "sleevePrice", "lidPrice"] as const) {
    if (!Number.isFinite(prices[field]) || prices[field] < 0) {
      throw new ValidationError(field, `\`${field}\` must be zero or more.`);
    }
  }

  const coffeeOzPerCup = (cupSizeOz * GRAMS_PER_FL_OZ_WATER) / ratio / GRAMS_PER_OZ;
  const coffee = (prices.bagPrice / prices.bagOz) * coffeeOzPerCup;

  return {
    coffee,
    cup: prices.cupPrice,
    sleeve: prices.sleevePrice,
    lid: prices.lidPrice,
    total: coffee + prices.cupPrice + prices.sleevePrice + prices.lidPrice,
    cupsPerBag: Math.floor(prices.bagOz / coffeeOzPerCup),
  };
}
