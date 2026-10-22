import type { Metadata } from "next";
import Link from "next/link";
import { CoffeeCalculator } from "@/components/CoffeeCalculator";
import { GUIDE_PATH, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { planCoffee } from "@/lib/coffee-plan";
import { eventPagePath } from "@/lib/event-pages";
import { breadcrumbJsonLd, faqJsonLd, jsonLdScript } from "@/lib/schema";
import { site } from "@/lib/site";

const title = "How Much Coffee for an Event? Calculator";
const description =
  "Plan 1.5 twelve-ounce cups of coffee per guest per day. Free calculator and table for 25 to 500 guests: cups, gallons and pounds of ground coffee.";
const path = GUIDE_PATH;
const hundred = planCoffee(100, 1);
const hack = planCoffee(150, 2);

const faqs = [
  { q: "How much coffee do I need for 100 people?", a: `About ${hundred.cups} twelve-ounce cups, which is roughly ${hundred.gallons} gallons of brewed coffee made from ${hundred.lb} lb of ground coffee, assuming 1.5 cups per person.` },
  { q: "How much coffee do I need for a hackathon?", a: `Plan per day of hacking. A 150-person, two-day hackathon needs about ${hack.cups} cups (${hack.gallons} gallons, ${hack.lb} lb of ground coffee) at 1.5 cups per hacker per day.` },
  { q: "How many cups of coffee does one pound make?", a: "At a 16:1 water-to-coffee ratio, one pound of ground coffee brews about 20 twelve-ounce cups." },
  { q: "Should I order decaf?", a: "For evening events, many organizers order a smaller pot of decaf alongside regular coffee. Ask your caterer to include it." },
];

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: path },
  openGraph: { type: "article", url: path, title, description, images: ["/opengraph-image.png"] },
};

const SIZES = [25, 50, 100, 150, 200, 300, 500];

export default function Guide() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${site.url}${path}#article`,
        headline: "How much coffee do you need for an event?",
        description,
        url: `${site.url}${path}`,
        dateModified: site.lastUpdated,
        author: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name },
        publisher: { "@type": "Organization", "@id": `${site.url}/#organization`, name: site.name },
      },
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "How much coffee for an event", path }]),
      faqJsonLd(path, faqs),
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <a className="skip" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <section className="page-hero" aria-labelledby="page-title">
          <div className="container container--narrow">
            <p className="kicker kicker--blue">Event planning guide</p>
            <h1 id="page-title" className="page-hero__title">How much coffee do you need for an event?</h1>
            <p className="lede lede--light page-hero__answer">
              Plan about <strong>1.5 cups of coffee (12 oz) per guest for each event day</strong>. For 100 guests that&apos;s about {hundred.cups} cups,
              roughly {hundred.gallons} gallons, brewed from {hundred.lb} lb of ground coffee. For multi-day events like hackathons, multiply by the
              number of days.
            </p>
          </div>
        </section>

        <section className="section section--white" aria-labelledby="calc-title">
          <div className="container container--narrow">
            <h2 id="calc-title" className="h2">Event coffee calculator</h2>
            <CoffeeCalculator />

            <h2 className="h2 guide__h2">Coffee for 25 to 500 guests</h2>
            <table className="plan-table">
              <caption>One-day event at 1.5 cups per guest, 12 oz cups, 16:1 water-to-coffee ratio</caption>
              <thead><tr><th scope="col">Guests</th><th scope="col">12 oz cups</th><th scope="col">Gallons</th><th scope="col">Ground coffee</th></tr></thead>
              <tbody>
                {SIZES.map((g) => {
                  const r = planCoffee(g, 1);
                  return <tr key={g}><th scope="row">{g}</th><td>{r.cups}</td><td>{r.gallons}</td><td>{r.lb} lb</td></tr>;
                })}
              </tbody>
            </table>

            <h2 className="h2 guide__h2">How to adjust for your event</h2>
            <ul className="included">
              <li><strong>Morning events and early keynotes:</strong> people drink more coffee before noon. Plan toward 2 cups per guest.</li>
              <li><strong>Evening meetups:</strong> plan closer to 1 cup per guest and add a pot of decaf.</li>
              <li><strong>Hackathons:</strong> count each day of hacking separately, and tell your caterer about overnight hours. See <Link href={eventPagePath("hackathons")}>hackathon coffee catering</Link>.</li>
              <li><strong>Conferences:</strong> coffee demand spikes at registration and breaks, so the total matters less than having enough ready at those times. See <Link href={eventPagePath("conferences")}>conference coffee service</Link>.</li>
            </ul>

            <h2 className="h2 guide__h2">Questions</h2>
            <div className="faq">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><h3>{f.q}</h3></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>

            <div className="guide__cta">
              <p>Planning a tech event in New York City? {site.name} brings the coffee, sets up and cleans up.</p>
              <Link className="btn" href="/coffee-catering">See coffee catering for your event</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
