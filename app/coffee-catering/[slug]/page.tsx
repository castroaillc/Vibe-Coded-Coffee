import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/BookingForm";
import { GUIDE_PATH, SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { planCoffee } from "@/lib/coffee-plan";
import { eventPagePath, eventPages, findEventPage } from "@/lib/event-pages";
import { eventServiceJsonLd, jsonLdScript } from "@/lib/schema";
import { faqs as generalFaqs, services, site } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => eventPages.map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const page = findEventPage((await params).slug);
  if (!page) return {};
  const path = eventPagePath(page.slug);
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: path },
    openGraph: { type: "website", url: path, title: `${page.title} | ${site.name}`, description: page.description, images: ["/opengraph-image.png"] },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const page = findEventPage((await params).slug);
  if (!page) notFound();
  const path = eventPagePath(page.slug);
  const plural = `${page.eventType.toLowerCase()}s`;
  const example = planCoffee(page.exampleGuests, page.exampleDays);
  const sizes = [page.exampleGuests / 2, page.exampleGuests, page.exampleGuests * 2].map((g) => planCoffee(Math.round(g), page.exampleDays));
  // Page FAQ plus the general ones every organizer asks (booking lead time, service area).
  const faqs = [...page.faqs, ...generalFaqs.filter((f) => /advance|Where do you cater/.test(f.q))];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Coffee catering", path: "/coffee-catering" },
    { name: page.name, path },
  ];
  const jsonLd = eventServiceJsonLd({ path, name: page.name, description: page.description, audience: `${page.eventType} organizers`, faqs, crumbs });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(jsonLd)} />
      <a className="skip" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <section className="page-hero" aria-labelledby="page-title">
          <div className="container container--narrow">
            <nav className="crumbs" aria-label="Breadcrumb">
              <ol>
                {crumbs.map((c, i) => (
                  <li key={c.path}>{i < crumbs.length - 1 ? <Link href={c.path}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>
                ))}
              </ol>
            </nav>
            <p className="kicker kicker--blue">Coffee catering · New York City</p>
            <h1 id="page-title" className="page-hero__title">{page.h1}</h1>
            <p className="lede lede--light page-hero__answer">{page.answer}</p>
            <div className="page-hero__actions">
              <a className="btn" href="#book">Get a quote</a>
              <Link className="btn btn--ghost" href={GUIDE_PATH}>How much coffee do I need?</Link>
            </div>
          </div>
        </section>

        <section className="section section--cream" aria-labelledby="why-title">
          <div className="container">
            <h2 id="why-title" className="h2">Why organizers book us for {plural}</h2>
            <ul className="perks perks--page">
              {page.why.map((w) => (
                <li key={w.title} className="perk">
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="section section--white" aria-labelledby="plan-title">
          <div className="container container--narrow">
            <h2 id="plan-title" className="h2">How much coffee for a {page.eventType.toLowerCase()}?</h2>
            <p className="lede">
              {page.planning} For example, {page.exampleGuests} guests over {page.exampleDays} {page.exampleDays === 1 ? "day" : "days"} works out to about{" "}
              {example.cups} twelve-ounce cups, roughly {example.gallons} gallons of coffee brewed from {example.lb} lb of ground coffee.
            </p>
            <table className="plan-table">
              <caption>Estimated coffee for a {page.eventType.toLowerCase()} ({page.exampleDays} {page.exampleDays === 1 ? "day" : "days"}, about 1.5 cups per guest per day)</caption>
              <thead><tr><th scope="col">Guests</th><th scope="col">12 oz cups</th><th scope="col">Gallons</th><th scope="col">Ground coffee</th></tr></thead>
              <tbody>
                {sizes.map((s) => (
                  <tr key={s.guests}><th scope="row">{s.guests}</th><td>{s.cups}</td><td>{s.gallons}</td><td>{s.lb} lb</td></tr>
                ))}
              </tbody>
            </table>
            <p className="plan-note">Try your own numbers in our <Link href={GUIDE_PATH}>event coffee calculator</Link>.</p>

            <h2 className="h2 plan-included">What&apos;s included</h2>
            <ul className="included">
              {services.map((s) => <li key={s.title}><strong>{s.title}.</strong> {s.body}</li>)}
            </ul>
          </div>
        </section>

        <section className="section section--cream" id="book" aria-labelledby="book-title">
          <div className="container book">
            <div>
              <p className="kicker kicker--blue">Get a quote</p>
              <h2 id="book-title" className="h2">Book coffee for your {page.eventType.toLowerCase()}</h2>
              <p className="lede">Tell us the date, venue and headcount. We reply within one business day with a price and what&apos;s included.</p>
              <p className="book__contact">Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a></p>
            </div>
            <BookingForm defaultEventType={page.eventType} />
          </div>
        </section>

        <section className="section section--white" id="faq" aria-labelledby="faq-title">
          <div className="container faq-layout">
            <div>
              <h2 id="faq-title" className="h2">{page.eventType} coffee questions</h2>
              <p className="faq-layout__note">Something else? Email <a href={`mailto:${site.email}`}>{site.email}</a></p>
            </div>
            <div className="faq">
              {faqs.map((f, i) => (
                <details key={f.q} open={i === 0}>
                  <summary><h3>{f.q}</h3></summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--cream related" aria-labelledby="related-title">
          <div className="container">
            <h2 id="related-title" className="h2">Other events we cater</h2>
            <ul className="related__list">
              {eventPages.filter((p) => p.slug !== page.slug).map((p) => (
                <li key={p.slug}><Link href={eventPagePath(p.slug)}>{p.name}</Link><span>{p.description.split(". ")[0]}.</span></li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
