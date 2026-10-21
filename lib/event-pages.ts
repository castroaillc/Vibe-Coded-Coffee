// ─────────────────────────────────────────────────────────────
//  Landing pages for each kind of tech event, at /coffee-catering/<slug>.
//  Each page answers the question an organizer would type or ask an AI
//  ("coffee catering for a hackathon in NYC") in its first two sentences,
//  then gives specifics, planning numbers and an FAQ.
//  Keep every claim true: no invented prices, clients or reviews.
// ─────────────────────────────────────────────────────────────

export type EventPage = {
  slug: string;
  eventType: string; // matches an option on the booking form
  name: string; // "Hackathon coffee catering"
  title: string; // <title>
  description: string; // meta description
  h1: string;
  answer: string; // the direct answer, first thing on the page
  exampleGuests: number;
  exampleDays: number;
  why: { title: string; body: string }[];
  planning: string;
  faqs: { q: string; a: string }[];
};

export const eventPages: EventPage[] = [
  {
    slug: "hackathons",
    eventType: "Hackathon",
    name: "Hackathon coffee catering",
    title: "Hackathon Coffee Catering in NYC",
    description:
      "Coffee catering for hackathons in New York City. Fresh drip coffee from kickoff to final demos, sized to your headcount, with setup and cleanup. Get a quote in one business day.",
    h1: "Hackathon coffee catering in New York City",
    answer:
      "Vibe Coded Coffee caters hackathons across New York City with freshly brewed drip coffee, brewed in small batches from kickoff to final demos. We size the coffee to your headcount and schedule, set up the station, keep it stocked, and clean up after. Send your date, venue and headcount and we reply with a quote within one business day.",
    exampleGuests: 150,
    exampleDays: 2,
    why: [
      { title: "Built for long build sessions", body: "Hackathons run for 24 to 48 hours. We plan coffee per day of hacking, not just for the opening, so the pots don't run dry before demos." },
      { title: "Fresh, not stewed", body: "Coffee is brewed in small batches through the event instead of one big urn in the morning, so the 2 a.m. cup tastes like the 9 a.m. one." },
      { title: "Sized to your sign-ups", body: "From a 30-person student hackathon to a 500-hacker weekend. Tell us your registration numbers and we bring enough, including cups, lids, milk and sugar." },
      { title: "Made by builders, for builders", body: "We started Vibe Coded Coffee for the tech community, so we know what kickoff, judging and demo time look like for organizers." },
    ],
    planning:
      "Plan coffee per day of hacking. Tell us your schedule, including any overnight hours, and we'll quote coverage for the times your hackers are awake.",
    faqs: [
      { q: "How much coffee do you need for a hackathon?", a: "We plan about 1.5 cups of coffee per hacker per day. For a 150-person, two-day hackathon that's about 450 twelve-ounce cups. Our guide on how much coffee to order has a calculator for your exact headcount." },
      { q: "Can you cover an overnight hackathon?", a: "Tell us your full schedule, including overnight hours, when you request a quote and we'll tell you what coverage we can provide." },
      { q: "Do you work with student and university hackathons?", a: "Yes. We cater hackathons of every size in New York City. Send your headcount and budget and we'll put together a quote." },
      { q: "Can sponsors brand the coffee station?", a: "Ask us when you book. We can talk through cup stickers or signage for a sponsor at the coffee station." },
    ],
  },
  {
    slug: "tech-meetups",
    eventType: "Meetup",
    name: "Tech meetup coffee catering",
    title: "Coffee Catering for Tech Meetups in NYC",
    description:
      "Fresh drip coffee for tech meetups in New York City. A coffee station for 20 to 200 guests, set up before doors open and cleaned up after. Quote in one business day.",
    h1: "Coffee catering for tech meetups in NYC",
    answer:
      "Vibe Coded Coffee brings a fresh drip coffee station to tech meetups across New York City. We arrive before doors open, keep the coffee going through talks and networking, and clean up after, so hosts can focus on the room. Request a quote with your date, venue and headcount and we reply within one business day.",
    exampleGuests: 60,
    exampleDays: 1,
    why: [
      { title: "Ready before doors open", body: "The station is set up and the first pot is brewed before your first guest walks in." },
      { title: "Right-sized for RSVPs", body: "Meetups have no-shows and walk-ins. We size the coffee to your RSVP list, not a guess." },
      { title: "Easy for recurring events", body: "Monthly meetup? Book the same setup each time with one message." },
      { title: "Everything included", body: "Cups, lids, milk, sugar and stirrers come with the coffee. You don't need to buy anything." },
    ],
    planning: "Most meetups run two to three hours. We plan about 1.5 cups per guest, which covers arrival, talks and networking.",
    faqs: [
      { q: "What's the smallest meetup you'll cater?", a: "We cater meetups from about 20 guests up. Send your headcount and we'll tell you what fits." },
      { q: "Can you do evening meetups?", a: "Yes. Tell us your start and end times when you request a quote." },
      { q: "Do you bring decaf?", a: "Ask for it when you book and we'll include it in your quote." },
    ],
  },
  {
    slug: "conferences",
    eventType: "Conference",
    name: "Conference coffee service",
    title: "Coffee Service for Tech Conferences in NYC",
    description:
      "Coffee service for tech conferences in New York City: fresh drip coffee for registration, breaks and the expo floor, sized to your attendance. Quote in one business day.",
    h1: "Coffee service for tech conferences in NYC",
    answer:
      "Vibe Coded Coffee provides fresh drip coffee service for tech conferences in New York City, timed around registration, session breaks and the expo floor. We size the coffee to your attendance and schedule, run the station, and clean up after. Send your dates, venue and attendance for a quote within one business day.",
    exampleGuests: 300,
    exampleDays: 1,
    why: [
      { title: "Timed to your agenda", body: "Coffee peaks at registration and between sessions. We plan batches around your schedule so lines stay short." },
      { title: "Multi-day events", body: "Two-day conference? We plan and quote per day." },
      { title: "One less vendor to manage", body: "We set up, restock and break down the station ourselves." },
    ],
    planning: "For conferences we plan about 1.5 cups per attendee per day, with batches timed to registration and breaks.",
    faqs: [
      { q: "Does your venue allow outside coffee?", a: "Some venues have exclusive catering. Check with your venue first; if outside vendors are allowed, send us the venue details with your quote request." },
      { q: "Can you serve more than one coffee station?", a: "Tell us your floor plan and attendance and we'll quote the setup that fits." },
      { q: "How far ahead should we book a conference?", a: "Two weeks or more is ideal. For large conferences, earlier is better." },
    ],
  },
  {
    slug: "demo-days",
    eventType: "Demo day",
    name: "Demo day coffee catering",
    title: "Coffee Catering for Demo Days and Pitch Events in NYC",
    description:
      "Coffee catering for startup demo days, pitch nights and investor events in New York City. A polished coffee station for founders and guests. Quote in one business day.",
    h1: "Coffee catering for demo days and pitch events",
    answer:
      "Vibe Coded Coffee caters startup demo days, pitch nights and investor events in New York City with freshly brewed drip coffee and a clean, friendly coffee station. We set up before guests arrive and clean up after. Send your date, venue and headcount and we reply with a quote within one business day.",
    exampleGuests: 100,
    exampleDays: 1,
    why: [
      { title: "A good first impression", body: "Investors and guests arrive to fresh coffee, not a lukewarm urn." },
      { title: "Fits accelerator calendars", body: "Running a cohort? Book coffee for demo day and the events leading up to it." },
      { title: "Hands-off for organizers", body: "We handle the station start to finish so your team can run the show." },
    ],
    planning: "Demo days usually run a few hours. We plan about 1.5 cups per guest.",
    faqs: [
      { q: "Do you work with accelerators and VC firms?", a: "Yes. Tell us about your program and event schedule and we'll quote one event or several." },
      { q: "Can we add our logo to cups?", a: "Ask us when you book and we'll talk through branded cup stickers." },
    ],
  },
  {
    slug: "team-offsites",
    eventType: "Team offsite",
    name: "Team offsite coffee catering",
    title: "Coffee Catering for Team Offsites and Company Events in NYC",
    description:
      "Fresh drip coffee for engineering offsites, all-hands and company events in New York City. Set up, stocked and cleaned up. Quote in one business day.",
    h1: "Coffee catering for team offsites and company events",
    answer:
      "Vibe Coded Coffee brings fresh drip coffee to team offsites, all-hands meetings and company events in New York City. We set up the station, keep it full through planning sessions, and clean up after. Send your date, location and headcount for a quote within one business day.",
    exampleGuests: 40,
    exampleDays: 1,
    why: [
      { title: "Better than office coffee", body: "Freshly ground, small-batch drip coffee for a day your team actually remembers." },
      { title: "Any NYC venue", body: "Your office, a rented loft or an event space. We bring everything we need." },
      { title: "Simple to expense", body: "One quote, one vendor, one invoice." },
    ],
    planning: "For a full-day offsite we plan about 1.5 cups per person, with fresh batches through the morning and after lunch.",
    faqs: [
      { q: "Can you come to our office?", a: "Yes. We cater offices and event spaces across New York City." },
      { q: "Can you do a morning-only setup?", a: "Yes. Tell us your hours when you request a quote." },
    ],
  },
];

export const findEventPage = (slug: string) => eventPages.find((p) => p.slug === slug);
export const eventPagePath = (slug: string) => `/coffee-catering/${slug}`;
