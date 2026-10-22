import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";

// Everything the site loads is self-hosted (fonts via next/font, media in /public), so the
// policy can stay tight. 'unsafe-inline' scripts are needed for Next's inline hydration data
// and the JSON-LD blocks; vercel.live is Vercel's preview-deployment toolbar.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://vercel.live`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://vercel.live https://vercel.com",
  "font-src 'self' data: https://vercel.live",
  "media-src 'self'",
  `connect-src 'self' https://vercel.live wss://ws-us3.pusher.com${isDev ? " ws:" : ""}`,
  "frame-src https://vercel.live",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Photos are served as AVIF or WebP, whichever the browser supports.
    formats: ["image/avif", "image/webp"],
  },
  async rewrites() {
    return [{ source: "/.well-known/security.txt", destination: "/security.txt" }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        ],
      },
      {
        // Logos, photos and the share image are embedded by email clients and link previews on other sites.
        source: "/:dir(brand|media|_next/image)/:path*",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      },
      {
        source: "/:file(opengraph-image.png|apple-icon.png|icon.svg|favicon.ico)",
        headers: [{ key: "Cross-Origin-Resource-Policy", value: "cross-origin" }],
      },
    ];
  },
};

export default nextConfig;
