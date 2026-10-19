// Seeds the next 4 weeks of the sample events from lib/app-data.ts into Neon.
// Run: pnpm db:seed   (safe to re-run: existing ids are skipped)
try {
  process.loadEnvFile(".env.local");
} catch {}

import { events } from "../lib/app-data";
import { SHOP_TZ } from "../lib/server/ids";

/** A wall-clock time in the shop's time zone → a real Date. */
function zoned(dateYmd: string, hhmm: string): Date {
  const guess = new Date(`${dateYmd}T${hhmm}:00Z`);
  const part = new Intl.DateTimeFormat("en-US", { timeZone: SHOP_TZ, timeZoneName: "shortOffset" })
    .formatToParts(guess)
    .find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = part.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  const offsetMin = m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0)) : 0;
  return new Date(guess.getTime() - offsetMin * 60_000);
}

async function main() {
  const { db, schema } = await import("../lib/db");
  const today = new Date(new Date().toLocaleDateString("en-CA", { timeZone: SHOP_TZ }) + "T12:00:00Z");
  const rows = [];
  for (let week = 0; week < 4; week++) {
    for (const e of events) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() + ((e.weekday - d.getUTCDay() + 7) % 7) + week * 7);
      const ymd = d.toISOString().slice(0, 10);
      const startsAt = zoned(ymd, e.start);
      rows.push({
        id: `${e.id}-${ymd}`,
        title: e.title,
        verb: e.verb,
        startsAt,
        endsAt: new Date(startsAt.getTime() + e.minutes * 60_000),
        body: e.body,
        spots: e.spots,
      });
    }
  }
  const inserted = await db.insert(schema.event).values(rows).onConflictDoNothing().returning({ id: schema.event.id });
  console.log(`Seeded ${inserted.length} events (${rows.length - inserted.length} already existed).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
