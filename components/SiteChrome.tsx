import Image from "next/image";
import Link from "next/link";
import { eventPagePath, eventPages } from "@/lib/event-pages";
import { site } from "@/lib/site";

export const GUIDE_PATH = "/guides/how-much-coffee-for-an-event";

/** Top bar shared by the home page and the event / guide pages. Links use "/#…" so they work from any page. */
export function SiteHeader() {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <Link href="/" className="nav__logo" aria-label={`${site.name} home`}>
          <Image src="/brand/logo-oneline-on-dark.svg" alt={site.name} width={231} height={34} unoptimized />
        </Link>
        <nav aria-label="Main">
          <ul className="nav__links">
            <li><Link href="/#pricing">Pricing</Link></li>
            <li><Link href="/coffee-catering">Events we cater</Link></li>
            <li><Link href="/#services">What&apos;s included</Link></li>
            <li><Link href={GUIDE_PATH}>Coffee calculator</Link></li>
            <li><Link href="/#faq">FAQ</Link></li>
          </ul>
        </nav>
        <Link href="/#pricing" className="btn btn--ghost btn--sm">See my price</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <Image src="/brand/logo-oneline-on-dark.svg" alt={site.name} width={204} height={30} unoptimized />
        <ul className="footer__links">
          <li>{site.locationLabel}</li>
          <li><a href={`mailto:${site.email}`}>{site.email}</a></li>
          <li><a href={site.social.instagram} rel="me noopener" target="_blank">Instagram</a></li>
          <li><Link href="/privacy">Privacy</Link></li>
        </ul>
        <nav className="footer__events" aria-label="Coffee catering by event">
          <Link href="/coffee-catering">Coffee catering in NYC</Link>
          {eventPages.map((p) => <Link key={p.slug} href={eventPagePath(p.slug)}>{p.name}</Link>)}
          <Link href={GUIDE_PATH}>How much coffee for an event</Link>
        </nav>
        <noscript>
          <p className="footer__small">
            <a href="/">Home</a> · <a href="/coffee-catering">Coffee catering</a> · <a href="/coffee-catering/hackathons">Hackathons</a> ·{" "}
            <a href="/#pricing">Pricing</a> · <a href="/#book">Book us</a> · <a href={GUIDE_PATH}>Coffee calculator</a> · <a href="/llms.txt">llms.txt</a>
          </p>
        </noscript>
        <p className="footer__small">© {new Date().getFullYear()} {site.name}. Last updated {site.lastUpdated}.</p>
      </div>
    </footer>
  );
}
