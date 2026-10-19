// ─────────────────────────────────────────────────────────────
//  The menu. Every item is named after a "spinner verb" — the
//  word your terminal shows while it works ("Thinking…").
//  Edit names, descriptions and prices here; the page, Google
//  structured data and llms.txt all update from this file.
//  Prices are placeholders — set your real ones before launch.
// ─────────────────────────────────────────────────────────────

export type MenuItem = { verb: string; name: string; note: string; price: number };
export type MenuSection = { id: string; title: string; blurb: string; items: MenuItem[] };

export const menu: MenuSection[] = [
  {
    id: "coffee",
    title: "Coffee",
    blurb: "Espresso and filter from a rotating single origin.",
    items: [
      { verb: "Brewing", name: "Batch brew", note: "Today's single origin, black", price: 4 },
      { verb: "Compiling", name: "Double espresso", note: "Two shots, no dependencies", price: 4 },
      { verb: "Thinking", name: "Cortado", note: "Equal parts espresso and steamed milk", price: 5 },
      { verb: "Refactoring", name: "Cappuccino", note: "The classic, cleaned up", price: 5.5 },
      { verb: "Rejoicing", name: "Vanilla oat latte", note: "House vanilla, oat milk, a rosetta on top", price: 6.5 },
      { verb: "Debugging", name: "Mocha", note: "Dark chocolate and a double shot", price: 6.5 },
      { verb: "Deploying", name: "Cold brew", note: "Steeped for 18 hours, served over ice", price: 5.5 },
    ],
  },
  {
    id: "matcha",
    title: "Matcha",
    blurb: "Ceremonial-grade, whisked to order.",
    items: [
      { verb: "Pondering", name: "Matcha latte", note: "Ceremonial matcha, your choice of milk", price: 6.5 },
      { verb: "Iterating", name: "Iced strawberry matcha", note: "Strawberry purée, milk, matcha on top", price: 7 },
      { verb: "Vibing", name: "Dirty matcha", note: "Matcha latte with a shot of espresso", price: 7 },
      { verb: "Hydrating", name: "Matcha tonic", note: "Matcha over sparkling tonic and citrus", price: 6.5 },
    ],
  },
  {
    id: "tea",
    title: "Tea",
    blurb: "Loose leaf, steeped by the pot.",
    items: [
      { verb: "Steeping", name: "Earl Grey", note: "Black tea with bergamot", price: 4 },
      { verb: "Mulling", name: "Chai latte", note: "House-spiced chai, steamed milk", price: 6 },
      { verb: "Ruminating", name: "Hojicha latte", note: "Roasted green tea, toasty and mellow", price: 6 },
      { verb: "Unwinding", name: "Chamomile & honey", note: "Caffeine-free, for the late commits", price: 4 },
    ],
  },
  {
    id: "pastries",
    title: "Pastries",
    blurb: "Baked every morning, gone by afternoon.",
    items: [
      { verb: "Shipping", name: "Butter croissant", note: "Flaky, golden, ready for production", price: 4.5 },
      { verb: "Caching", name: "Almond croissant", note: "Twice-baked with almond cream", price: 5.5 },
      { verb: "Forking", name: "Cardamom bun", note: "Swedish-style knot, cardamom sugar", price: 5 },
      { verb: "Merging", name: "Banana bread", note: "Brown butter, toasted walnuts", price: 4.5 },
      { verb: "Committing", name: "Chocolate chip cookie", note: "Sea salt, crisp edges, soft middle", price: 3.5 },
    ],
  },
];

export const allVerbs = menu.flatMap((s) => s.items.map((i) => i.verb));

export const formatPrice = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(2));
