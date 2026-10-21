import { requireAdmin } from "@/lib/admin/auth";
import { listLeads } from "@/lib/admin/data";

export const dynamic = "force-dynamic";

const csvCell = (v: unknown) => {
  const s = v instanceof Date ? v.toISOString() : v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * CSV of people you may contact, ready to import into an email or SMS tool.
 * ?list=email → opted-in emails · ?list=sms → opted-in phones (with consent proof) · ?list=all → everything
 */
export async function GET(req: Request) {
  await requireAdmin();
  const list = new URL(req.url).searchParams.get("list") ?? "email";
  const all = await listLeads();
  const rows =
    list === "sms"
      ? all.filter((l) => l.phone && l.smsConsent && !l.smsOptOutAt)
      : list === "all"
        ? all
        : all.filter((l) => l.email && l.emailConsent && !l.emailOptOutAt);

  const cols =
    list === "sms"
      ? (["firstName", "phone", "smsConsentAt", "smsConsentText", "consentIp", "utmSource", "utmCampaign", "createdAt"] as const)
      : list === "all"
        ? (["firstName", "email", "phone", "emailConsent", "emailOptOutAt", "smsConsent", "smsConsentAt", "smsOptOutAt", "source", "utmSource", "utmMedium", "utmCampaign", "utmContent", "qrCode", "createdAt"] as const)
        : (["firstName", "email", "emailConsentAt", "utmSource", "utmCampaign", "createdAt"] as const);

  const csv = [cols.join(","), ...rows.map((r) => cols.map((c) => csvCell(r[c])).join(","))].join("\n");
  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="vibe-coded-${list}-list-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
