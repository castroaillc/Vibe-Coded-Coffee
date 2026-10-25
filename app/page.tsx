import Image from "next/image";
import { Icon } from "@/components/Icons";
import { LoopVideo } from "@/components/LoopVideo";
import { BookingForm } from "@/components/BookingForm";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { images, mediaSrc, videos } from "@/lib/media";
import { buildJsonLd } from "@/lib/schema";
import { audiences, bookingSteps, catering, craft, faqs, packages, packagesNote, services, site } from "@/lib/site";

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
              <p className="kicker">Enterprise coffee catering<br />New York City</p>
              <h1 id="hero-title">
                <span className="hero__title">Coffee catering for teams that build</span>
                <span className="hero__sub">
                  A staffed coffee station, brewed on site at your office or venue anywhere in {site.serviceArea}. For
                  all-hands, client events, conferences, trainings and offsites. Packages from $500.
                </span>
              </h1>
              <div className="hero__actions">
                <a href="#book" className="btn">Get a quote <Icon name="arrow" size={16} /></a>
                <a href="#packages" className="btn btn--ghost">See packages</a>
              </div>
            </div>
          </div>
        </section>

        {/* ── Quick facts (answer-first, easy for AI engines to cite) ── */}
        <section className="facts" aria-labelledby="facts-title">
          <div className="container">
            <h2 id="facts-title" className="sr-only">Vibe Coded Coffee at a glance</h2>
            <dl className="facts__list">
              <div><dt>What</dt><dd>Staffed coffee station, brewed on site</dd></div>
              <div><dt>Where</dt><dd>Offices and venues in all five boroughs</dd></div>
              <div><dt>For</dt><dd>All-hands, client events, conferences, offsites</dd></div>
              <div><dt>Pricing</dt><dd>From $500 for 25 guests</dd></div>
              <div><dt>Quotes</dt><dd>Written quote by the next business day</dd></div>
            </dl>
          </div>
        </section>

        {/* ── Craft ──────────────────────────────── */}
        <section className="craft" id="craft" aria-labelledby="craft-title">
          <div className="container">
            <div className="split-head">
              <h2 id="craft-title" className="h2">From bean to cup</h2>
              <p className="lede">
                We&apos;re a Brooklyn-based team. Our house blend is a medium roast from Brooklyn Coffee, roasted weekly
                in NYC, ground the day of your event and brewed on site at your office or venue.
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
                Every booking includes the coffee, everything that goes with it and one of us behind the table, with
                paperwork that works for your finance team.
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

        {/* ── Packages ───────────────────────────── */}
        <section className="section section--white" id="packages" aria-labelledby="packages-title">
          <div className="container">
            <div className="split-head">
              <h2 id="packages-title" className="h2">Packages</h2>
              <p className="lede">{packagesNote}</p>
            </div>
            <ul className="packages">
              {packages.map((p) => (
                <li key={p.name} className="package">
                  <h3>{p.name}</h3>
                  <p className="package__price">${p.price.toLocaleString("en-US")}</p>
                  <p className="package__meta">Up to {p.guests} guests · {p.hours} hours staffed</p>
                  <p className="package__fits">{p.fits}</p>
                </li>
              ))}
              <li className="package package--custom">
                <h3>Enterprise</h3>
                <p className="package__price">Custom quote</p>
                <p className="package__meta">100+ guests, multi-day or recurring</p>
                <p className="package__fits">Conferences, weekly all-hands, training series</p>
              </li>
            </ul>
            <p className="packages__cta"><a href="#book" className="btn">Get a quote <Icon name="arrow" size={16} /></a></p>
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
              <p className="kicker kicker--blue">Built for busy teams</p>
              <h2 id="space-title" className="h2 h2--light">Coffee that keeps up with your agenda</h2>
              <p className="lede lede--light">
                Registration at 8:30, a keynote at 9, breakout sessions after lunch. We plan batches around your
                schedule so the line stays short and the last cup is as fresh as the first.
              </p>
              <ul className="pills" aria-label="Events we cater">
                {audiences.map((a) => {
                  const page = eventPages.find((p) => p.pills?.includes(a) || p.eventType.toLowerCase() === a.toLowerCase().replace(/s$/, ""));
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
              <p className="kicker kicker--blue">Request a quote</p>
              <h2 id="book-title" className="h2">Get a quote</h2>
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

        {/* ── Closing CTA ────────────────────────── */}
        <section className="cta" id="cta" aria-labelledby="cta-title">
          <Image
            className="cta__bg"
            src={mediaSrc(images.heroCafe.file)}
            alt=""
            width={images.heroCafe.width}
            height={images.heroCafe.height}
            sizes="100vw"
          />
          <div className="container container--narrow cta__inner">
            <p className="kicker kicker--blue">Planning an event?</p>
            <h2 id="cta-title" className="h2 h2--light">Your next all-hands deserves better coffee.</h2>
            <p className="lede lede--light">{catering.summary}</p>
            <p className="cta__actions"><a href="#book" className="btn">Get a quote <Icon name="arrow" size={16} /></a></p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
