import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_PATH, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/schema";
import { bookingSteps, catering, site } from "@/lib/site";

const title = "Coffee Catering for Tech Events in NYC";
const description =
  "Coffee catering for NYC tech events: hackathons, meetups, conferences, demo days and offsites. Drip coffee brewed on site. Quote by the next business day.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/coffee-catering" },
  openGraph: { type: "website", url: "/coffee-catering", title: `${title} | ${site.name}`, description, images: ["/opengraph-image.png"] },
};

export default function CoffeeCatering() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Coffee catering", path: "/coffee-catering" }]),
      {
        "@type": "ItemList",
        name: "Coffee catering by type of tech event",
        itemListElement: eventPages.map((p, i) => ({ "@type": "ListItem", position: i + 1, name: p.name, url: `${site.url}${eventPagePath(p.slug)}` })),
      },
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
            <p className="kicker kicker--blue">Coffee catering · New York City</p>
            <h1 id="page-title" className="page-hero__title">Coffee catering for tech events in NYC</h1>
            <p className="lede lede--light page-hero__answer">
              {site.name} is a New York City coffee caterer that only does tech events: hackathons, meetups, conferences, demo days and team
              offsites. {catering.summary}
            </p>
            <div className="page-hero__actions">
              <Link className="btn" href="/#book">Get a quote</Link>
              <Link className="btn btn--ghost" href={GUIDE_PATH}>Coffee calculator</Link>
            </div>
          </div>
        </section>

        <section className="section section--cream" aria-labelledby="types-title">
          <div className="container">
            <h2 id="types-title" className="h2">Pick your event</h2>
            <ul className="event-cards">
              {eventPages.map((p) => (
                <li key={p.slug}>
                  <Link href={eventPagePath(p.slug)} className="event-card">
                    <h3>{p.name}</h3>
                    <p>{p.description.split(". ").slice(0, 2).join(". ")}.</p>
                    <span className="event-card__more">See details →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--white" aria-labelledby="how-title">
          <div className="container">
            <h2 id="how-title" className="h2">How booking works</h2>
            <ol className="steps">
              {bookingSteps.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step__num" aria-hidden="true">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
