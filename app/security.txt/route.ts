import { site } from "@/lib/site";

// security.txt (RFC 9116): how to report a security problem. Also served at /.well-known/security.txt (see next.config.ts).
// Expires is recomputed on every deploy, so it stays about a year in the future.
export const dynamic = "force-static";

export function GET() {
  const expires = new Date(Date.now() + 360 * 24 * 60 * 60 * 1000).toISOString();
  const body = [
    `Contact: mailto:${site.email}`,
    `Expires: ${expires}`,
    `Canonical: ${site.url}/.well-known/security.txt`,
    "Preferred-Languages: en",
    `Policy: ${site.url}/privacy`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
