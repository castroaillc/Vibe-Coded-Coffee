import Image from "next/image";
import { Icon } from "@/components/Icons";
import { LoopVideo } from "@/components/LoopVideo";
import { BookingForm } from "@/components/BookingForm";
import { WaitlistForm } from "@/components/WaitlistForm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { images, mediaSrc, videos } from "@/lib/media";
import { buildJsonLd } from "@/lib/schema";
import { audiences, bookingSteps, catering, craft, faqs, offer, services, site } from "@/lib/site";

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
              <p className="kicker">Good coffee<br />Better builders</p>
              <h1 id="hero-title">
                <span className="hero__title">Fuel for what&apos;s next</span>
                <span className="hero__sub">
                  Coffee catering for tech events in {site.serviceArea}. We brew drip coffee on site at hackathons,
                  meetups, demo days and offsites, then pack everything out when you&apos;re done.
                </span>
              </h1>
              <div className="hero__actions">
                <a href="#book" className="btn">Book us for your event <Icon name="arrow" size={16} /></a>
                <a href="#waitlist" className="btn btn--ghost">Storefront coming soon</a>
              </div>
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
              <div><dt>Pricing</dt><dd>Quote by the next business day</dd></div>
              <div><dt>Coming soon</dt><dd>Our own storefront, {offer.short.toLowerCase()}</dd></div>
            </dl>
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
