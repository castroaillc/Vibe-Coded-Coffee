import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { isQrCode, qrCodes, SCAN_COOKIE } from "@/lib/marketing";
import { id } from "@/lib/server/ids";

// Every scan must hit the server so it can be counted.
export const dynamic = "force-dynamic";

const BOT = /bot|crawl|spider|preview|slurp|facebookexternalhit|whatsapp|telegram|slack|discord/i;

/** Short link printed in QR codes: log the scan, then forward to the landing page with UTM tags. */
export async function GET(req: Request, { params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toLowerCase();
  const url = new URL(req.url);
  if (!isQrCode(code)) return NextResponse.redirect(new URL("/", url), 302);

  const qr = qrCodes[code];
  const dest = new URL(qr.to, url);
  dest.searchParams.set("utm_source", qr.utm.source);
  dest.searchParams.set("utm_medium", qr.utm.medium);
  dest.searchParams.set("utm_campaign", qr.utm.campaign);
  dest.searchParams.set("utm_content", code);

  const res = NextResponse.redirect(dest, 302);
  res.headers.set("Cache-Control", "no-store");

  const ua = req.headers.get("user-agent") ?? "";
  if (!BOT.test(ua)) {
    const scanId = id();
    try {
      await db.insert(schema.qrScan).values({
        id: scanId,
        code,
        userAgent: ua.slice(0, 300) || null,
        country: req.headers.get("x-vercel-ip-country"),
        region: req.headers.get("x-vercel-ip-country-region"),
        city: decodeURIComponent(req.headers.get("x-vercel-ip-city") ?? "") || null,
      });
      res.cookies.set(SCAN_COOKIE, `${code}.${scanId}`, { maxAge: 60 * 60 * 24 * 30, httpOnly: true, sameSite: "lax", path: "/" });
    } catch (err) {
      // Never block the visitor because logging failed.
      console.error("[qr] failed to log scan", err);
    }
  }
  return res;
}
