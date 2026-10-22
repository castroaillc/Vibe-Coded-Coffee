import { eventPagePath, eventPages } from "./event-pages";
import { videos } from "./media";
import { catering, faqs, offer, site } from "./site";

/** Structured data (schema.org JSON-LD) so search engines and AI answer
 *  engines can understand the business, the catering service, the storefront offer and the FAQ. */
export function buildJsonLd() {
  const orgId = `${site.url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        // Organization + its local-business subtype, so every parser recognises it.
        "@type": ["Organization", "FoodEstablishment"],
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
        geo: { "@type": "GeoCoordinates", latitude: site.geo.latitude, longitude: site.geo.longitude },
        areaServed: [
          { "@type": "City", name: "New York City" },
          ...site.boroughs.map((name) => ({ "@type": "AdministrativeArea", name, containedInPlace: { "@type": "City", name: "New York City" } })),
        ],
        knowsAbout: ["Coffee catering", "Hackathon catering", "Tech event catering", "Conference coffee service", "Drip coffee"],
        contactPoint: { "@type": "ContactPoint", contactType: "Catering quotes", email: site.email, areaServed: "US-NY", availableLanguage: "English" },
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
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Coffee catering by type of tech event",
          itemListElement: eventPages.map((p) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", "@id": `${site.url}${eventPagePath(p.slug)}#service`, name: p.name, url: `${site.url}${eventPagePath(p.slug)}` },
          })),
        },
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
        "@type": "VideoObject",
        "@id": `${site.url}/#video-grinding`,
        name: "Coffee beans pouring into a grinder",
        description: "Whole coffee beans going into the grinder. We grind on the day of each event.",
        thumbnailUrl: `${site.url}/media/${videos.grinding.poster}`,
        contentUrl: `${site.url}/media/${videos.grinding.file}`,
        uploadDate: "2026-10-19",
        width: videos.grinding.width,
        height: videos.grinding.height,
        isFamilyFriendly: true,
        publisher: { "@id": orgId },
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

// ── Event landing pages and guides ──────────────────────────
type Crumb = { name: string; path: string };

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: `${site.url}${c.path}` })),
  };
}

export function faqJsonLd(path: string, items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": `${site.url}${path}#faq`,
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

/** A catering service page for one kind of event (hackathons, meetups…). */
export function eventServiceJsonLd(p: { path: string; name: string; description: string; audience: string; faqs: { q: string; a: string }[]; crumbs: Crumb[] }) {
  const orgId = `${site.url}/#organization`;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${site.url}${p.path}#service`,
        name: p.name,
        serviceType: "Coffee catering",
        description: p.description,
        provider: { "@type": "FoodEstablishment", "@id": orgId, name: site.name, url: site.url },
        areaServed: { "@type": "City", name: site.serviceArea },
        audience: { "@type": "BusinessAudience", name: p.audience },
        url: `${site.url}${p.path}`,
        potentialAction: { "@type": "ReserveAction", target: `${site.url}${p.path}#book`, name: "Request a quote" },
      },
      {
        "@type": "WebPage",
        "@id": `${site.url}${p.path}#webpage`,
        url: `${site.url}${p.path}`,
        name: p.name,
        description: p.description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}${p.path}#service` },
        dateModified: site.lastUpdated,
      },
      breadcrumbJsonLd(p.crumbs),
      faqJsonLd(p.path, p.faqs),
    ],
  };
}

export const jsonLdScript = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
