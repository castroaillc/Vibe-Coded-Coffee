import { audiences, bookingSteps, catering, faqs, offer, services, site } from "@/lib/site";

// /llms.txt — a plain-text summary written for AI assistants and answer engines.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${site.name}

> ${site.description}

## Key facts
- Name: ${site.name}
- What: ${catering.name} (drip coffee)
- Where: ${site.serviceArea}, based in ${site.locationLabel}
- Events: ${audiences.join(", ")}
- Pricing: custom quote, reply within one business day
- Tagline: ${site.tagline}
- Coming soon: ${offer.summary}
- Website: ${site.url}
- Contact: ${site.email}
- Last updated: ${site.lastUpdated}

## What's included
${services.map((p) => `- ${p.title}: ${p.body}`).join("\n")}

## How booking works
${bookingSteps.map((s, i) => `${i + 1}. ${s.title} — ${s.body}`).join("\n")}

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Links
- [Book us for your event](${site.url}/#book)
- [What's included](${site.url}/#services)
- [Storefront waitlist](${site.url}/#waitlist)
- [FAQ](${site.url}/#faq)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
