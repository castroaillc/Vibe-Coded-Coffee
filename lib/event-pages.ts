// ─────────────────────────────────────────────────────────────
//  Landing pages for each kind of event, at /coffee-catering/<slug>.
//  Corporate pages come first (enterprise positioning, Oct 2026); tech events stay a vertical.
//  Each page answers the question an organizer would type or ask an AI
//  ("coffee catering for a hackathon in NYC") in its first two sentences,
//  then gives specifics, planning numbers and an FAQ.
//  Keep every claim true: no invented prices, clients or reviews.
// ─────────────────────────────────────────────────────────────

export type EventPage = {
  slug: string;
  eventType: string; // matches an option on the booking form
  label?: string; // singular noun used in headings ("corporate event"); defaults to eventType lowercased
  pills?: string[]; // labels in `audiences` (lib/site.ts) that link here, when they aren't just eventType + "s"
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
    slug: "corporate-events",
    eventType: "All-hands / town hall",
    label: "corporate event",
    pills: ["All-hands meetings", "Client events", "Trainings"],
    name: "Corporate event coffee catering",
    title: "Corporate Event Coffee Catering in NYC",
    description:
      "A staffed coffee station for all-hands, town halls, trainings and client events at your NYC office or venue. Packages from $500. One invoice.",
    h1: "Coffee catering for corporate events in New York City",
    answer:
      "Vibe Coded Coffee caters corporate events in New York City: all-hands meetings, town halls, trainings, workshops and client events, at your office or an event venue. We set up a staffed station and brew drip coffee on site, from $500 for up to 25 guests to $1,195 for up to 100. Send your date, location and headcount and you'll have a written quote by the next business day.",
    exampleGuests: 80,
    exampleDays: 1,
    why: [
      { title: "Brewed at your office", body: "We set up in your conference room, kitchen or lobby and brew on site. No boxed coffee going cold on a side table." },
      { title: "Staffed start to finish", body: "One of us runs the station for your booked hours, so your office team isn't refilling carafes during the meeting." },
      { title: "Built for procurement", body: "A written quote, one invoice per booking and a single point of contact. Send vendor forms with your request." },
      { title: "Timed to your agenda", body: "Arrival, the first break, after lunch. We plan batches around your schedule so the line stays short." },
    ],
    planning: "For a half-day meeting we plan about 1.5 cups per guest. Tell us your start and end times and any breaks.",
    faqs: [
      { q: "How much does coffee catering for a corporate event cost?", a: "Packages start at $500 for up to 25 guests and 2 hours, $695 for up to 50 guests and 3 hours, and $1,195 for up to 100 guests and 4 hours. Larger and multi-day events are quoted." },
      { q: "What do you need from our building?", a: "A table, access to a standard outlet and, if your building requires it, a freight or service entrance and a certificate of insurance request. Tell us about building access when you book." },
      { q: "Can you invoice our company?", a: "Yes. You get one invoice per booking. If you need a W-9 or vendor onboarding forms, send them with your request." },
    ],
  },
  {
    slug: "recurring-office-events",
    eventType: "Recurring office event",
    label: "recurring office event",
    name: "Recurring office coffee catering",
    title: "Recurring Office Coffee Catering in NYC",
    description:
      "Coffee catering on a schedule for NYC offices: weekly all-hands, monthly meetups and training series. One quote for the series.",
    h1: "Recurring coffee catering for NYC offices",
    answer:
      "We cater recurring office events in New York City, such as a weekly all-hands, a monthly community meetup or a quarterly training series. You book the series once and we show up with the same staffed coffee station every time. Send your schedule, location and typical headcount and we'll quote the series by the next business day.",
    exampleGuests: 50,
    exampleDays: 1,
    why: [
      { title: "Book once", body: "One quote covers the series. No re-sending the same request every week." },
      { title: "Same setup every time", body: "We learn your building, your room and your crowd, so setup gets faster each visit." },
      { title: "Easy to budget", body: "A set price per event, invoiced the way your finance team prefers to receive it." },
    ],
    planning: "Most recurring events run one to three hours. We plan about 1.5 cups per guest and adjust as we learn your turnout.",
    faqs: [
      { q: "Do you offer daily office coffee service?", a: "We focus on events: a staffed station for a set number of hours. For a recurring meeting, training or meetup, tell us the schedule and we'll quote the series." },
      { q: "Can we change the headcount between events?", a: "Yes. Tell us the expected headcount a few days before each event." },
    ],
  },
  {
    slug: "hackathons",
    eventType: "Hackathon",
    name: "Hackathon coffee catering",
    title: "Hackathon Coffee Catering in NYC",
    description:
      "Drip coffee for NYC hackathons, brewed on site from kickoff to demos and planned per day of hacking. Setup, cleanup and supplies included.",
    h1: "Hackathon coffee catering in New York City",
    answer:
      "Vibe Coded Coffee caters hackathons in New York City. We brew drip coffee on site, from a medium-roast blend roasted weekly in NYC, and plan it per day of hacking: about 1.5 cups per hacker per day, so a 150-person weekend runs around 450 cups. Send your dates, venue and registration count and we'll have a price back to you by the next business day.",
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
      "A drip coffee station for NYC tech meetups of 20 to 200 people, ready before doors open and packed out after. Quote by the next business day.",
    h1: "Coffee catering for tech meetups in NYC",
    answer:
      "We run the coffee table at tech meetups across New York City. The station is set up and the first batch brewed before doors open, and we're packed out when the room clears. For a 60-person evening meetup that's about 90 cups. Send your date, venue and RSVP count for a quote.",
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
    title: "Tech Conference Coffee Service in NYC",
    description:
      "Drip coffee for NYC tech conferences, with batches timed to registration and session breaks. Multi-day events quoted per day.",
    h1: "Coffee service for tech conferences in NYC",
    answer:
      "We provide drip coffee service for tech conferences in New York City, with batches timed to registration and the breaks between sessions, which is when the lines form. Multi-day events are planned and quoted per day. Send your dates, venue and expected attendance and we'll reply by the next business day.",
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
    title: "Demo Day Coffee Catering in NYC",
    description:
      "Coffee brewed on site for startup demo days, pitch nights and investor events in New York City. Set up and cleanup included.",
    h1: "Coffee catering for demo days and pitch events",
    answer:
      "We cater startup demo days, pitch nights and investor events in New York City. Investors and founders walk in to coffee that was brewed on site, not a lukewarm urn from the morning. A 100-guest demo day needs about 150 cups. Send your date, venue and guest list size for a quote.",
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
    title: "Team Offsite Coffee Catering in NYC",
    description:
      "Drip coffee for engineering offsites, all-hands and company events at your NYC office or venue. One vendor, one quote, one invoice.",
    h1: "Coffee catering for team offsites and company events",
    answer:
      "We bring drip coffee to engineering offsites, all-hands meetings and company events anywhere in New York City: your office, a rented loft or an event space. One vendor, one quote, one invoice. Send your date, location and headcount and we'll price it by the next business day.",
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
