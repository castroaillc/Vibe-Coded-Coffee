import { catering, faqs, offer, site } from "./site";

/** Structured data (schema.org JSON-LD) so search engines and AI answer
 *  engines can understand the business, the catering service, the storefront offer and the FAQ. */
export function buildJsonLd() {
  const orgId = `${site.url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FoodEstablishment",
        "@id": orgId,
        name: site.name,
        url: site.url,
        logo: `${site.url}/brand/icon-512.png`,
        image: `${site.url}/opengraph-image.png`,
        description: site.description,
        slogan: site.tagline,
        email: site.email,
        servesCuisine: ["Coffee"],
        makesOffer: { "@id": `${site.url}/#catering` },
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
        "@type": "Service",
        "@id": `${site.url}/#catering`,
        name: catering.name,
        serviceType: "Coffee catering",
        description: catering.summary,
        provider: { "@id": orgId },
        areaServed: { "@type": "City", name: site.serviceArea },
        audience: { "@type": "BusinessAudience", name: "Tech event organizers" },
        url: `${site.url}/#book`,
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
        name: `${site.name} — ${catering.short}`,
        description: site.description,
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
