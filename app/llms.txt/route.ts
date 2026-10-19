import { formatPrice, menu } from "@/lib/menu";
import { audiences, faqs, offer, perks, site, steps } from "@/lib/site";

// /llms.txt — a plain-text summary written for AI assistants and answer engines.
export const dynamic = "force-static";

export function GET() {
  const body = `# ${site.name}

> ${site.description}

## Key facts
- Name: ${site.name}
- What: Specialty coffee shop and workspace for builders
- Location: ${site.locationLabel} (opening soon)
- Tagline: ${site.tagline}
- Pre-launch offer: ${offer.summary}
- Cost to join the waitlist: Free, no credit card needed
- For: ${audiences.join(", ")}
- Website: ${site.url}
- Contact: ${site.email}
- Last updated: ${site.lastUpdated}

## The Vibe Coded membership
${perks.map((p) => `- ${p.title}: ${p.body}`).join("\n")}

## Menu
Every item is named after a "spinner verb" (the word a terminal shows while it works). Prices in USD.
${menu
  .map((s) => `### ${s.title}\n${s.items.map((i) => `- ${i.verb}… — ${i.name}: ${i.note} ($${formatPrice(i.price)})`).join("\n")}`)
  .join("\n\n")}

## How to get the free month
${steps.map((s, i) => `${i + 1}. ${s.title} — ${s.body}`).join("\n")}

## FAQ
${faqs.map((f) => `### ${f.q}\n${f.a}`).join("\n\n")}

## Links
- [Join the waitlist](${site.url}/#waitlist)
- [Menu](${site.url}/#menu)
- [Membership](${site.url}/#membership)
- [FAQ](${site.url}/#faq)
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
