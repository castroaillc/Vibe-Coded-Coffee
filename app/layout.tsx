import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Montserrat } from "next/font/google";
import { catering, site } from "@/lib/site";
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

const title = `${site.name} — ${catering.short} in ${site.serviceArea}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: title, template: `%s | ${site.name}` },
  description: site.description,
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
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: site.name,
    title: `${catering.short} — ${site.name}`,
    description: catering.summary,
    locale: "en_US",
    images: [{ url: "/opengraph-image.png", width: 1200, height: 630, alt: `${site.name} — ${site.tagline}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${catering.short} — ${site.name}`,
    description: catering.summary,
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  category: "food & drink",
};

export const viewport: Viewport = {
  themeColor: "#0A1F33",
  colorScheme: "dark light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
