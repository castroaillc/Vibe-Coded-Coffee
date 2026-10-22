// ─────────────────────────────────────────────────────────────
//  All page copy lives here. Edit this file to change the text,
//  location, services, offer and FAQ — the page, search-engine
//  data (JSON-LD) and llms.txt all read from it.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Vibe Coded Coffee",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibecodedcoffee.com").replace(/\/$/, ""),
  tagline: "Good coffee. Better builders.",
  description:
    "Vibe Coded Coffee is a Brooklyn coffee caterer for tech events in New York City. We brew drip coffee on site at hackathons, meetups, demo days, conferences and team offsites, using a medium-roast house blend roasted weekly in NYC. Send your date, venue and headcount for a quote.",
  /** Search-result snippet: keep under ~155 characters. */
  metaDescription:
    "Drip coffee brewed on site for NYC hackathons, meetups, demo days and offsites by a Brooklyn team. Send your headcount, get a quote next business day.",
  city: "Brooklyn",
  region: "NY",
  country: "US",
  locationLabel: "Brooklyn, New York",
  serviceArea: "New York City",
  /** Brooklyn, approximate (no storefront address yet). Used for geo meta tags and JSON-LD. */
  geo: { latitude: 40.6782, longitude: -73.9442 },
  /** Where we cater, for search engines. */
  boroughs: ["Brooklyn", "Manhattan", "Queens", "The Bronx", "Staten Island"],
  email: "hello@vibecodedcoffee.com",
  social: {
    instagram: "https://www.instagram.com/vibecodedcoffee",
  },
  lastUpdated: "2026-10-21",
} as const;

/** The B2B catering offer: what event organizers book. */
export const catering = {
  name: "Coffee catering for tech events",
  short: "Coffee catering for tech events",
  headline: "Coffee for the people building the future.",
  summary:
    "Drip coffee for hackathons, meetups, demo days and offsites anywhere in New York City. Send the date, venue and headcount and you'll have a price by the next business day.",
};

/** Kinds of event on the booking form (also accepted by /api/booking). */
export const eventTypes = ["Hackathon", "Meetup", "Demo day", "Conference", "Team offsite", "Launch party", "Other"] as const;

/** What an organizer gets. `icon` is one of the names in components/Icons.tsx. */
export const services = [
  {
    icon: "cup",
    title: "Drip coffee, brewed on site",
    body: "A medium-roast house blend from Brooklyn Coffee, roasted weekly in NYC. We grind it the morning of your event and brew a new batch whenever the last one runs low. Decaf on request.",
  },
  {
    icon: "people",
    title: "Sized to your headcount",
    body: "We plan 1.5 twelve-ounce cups per guest per day. For 100 guests that's about 150 cups and 7 lb of coffee. We've sized it for 20-person meetups and 500-person hackathons.",
  },
  {
    icon: "laptop",
    title: "Made for tech events",
    body: "Hackathons run overnight. Keynotes start at 9. Demo days run long. Send us the schedule and we'll plan the coffee around it, hour by hour.",
  },
  {
    icon: "bulb",
    title: "Supplies in, trash out",
    body: "12 oz cups with lids and sleeves, creamer, cane and raw sugar, sweeteners, stirrers and napkins come with every booking. When the event ends, we pack it all out.",
  },
] as const;

export const craft = [
  { title: "Ground that morning", body: "Whole beans, ground the day of your event. Not a bag that's been open since last week." },
  { title: "Brewed at 16:1", body: "Sixteen parts water to one part coffee, by weight. Small batches, so nothing sits on a burner for hours." },
  { title: "Someone at the table", body: "On staffed bookings, one of us runs the station: refilling, restocking cups and wiping down." },
];

export const bookingSteps = [
  { title: "Tell us about your event", body: "Date, location and headcount. It takes a minute and there's no commitment." },
  { title: "Get a quote", body: "We reply within one business day with a price and what's included." },
  { title: "We bring the coffee", body: "We arrive early, set up the station, keep it full and clean up after." },
];

export const audiences = ["Hackathons", "Meetups", "Demo days", "Conferences", "Team offsites", "Launch parties"];

/** Coming soon: the storefront / cart, with a free first month of the coffee-a-day membership for early sign-ups. */
export const offer = {
  name: "Vibe Coded Membership — first month free",
  short: "First month free",
  headline: "A Vibe Coded storefront is coming.",
  summary:
    "Our own coffee spot is coming soon, with a coffee-a-day membership. Join the list and your first month is free when we launch. No card needed.",
};

export const faqs = [
  {
    q: "What is Vibe Coded Coffee?",
    a: "Vibe Coded Coffee is a coffee catering company for tech events in New York City. We bring freshly brewed drip coffee to hackathons, meetups, demo days, conferences and team offsites, and handle setup and cleanup.",
  },
  {
    q: "How do I book Vibe Coded Coffee for my event?",
    a: "Fill in the booking form on this page with your event date, location and headcount. We reply within one business day with a quote.",
  },
  {
    q: "Do you cater hackathons?",
    a: "Yes. Hackathons are what we're built for. We plan coffee per day of hacking, brew in small batches so it stays fresh through late nights and demos, and handle setup and cleanup. Send your date, venue and headcount for a quote.",
  },
  {
    q: "What do you serve?",
    a: "Drip coffee, brewed on site from a medium-roast house blend roasted weekly in NYC. Decaf on request. Cups with lids and sleeves, creamer, sugar, sweeteners, stirrers and napkins are included. Espresso drinks will come later, with our coffee cart.",
  },
  {
    q: "How far in advance should I book?",
    a: "Two weeks or more is ideal, but send the request even if your event is sooner and we'll tell you if we can make it.",
  },
  {
    q: "Where do you cater?",
    a: "We cater events across New York City. If your event is outside the city, send a request anyway and tell us where.",
  },
  {
    q: "Can I get coffee from you outside of events?",
    a: "Not yet. A Vibe Coded storefront with a coffee-a-day membership is coming soon. Join the list on this page and your first month is free when we launch.",
  },
];
