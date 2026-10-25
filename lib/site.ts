// ─────────────────────────────────────────────────────────────
//  All page copy lives here. Edit this file to change the text,
//  location, services, packages and FAQ — the page, search-engine
//  data (JSON-LD) and llms.txt all read from it.
//
//  Positioning (Oct 2026): enterprise coffee catering in NYC.
//  Companies, office managers, workplace teams and event planners
//  book a staffed coffee station brewed on site. Tech events stay a
//  core vertical. No storefront messaging on the public site.
//  Keep every claim true: no invented clients, reviews or certifications.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Vibe Coded Coffee",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibecodedcoffee.com").replace(/\/$/, ""),
  tagline: "Coffee catering for teams that build.",
  description:
    "Vibe Coded Coffee is an enterprise coffee catering company in New York City. We set up a staffed coffee station at your office or venue and brew drip coffee on site for all-hands meetings, client events, conferences, trainings, offsites and tech events. Packages start at $500 for up to 25 guests, with custom quotes for larger and recurring events.",
  /** Search-result snippet: keep under ~155 characters. */
  metaDescription:
    "Corporate coffee catering in NYC. A staffed station brewed on site at your office or venue. Packages from $500. Quote by the next business day.",
  city: "Brooklyn",
  region: "NY",
  country: "US",
  locationLabel: "Brooklyn, New York",
  serviceArea: "New York City",
  /** Brooklyn, approximate (service-area business, no public address). Used for geo meta tags and JSON-LD. */
  geo: { latitude: 40.6782, longitude: -73.9442 },
  /** Where we cater, for search engines. */
  boroughs: ["Manhattan", "Brooklyn", "Queens", "The Bronx", "Staten Island"],
  email: "hello@vibecodedcoffee.com",
  social: {
    instagram: "https://www.instagram.com/vibecodedcoffee",
  },
  lastUpdated: "2026-10-25",
} as const;

/** The core offer: what companies book. */
export const catering = {
  name: "Enterprise coffee catering in NYC",
  short: "Corporate coffee catering",
  headline: "Coffee catering for teams that build.",
  summary:
    "A staffed coffee station, brewed on site at your office or venue anywhere in New York City. Send the date, location and headcount and you'll have a quote by the next business day.",
};

/** Kinds of event on the booking form (also accepted by /api/booking). */
export const eventTypes = [
  "All-hands / town hall",
  "Client or customer event",
  "Conference",
  "Training or workshop",
  "Team offsite",
  "Hackathon",
  "Meetup",
  "Demo day",
  "Launch party",
  "Recurring office event",
  "Other",
] as const;

/** Who books us. Shown on the page and in llms.txt. */
export const buyers = ["Office and workplace managers", "Event and executive assistants", "People and culture teams", "Event planners and agencies"];

/** What an organizer gets. `icon` is one of the names in components/Icons.tsx. */
export const services = [
  {
    icon: "cup",
    title: "Drip coffee, brewed on site",
    body: "A medium-roast house blend from Brooklyn Coffee, roasted weekly in NYC. Ground the day of your event and brewed in small batches at your venue, never dropped off in a box. Decaf on request.",
  },
  {
    icon: "people",
    title: "A staffed station",
    body: "One of us runs the station for your booked hours: brewing, refilling, restocking cups and wiping down, so your team doesn't have to.",
  },
  {
    icon: "laptop",
    title: "Easy for procurement",
    body: "A written quote, one invoice per booking and a single point of contact. Send your vendor onboarding forms with your request and we'll complete them.",
  },
  {
    icon: "bulb",
    title: "Supplies in, trash out",
    body: "12 oz cups with lids and sleeves, creamer, cane and raw sugar, sweeteners, stirrers and napkins come with every booking. When the event ends, we pack it all out.",
  },
] as const;

/** Published starting packages. Larger, multi-day and recurring events are quoted. */
export const packages = [
  { name: "Small team", price: 500, guests: 25, hours: 2, fits: "Team meetings, trainings and client visits" },
  { name: "Department", price: 695, guests: 50, hours: 3, fits: "All-hands, workshops and meetups" },
  { name: "Company", price: 1195, guests: 100, hours: 4, fits: "Town halls, launches and conferences" },
] as const;

export const packagesNote =
  "Every package includes the coffee, a staffed station, cups and condiments, setup and cleanup. Over 100 guests, multi-day events and recurring bookings are quoted to your schedule.";

export const craft = [
  { title: "Ground that day", body: "Whole beans, ground the day of your event. Not a bag that's been open since last week." },
  { title: "Brewed at 16:1", body: "Sixteen parts water to one part coffee, by weight. Small batches, so nothing sits on a burner for hours." },
  { title: "Someone at the table", body: "Every booking is staffed. One of us runs the station: refilling, restocking cups and wiping down." },
];

export const bookingSteps = [
  { title: "Tell us about your event", body: "Date, location, headcount and hours. It takes a minute and there's no commitment." },
  { title: "Get a written quote", body: "We reply within one business day with a price, what's included and any vendor paperwork we need from you." },
  { title: "We run the coffee", body: "We arrive early, set up at your office or venue, keep the station full and clean up after. One invoice follows." },
];

export const audiences = ["All-hands meetings", "Client events", "Conferences", "Trainings", "Team offsites", "Hackathons", "Meetups", "Demo days"];

export const faqs = [
  {
    q: "What is Vibe Coded Coffee?",
    a: "Vibe Coded Coffee is an enterprise coffee catering company in New York City. We set up a staffed coffee station at your office or event venue and brew drip coffee on site for all-hands meetings, client events, conferences, trainings, offsites and tech events, then handle cleanup.",
  },
  {
    q: "How much does corporate coffee catering cost in NYC?",
    a: "Our packages start at $500 for up to 25 guests and 2 hours, $695 for up to 50 guests and 3 hours, and $1,195 for up to 100 guests and 4 hours. Each includes the coffee, a staffed station, cups and condiments, setup and cleanup. Larger, multi-day and recurring events get a custom quote.",
  },
  {
    q: "How do I book Vibe Coded Coffee?",
    a: "Fill in the booking form on this page with your date, location, headcount and hours, or email hello@vibecodedcoffee.com. We reply within one business day with a written quote.",
  },
  {
    q: "Can you cater at our office?",
    a: "Yes. Most corporate bookings are at the client's office: a conference room, kitchen or lobby. We need a table, access to a standard outlet and a freight or service entrance if your building requires one. Tell us about building access when you book.",
  },
  {
    q: "Do you work with our procurement and accounts payable process?",
    a: "Yes. You get a written quote and one invoice per booking. If your company needs a W-9, a certificate of insurance or vendor onboarding forms, send them with your request and we'll tell you what we can provide.",
  },
  {
    q: "Do you offer recurring coffee service?",
    a: "Yes, for recurring events such as a weekly all-hands, monthly meetup or quarterly training. Tell us the schedule and we'll quote the series.",
  },
  {
    q: "What do you serve?",
    a: "Drip coffee, brewed on site from a medium-roast house blend roasted weekly in NYC. Decaf on request. Cups with lids and sleeves, creamer, sugar, sweeteners, stirrers and napkins are included.",
  },
  {
    q: "How far in advance should we book?",
    a: "Two weeks or more is ideal, and earlier for large events. Send the request even if your event is sooner and we'll tell you if we can make it.",
  },
  {
    q: "Where do you cater?",
    a: "We cater offices and event venues in all five boroughs of New York City. If your event is outside the city, send a request anyway and tell us where.",
  },
];
