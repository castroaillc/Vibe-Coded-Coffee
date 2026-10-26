import Image from "next/image";
import { Icon } from "@/components/Icons";
import { LoopVideo } from "@/components/LoopVideo";
import { BookingForm } from "@/components/BookingForm";
import { PricingSection } from "@/components/PricingSection";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { images, mediaSrc, videos } from "@/lib/media";
import { buildJsonLd } from "@/lib/schema";
import { audiences, bookingSteps, catering, craft, faqs, offer, services, site, whyUs } from "@/lib/site";
import { startingPrice, usd } from "@/lib/packages";

export default function Home() {
  const jsonLd = buildJsonLd();
  const { grinding } = videos;

  return (
    <>
      <script
        type="application/ld+json"
        // Structured data for Google, Bing and AI answer engines
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <a className="skip" href="#main">Skip to content</a>

      <SiteHeader />

      <main id="main">
        {/* ── Hero ───────────────────────────────── */}
        <section className="hero" id="top" aria-labelledby="hero-title">
          <Image
            className="hero__bg"
            src={mediaSrc(images.pourOver.file)}
            alt=""
            width={images.pourOver.width}
            height={images.pourOver.height}
            priority
            fetchPriority="high"
            sizes="100vw"
          />
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="kicker">Coffee catering<br />for NYC tech events</p>
              <h1 id="hero-title">
                <span className="hero__title">Fuel for what&apos;s next</span>
                <span className="hero__sub">
                  Drip coffee brewed on site at hackathons, meetups, demo days and offsites across {site.serviceArea}.
                  From {usd(startingPrice)}, all-in. See your exact price in seconds, no quote call.
                </span>
              </h1>
              <div className="hero__actions">
                <a href="#pricing" className="btn">See my price <Icon name="arrow" size={16} /></a>
                <a href="#book" className="btn btn--ghost">Check my date</a>
              </div>
              <ul className="hero__proof" aria-label="Why organizers book us">
                <li>From {usd(startingPrice)} all-in</li>
                <li>No travel fees in NYC</li>
                <li>Founder at every event</li>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Quick facts (answer-first, easy for AI engines to cite) ── */}
        <section className="facts" aria-labelledby="facts-title">
          <div className="container">
            <h2 id="facts-title" className="sr-only">Vibe Coded Coffee at a glance</h2>
            <dl className="facts__list">
              <div><dt>What</dt><dd>Drip coffee catering for tech events</dd></div>
              <div><dt>Where</dt><dd>Across {site.serviceArea}</dd></div>
              <div><dt>For</dt><dd>Hackathons, meetups, demo days, offsites</dd></div>
              <div><dt>Pricing</dt><dd>From {usd(startingPrice)}, published and all-in</dd></div>
              <div><dt>Booking</dt><dd>Instant price, date confirmed in 1 business day</dd></div>
            </dl>
          </div>
        </section>

        <PricingSection />

        {/* ── Why us ─────────────────────────────── */}
        <section className="section section--cream" id="why" aria-labelledby="why-title">
          <div className="container">
            <div className="split-head">
              <h2 id="why-title" className="h2">Why tech teams book us</h2>
              <p className="lede">
                Big coffee-cart companies cater weddings, churches and trade shows. We only do tech events, and it shows in
                how we plan, price and staff them.
              </p>
            </div>
            <ul className="perks">
              {whyUs.map((w) => (
                <li key={w.title} className="perk">
                  <h3>{w.title}</h3>
                  <p>{w.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Craft ──────────────────────────────── */}
        <section className="craft" id="craft" aria-labelledby="craft-title">
          <div className="container">
            <div className="split-head">
              <h2 id="craft-title" className="h2">From bean to cup</h2>
              <p className="lede">
                We&apos;re a small team in Brooklyn. Our house blend is a medium roast from Brooklyn Coffee, roasted weekly
                in NYC, ground the morning of your event and brewed on site.
              </p>
            </div>

            <div className="craft__grid">
              <figure className="craft__item craft__item--wide">
                <LoopVideo
                  className="craft__video"
                  src={mediaSrc(grinding.file)}
                  poster={mediaSrc(grinding.poster)}
                  label="Coffee beans pouring into a grinder"
                />
                <figcaption><strong>{craft[0].title}.</strong> {craft[0].body}</figcaption>
              </figure>
              <figure className="craft__item">
                <div className="craft__frame">
                  <Image
                    src={mediaSrc(images.espresso.file)}
                    alt={images.espresso.alt}
                    width={images.espresso.width}
                    height={images.espresso.height}
                    sizes="(max-width: 820px) 100vw, 30vw"
                  />
                </div>
                <figcaption><strong>{craft[1].title}.</strong> {craft[1].body}</figcaption>
              </figure>
              <figure className="craft__item">
                <div className="craft__frame">
                  <Image
                    src={mediaSrc(images.latteArt.file)}
                    alt={images.latteArt.alt}
                    width={images.latteArt.width}
                    height={images.latteArt.height}
                    sizes="(max-width: 820px) 100vw, 30vw"
                  />
                </div>
                <figcaption><strong>{craft[2].title}.</strong> {craft[2].body}</figcaption>
              </figure>
            </div>
          </div>
        </section>


        {/* ── What's included ─────────────────────── */}
        <section className="section section--cream" id="services" aria-labelledby="services-title">
          <div className="container">
            <div className="split-head">
              <h2 id="services-title" className="h2">What&apos;s included</h2>
              <p className="lede">
                Every booking includes the coffee and everything that goes with it. Staffed bookings include one of
                us behind the table.
              </p>
            </div>
            <ul className="perks">
              {services.map((p) => (
                <li key={p.title} className="perk">
                  <span className="perk__icon"><Icon name={p.icon} size={30} /></span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── The space ──────────────────────────── */}
        <section className="space" aria-labelledby="space-title">
          <div className="space__grid">
            <div className="space__photo">
              <Image
                src={mediaSrc(images.builder.file)}
                alt={images.builder.alt}
                width={images.builder.width}
                height={images.builder.height}
                sizes="(max-width: 820px) 100vw, 50vw"
              />
            </div>
            <div className="space__copy">
              <p className="kicker kicker--blue">Built for builders</p>
              <h2 id="space-title" className="h2 h2--light">Coffee that keeps up with your event</h2>
              <p className="lede lede--light">
                A hackathon can kick off at 9 a.m. and wrap with demos the next evening. We plan coffee by the day
                and brew in small batches, so the cup at 2 a.m. isn&apos;t left over from breakfast.
              </p>
              <ul className="pills" aria-label="Events we cater">
                {audiences.map((a) => {
                  const page = eventPages.find((p) => p.eventType.toLowerCase() === a.toLowerCase().replace(/s$/, ""));
                  return <li key={a}>{page ? <a href={eventPagePath(page.slug)}>{a}</a> : a}</li>;
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────── */}
        <section className="section section--white" id="how-it-works" aria-labelledby="how-title">
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

        {/* ── Book us ────────────────────────────── */}
        <section className="section section--cream" id="book" aria-labelledby="book-title">
          <div className="container book">
            <div>
              <p className="kicker kicker--blue">Book us</p>
              <h2 id="book-title" className="h2">Book us for your event</h2>
              <p className="lede">{catering.summary}</p>
              <p className="book__contact">
                Prefer email? Write to <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
            </div>
            <BookingForm />
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────── */}
        <section className="section section--white" id="faq" aria-labelledby="faq-title">
          <div className="container faq-layout">
            <div>
              <h2 id="faq-title" className="h2">Questions</h2>
              <p className="faq-layout__note">
                Something else? Email <a href={`mailto:${site.email}`}>{site.email}</a>
              </p>
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

        {/* ── Storefront coming soon ──────────────── */}
        <section className="cta soon" id="waitlist" aria-labelledby="cta-title">
          <Image
            className="cta__bg"
            src={mediaSrc(images.heroCafe.file)}
            alt=""
            width={images.heroCafe.width}
            height={images.heroCafe.height}
            sizes="100vw"
          />
          <div className="container container--narrow cta__inner">
            <p className="kicker kicker--blue">Coming soon</p>
            <h2 id="cta-title" className="h2 h2--light">{offer.headline}</h2>
            <p className="lede lede--light">{offer.summary}</p>
            <WaitlistForm source="footer" tone="dark" />
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
