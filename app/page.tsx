import Image from "next/image";
import { Icon } from "@/components/Icons";
import { LoopVideo } from "@/components/LoopVideo";
import { Spinner } from "@/components/Spinner";
import { WaitlistForm } from "@/components/WaitlistForm";
import { images, mediaSrc, videos } from "@/lib/media";
import { allVerbs, formatPrice, menu } from "@/lib/menu";
import { buildJsonLd } from "@/lib/schema";
import { audiences, craft, faqs, offer, perks, site, steps } from "@/lib/site";

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

      <header className="nav">
        <div className="container nav__inner">
          <a href="/" className="nav__logo" aria-label={`${site.name} home`}>
            <Image src="/brand/logo-oneline-on-dark.svg" alt={site.name} width={238} height={34} priority unoptimized />
          </a>
          <nav aria-label="Main">
            <ul className="nav__links">
              <li><a href="#craft">The coffee</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="#membership">Membership</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </nav>
          <a href="#waitlist" className="btn btn--ghost btn--sm">Join the waitlist</a>
        </div>
      </header>

      <main id="main">
        {/* ── Hero ───────────────────────────────── */}
        <section className="hero" id="waitlist" aria-labelledby="hero-title">
          <Image
            className="hero__bg"
            src={mediaSrc(images.heroCafe.file)}
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <div className="container hero__inner">
            <div className="hero__copy">
              <p className="kicker">Good coffee<br />Better builders</p>
              <h1 id="hero-title">
                <span className="hero__title">Fuel for what&apos;s next</span>
                <span className="hero__sub">
                  A specialty coffee shop and workspace for builders, opening soon in {site.locationLabel}. Join the
                  waitlist and your first month of the Vibe Coded membership is free.
                </span>
              </h1>
              <WaitlistForm source="hero" tone="dark" />
            </div>
          </div>
        </section>

        {/* ── Quick facts (answer-first, easy for AI engines to cite) ── */}
        <section className="facts" aria-labelledby="facts-title">
          <div className="container">
            <h2 id="facts-title" className="sr-only">Vibe Coded Coffee at a glance</h2>
            <dl className="facts__list">
              <div><dt>What</dt><dd>Specialty coffee shop &amp; workspace</dd></div>
              <div><dt>Where</dt><dd>{site.locationLabel}</dd></div>
              <div><dt>When</dt><dd>Opening soon</dd></div>
              <div><dt>The offer</dt><dd>{offer.short} for waitlist members</dd></div>
              <div><dt>Cost to join</dt><dd>Free, no card needed</dd></div>
            </dl>
          </div>
        </section>

        {/* ── Craft ──────────────────────────────── */}
        <section className="craft" id="craft" aria-labelledby="craft-title">
          <div className="container">
            <div className="split-head">
              <h2 id="craft-title" className="h2">From bean to cup</h2>
              <p className="lede">
                Small-batch beans, ground to order and brewed by people who sweat the details, the same way you do
                with what you ship.
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

        {/* ── Menu ───────────────────────────────── */}
        <section className="menu" id="menu" aria-labelledby="menu-title">
          <div className="container">
            <div className="menu__head">
              <div>
                <h2 id="menu-title" className="h2 h2--light">The menu</h2>
                <Spinner verbs={allVerbs} />
              </div>
              <p className="lede lede--light">
                Every drink is named for what you&apos;re doing while we make it. Latte art comes in{" "}
                <code>{"{ }"}</code>, <code>{"</>"}</code> and the occasional semicolon.
              </p>
            </div>

            <div className="menu__board">
              <p className="menu__bar" aria-hidden="true">~/vibe-coded/menu</p>
              <div className="menu__cols">
                {menu.map((section) => (
                  <section key={section.id} className="menu__col" aria-labelledby={`menu-${section.id}`}>
                    <h3 id={`menu-${section.id}`} className="menu__title">{section.title}</h3>
                    <p className="menu__blurb">{section.blurb}</p>
                    <ul>
                      {section.items.map((item) => (
                        <li key={item.verb} className="menu__item">
                          <div className="menu__line">
                            <span className="menu__verb">
                              <span className="menu__glyph" aria-hidden="true">✻</span>
                              {item.verb}…
                            </span>
                            <span className="menu__dots" aria-hidden="true" />
                            <span className="menu__price">${formatPrice(item.price)}</span>
                          </div>
                          <p className="menu__desc">
                            <span className="menu__name">{item.name}.</span> {item.note}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            </div>
            <p className="menu__foot">Oat, almond or whole milk at no extra charge. Menu and prices may change before opening day.</p>
          </div>
        </section>

        {/* ── Membership ─────────────────────────── */}
        <section className="section section--cream" id="membership" aria-labelledby="membership-title">
          <div className="container">
            <div className="split-head">
              <h2 id="membership-title" className="h2">What&apos;s in the membership</h2>
              <p className="lede">
                One monthly membership for your coffee, your workspace and your people. Join the waitlist and the first
                month is on us.
              </p>
            </div>
            <ul className="perks">
              {perks.map((p) => (
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
              <p className="kicker kicker--blue">Opening soon</p>
              <h2 id="space-title" className="h2 h2--light">A space for curious minds</h2>
              <p className="lede lede--light">
                Long tables, good light and power at every seat. Come in for the coffee, stay for the people building
                next to you.
              </p>
              <ul className="pills" aria-label="Who it's for">
                {audiences.map((a) => <li key={a}>{a}</li>)}
              </ul>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────── */}
        <section className="section section--white" id="how-it-works" aria-labelledby="how-title">
          <div className="container">
            <h2 id="how-title" className="h2">How to get your free month</h2>
            <ol className="steps">
              {steps.map((s, i) => (
                <li key={s.title} className="step">
                  <span className="step__num" aria-hidden="true">{i + 1}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ────────────────────────────────── */}
        <section className="section section--cream" id="faq" aria-labelledby="faq-title">
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

        {/* ── Final CTA ──────────────────────────── */}
        <section className="cta" aria-labelledby="cta-title">
          <Image
            className="cta__bg"
            src={mediaSrc(images.pourOver.file)}
            alt=""
            width={images.pourOver.width}
            height={images.pourOver.height}
            sizes="100vw"
          />
          <div className="container container--narrow cta__inner">
            <h2 id="cta-title" className="h2 h2--light">{offer.headline}</h2>
            <p className="lede lede--light">{offer.summary}</p>
            <WaitlistForm source="footer" tone="dark" />
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <Image src="/brand/logo-oneline-on-dark.svg" alt={site.name} width={210} height={30} unoptimized />
          <ul className="footer__links">
            <li>{site.locationLabel}</li>
            <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
            <li><a href={site.social.instagram} rel="me noopener" target="_blank">Instagram</a></li>
          </ul>
          <p className="footer__small">© {new Date().getFullYear()} {site.name}. Last updated {site.lastUpdated}.</p>
        </div>
      </footer>
    </>
  );
}
