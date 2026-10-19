// ─────────────────────────────────────────────────────────────
//  All page copy lives here. Edit this file to change the text,
//  location, offer and FAQ — the page, search-engine data
//  (JSON-LD) and llms.txt all read from it.
// ─────────────────────────────────────────────────────────────

export const site = {
  name: "Vibe Coded Coffee",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://vibecodedcoffee.com").replace(/\/$/, ""),
  tagline: "Good coffee. Better builders.",
  description:
    "Vibe Coded Coffee is a specialty coffee shop and workspace for builders opening soon in Brooklyn, New York. Join the waitlist to get your first month of the Vibe Coded membership free.",
  city: "Brooklyn",
  region: "NY",
  country: "US",
  locationLabel: "Brooklyn, New York",
  email: "hello@vibecodedcoffee.com",
  social: {
    instagram: "https://www.instagram.com/vibecodedcoffee",
  },
  lastUpdated: "2026-10-19",
} as const;

export const offer = {
  name: "Vibe Coded Membership — first month free",
  short: "First month free",
  headline: "Your first month of Vibe Coded is on us.",
  summary:
    "Join the pre-launch waitlist and get one free month of the Vibe Coded membership when we open in Brooklyn. No card needed to join.",
};

export const perks = [
  {
    icon: "cup",
    title: "Specialty coffee",
    body: "Thoughtfully sourced beans, expertly brewed. Your member drink is waiting when you walk in.",
  },
  {
    icon: "laptop",
    title: "Builder-friendly space",
    body: "Fast Wi-Fi, outlets at every seat and room to focus, meet and make progress.",
  },
  {
    icon: "people",
    title: "Community nights",
    body: "Members-only demo nights, build sessions and conversations with people shipping real things.",
  },
  {
    icon: "bulb",
    title: "Ideas flow",
    body: "Good coffee leads to great things. Meet your next co-founder, client or collaborator here.",
  },
] as const;

export const craft = [
  { title: "Ground to order", body: "Beans go into the grinder seconds before they hit the portafilter." },
  { title: "Pulled with care", body: "Every shot dialed in for the bean of the week." },
  { title: "Poured by hand", body: "Silky milk, steady hands, a little art on top." },
];

export const steps = [
  { title: "Join the waitlist", body: "Add your email below. It takes ten seconds and no payment details." },
  { title: "Get the opening date", body: "Waitlist members hear first — before the doors open to everyone else." },
  { title: "Claim your free month", body: "Show your invite on opening day and your first month of membership is free." },
];

export const audiences = ["Founders", "Developers", "Designers", "Creatives", "Students", "Curious minds"];

export const faqs = [
  {
    q: "What is Vibe Coded Coffee?",
    a: "Vibe Coded Coffee is a specialty coffee shop and workspace in Brooklyn, New York, built for people who build — founders, developers, designers, creatives and students. It combines great coffee with a space designed for focus, creativity and connection.",
  },
  {
    q: "What is the Vibe Coded membership?",
    a: "The Vibe Coded membership is a monthly subscription that includes your member coffee, access to the builder-friendly workspace and members-only community events.",
  },
  {
    q: "How do I get a free month?",
    a: "Join the pre-launch waitlist on this page with your email. When Vibe Coded Coffee opens, waitlist members get their first month of the membership free.",
  },
  {
    q: "What's on the Vibe Coded Coffee menu?",
    a: "Specialty coffee (espresso drinks, batch brew and cold brew), ceremonial matcha, loose-leaf tea and fresh-baked pastries. Every item is named after a programmer's \"spinner verb\" — like Thinking…, Compiling… or Rejoicing… — and the latte art is code-themed.",
  },
  {
    q: "Do I need a credit card to join the waitlist?",
    a: "No. Joining the waitlist only needs your email address. You will not be charged anything to join.",
  },
  {
    q: "When and where is Vibe Coded Coffee opening?",
    a: "Vibe Coded Coffee is opening soon in Brooklyn, New York. Waitlist members will be the first to get the exact address and opening date.",
  },
  {
    q: "Can I bring my laptop and work there?",
    a: "Yes. The space is designed for builders, with Wi-Fi, power at the seats and areas for both focused work and conversation.",
  },
];
