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
    "Vibe Coded Coffee is a coffee catering company for tech events in New York City: hackathons, meetups, demo days, conferences and team offsites. We bring freshly brewed drip coffee, set up and clean up. Request a quote for your event.",
  city: "Brooklyn",
  region: "NY",
  country: "US",
  locationLabel: "Brooklyn, New York",
  serviceArea: "New York City",
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
    "Freshly brewed drip coffee for hackathons, meetups, demo days and offsites across New York City. Tell us about your event and we'll send a quote within one business day.",
};

/** Kinds of event on the booking form (also accepted by /api/booking). */
export const eventTypes = ["Hackathon", "Meetup", "Demo day", "Conference", "Team offsite", "Launch party", "Other"] as const;

/** What an organizer gets. `icon` is one of the names in components/Icons.tsx. */
export const services = [
  {
    icon: "cup",
    title: "Fresh drip coffee",
    body: "Small-batch beans, freshly ground and brewed in batches so the pot never sits long.",
  },
  {
    icon: "people",
    title: "Sized to your headcount",
    body: "From a 20-person meetup to a 500-person hackathon. Tell us how many and we'll bring enough.",
  },
  {
    icon: "laptop",
    title: "Made for tech events",
    body: "Long build sessions, late demos, early keynotes. We keep the coffee going while your people ship.",
  },
  {
    icon: "bulb",
    title: "We set up and clean up",
    body: "Cups, lids, milk and sugar included. You focus on the event, we handle the coffee station.",
  },
] as const;

export const craft = [
  { title: "Freshly ground", body: "Beans ground the day of your event, never a bag that sat open for a week." },
  { title: "Brewed in small batches", body: "Fresh pots all event long, never a stale urn." },
  { title: "Served with care", body: "A friendly coffee station your guests will actually line up for." },
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
    q: "What do you serve?",
    a: "Right now we serve freshly brewed drip coffee, with milk, sugar, cups and lids included. More drinks are coming when we add our coffee cart.",
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
