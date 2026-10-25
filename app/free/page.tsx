import type { Metadata } from "next";
import Image from "next/image";
import { FreeCoffeeForm } from "@/components/FreeCoffeeForm";
import { site } from "@/lib/site";
import "./free.css";

export const metadata: Metadata = {
  title: "Free coffee",
  description: `Grab a free coffee from ${site.name}. Join the list with your email or phone.`,
  alternates: { canonical: "/free" },
  // Landing page for printed QR codes, not for search results.
  robots: { index: false, follow: true },
};

export default function FreeCoffee() {
  return (
    <div className="free">
      <main className="free__main" id="main">
        <Image className="free__logo" src="/brand/logo-horizontal-on-light.svg" alt={site.name} width={200} height={53} priority unoptimized />
        <p className="free__kicker">Free coffee</p>
        <h1 className="free__title">Your coffee&apos;s on us.</h1>
        <p className="free__lede">
          Join the Vibe Coded list with your email or phone, then show the next screen at the coffee station. You&apos;ll also hear first
          about our events.
        </p>
        <FreeCoffeeForm />
      </main>
      <footer className="free__foot">
        <a href="/">{site.url.replace(/^https?:\/\//, "")}</a>
        <span aria-hidden="true">·</span>
        <a href="/privacy">Privacy &amp; SMS terms</a>
      </footer>
    </div>
  );
}
