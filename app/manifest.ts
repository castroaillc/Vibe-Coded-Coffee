import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Installs the ordering app (/order) when a member adds it to their home screen.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/order",
    name: site.name,
    short_name: "Vibe Coded",
    description: "Order your daily coffee, scan your pass at the kiosk, earn points and RSVP to events.",
    start_url: "/order",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0A1F33",
    theme_color: "#0A1F33",
    categories: ["food", "lifestyle"],
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/brand/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "My pass", short_name: "Pass", url: "/order#pass", icons: [{ src: "/brand/icon-192.png", sizes: "192x192" }] },
      { name: "Events", url: "/order#events", icons: [{ src: "/brand/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
