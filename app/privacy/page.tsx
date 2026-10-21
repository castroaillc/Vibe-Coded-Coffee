import type { Metadata } from "next";
import { site } from "@/lib/site";
import "../free/free.css";

export const metadata: Metadata = {
  title: "Privacy & SMS terms",
  description: `How ${site.name} uses your email and phone number, and the terms for our text messages.`,
  alternates: { canonical: "/privacy" },
};

// Plain-language policy for the marketing list. Have a lawyer review before relying on it.
export default function Privacy() {
  return (
    <div className="free">
      <main className="free__main legal" id="main">
        <p className="free__kicker"><a href="/">{site.name}</a></p>
        <h1 className="free__title">Privacy &amp; SMS terms</h1>
        <p className="free__lede">Last updated {site.lastUpdated}.</p>

        <h2>What we collect</h2>
        <p>When you join our list we collect your first name (optional), email and/or mobile number, which of our signs or links brought you to us, and the time you agreed to hear from us.</p>

        <h2>How we use it</h2>
        <p>To give you your free coffee, and, if you agreed, to send you emails and/or text messages about our events, offers and the opening of our storefront. We don&apos;t sell your information.</p>

        <h2>Text messages (SMS)</h2>
        <p>If you check the SMS box, {site.name} will send recurring automated marketing texts to the number you gave. Consent is not a condition of any purchase. Message frequency varies. Message and data rates may apply. Reply <strong>STOP</strong> to unsubscribe at any time, or <strong>HELP</strong> for help. Carriers are not liable for delayed or undelivered messages.</p>
        <p>We do not share or sell mobile numbers or SMS opt-in data with third parties or affiliates for their marketing.</p>

        <h2>Email</h2>
        <p>Every marketing email has an unsubscribe link. Unsubscribing stops marketing emails right away.</p>

        <h2>Removing your information</h2>
        <p>Email <a href={`mailto:${site.email}`}>{site.email}</a> and we&apos;ll delete your details from our list.</p>
      </main>
    </div>
  );
}
