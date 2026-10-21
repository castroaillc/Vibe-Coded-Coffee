import { GUIDE_PATH } from "@/components/SiteChrome";
import { planCoffee } from "@/lib/coffee-plan";
import { eventPagePath, eventPages } from "@/lib/event-pages";
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

## Coffee catering by event type
${eventPages.map((p) => `### ${p.name}\n${p.answer}\nPage: ${site.url}${eventPagePath(p.slug)}`).join("\n\n")}

## How much coffee to plan
Plan about 1.5 twelve-ounce cups per guest per event day (16:1 water-to-coffee ratio).
${[50, 100, 200, 500].map((g) => { const r = planCoffee(g); return `- ${g} guests: ${r.cups} cups, about ${r.gallons} gallons, ${r.lb} lb ground coffee`; }).join("\n")}
- Multi-day events such as hackathons: multiply by the number of days.
Calculator: ${site.url}${GUIDE_PATH}

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Links
- [Book us for your event](${site.url}/#book)
- [Coffee catering for tech events in NYC](${site.url}/coffee-catering)
${eventPages.map((p) => `- [${p.name}](${site.url}${eventPagePath(p.slug)})`).join("\n")}
- [How much coffee for an event (calculator)](${site.url}${GUIDE_PATH})
- [What's included](${site.url}/#services)
- [Storefront waitlist](${site.url}/#waitlist)
- [FAQ](${site.url}/#faq)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
