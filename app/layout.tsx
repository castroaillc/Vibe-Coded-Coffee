import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { site } from "@/lib/site";
import "./globals.css";

// Fonts are downloaded at build time and self-hosted (no request to Google from visitors).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-display",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
// Monospace for the menu's "spinner verb" drink names.
const mono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

// Kept under ~60 characters so search results show it in full.
const title = `Coffee Catering for Tech Events in NYC | ${site.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.metaDescription,
  applicationName: site.name,
  keywords: [
    "Vibe Coded Coffee",
    "coffee catering NYC",
    "coffee catering Brooklyn",
    "event coffee catering",
    "hackathon catering",
    "tech event catering NYC",
    "meetup coffee catering",
    "corporate coffee catering",
    "drip coffee catering",
    "coffee for conferences",
    "coffee subscription NYC",
  ],
  alternates: {
    canonical: "/",
    languages: { "en-US": "/", "x-default": "/" },
    types: { "text/plain": [{ url: "/llms.txt", title: "LLMs.txt" }] },
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title,
    description: site.metaDescription,
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.metaDescription,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "food & drink",
  // Search Console / Bing Webmaster verification codes (set in Vercel; blank skips the tag).
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
  // Local SEO: where the business is.
  other: {
    "geo.region": `${site.country}-${site.region}`,
    "geo.placename": site.locationLabel,
    "geo.position": `${site.geo.latitude};${site.geo.longitude}`,
    ICBM: `${site.geo.latitude}, ${site.geo.longitude}`,
  },
};

export const viewport: Viewport = {
  themeColor: "#0A1F33",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // Extensions (e.g. Scribe) add attributes to <html> before React hydrates; ignore those.
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
