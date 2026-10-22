import { QuoteCalculator } from "@/components/admin/QuoteCalculator";
import { requireAdmin } from "@/lib/admin/auth";
import { getEvent, getPricing } from "@/lib/admin/data";

export const metadata = { title: "Quote calculator" };

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ event?: string }> }) {
  await requireAdmin();
  const eventId = (await searchParams).event;
  const [settings, found] = await Promise.all([getPricing(), eventId ? getEvent(eventId) : Promise.resolve(null)]);
  const e = found?.event;
  return (
    <QuoteCalculator
      settings={settings}
      event={e ? { id: e.id, title: e.title, date: e.date, headcount: e.headcount, eventType: e.eventType, quoteCents: e.quoteCents } : null}
    />
  );
}
