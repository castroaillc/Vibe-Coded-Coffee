import type { Metadata } from "next";
import Link from "next/link";
import { GUIDE_PATH, SiteFooter, SiteHeader } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className="page-hero" aria-labelledby="page-title">
          <div className="container container--narrow">
            <p className="kicker kicker--blue">404</p>
            <h1 id="page-title" className="page-hero__title">This page isn&apos;t here</h1>
            <p className="lede lede--light page-hero__answer">The link may be old, or the address has a typo. These are probably what you were after:</p>
            <div className="page-hero__actions">
              <Link className="btn" href="/">Back to the homepage</Link>
              <Link className="btn btn--ghost" href="/coffee-catering">Coffee catering</Link>
              <Link className="btn btn--ghost" href={GUIDE_PATH}>Coffee calculator</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
