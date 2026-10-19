import { formatPrice, menu } from "./menu";
import { faqs, offer, site } from "./site";

/** Structured data (schema.org JSON-LD) so search engines and AI answer
 *  engines can understand the business, the offer and the FAQ. */
export function buildJsonLd() {
  const orgId = `${site.url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CafeOrCoffeeShop",
        "@id": orgId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/brand/icon-512.png`,
        image: `${site.url}/opengraph-image.png`,
        description: site.description,
        slogan: site.tagline,
        email: site.email,
        servesCuisine: ["Coffee", "Matcha", "Tea", "Pastries"],
        hasMenu: { "@id": `${site.url}/#menu` },
        address: {
          "@type": "PostalAddress",
          addressLocality: site.city,
          addressRegion: site.region,
          addressCountry: site.country,
        },
        areaServed: { "@type": "City", name: "New York City" },
        sameAs: Object.values(site.social),
      },
      {
        "@type": "Menu",
        "@id": `${site.url}/#menu`,
        name: `${site.name} menu`,
        url: `${site.url}/#menu`,
        hasMenuSection: menu.map((section) => ({
          "@type": "MenuSection",
          name: section.title,
          description: section.blurb,
          hasMenuItem: section.items.map((item) => ({
            "@type": "MenuItem",
            name: `${item.verb}… (${item.name})`,
            description: item.note,
            offers: { "@type": "Offer", price: formatPrice(item.price), priceCurrency: "USD" },
          })),
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.name,
        publisher: { "@id": orgId },
        inLanguage: "en-US",
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}/#webpage`,
        url: site.url,
        name: `${offer.short} — ${site.name} pre-launch waitlist`,
        description: offer.summary,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": orgId },
        dateModified: site.lastUpdated,
      },
      {
        "@type": "Offer",
        "@id": `${site.url}/#offer`,
        name: offer.name,
        description: offer.summary,
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/PreOrder",
        url: `${site.url}/#waitlist`,
        seller: { "@id": orgId },
        eligibleRegion: { "@type": "City", name: "New York City" },
      },
      {
        "@type": "FAQPage",
        "@id": `${site.url}/#faq`,
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };
}
