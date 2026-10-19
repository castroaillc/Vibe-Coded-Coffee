import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import { RegisterSW } from "@/components/order/RegisterSW";
import "./order.css";

const grotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-app", display: "swap" });

export const metadata: Metadata = {
  title: "Order",
  description: "Build your daily coffee, save favorites, earn points and scan your pass at the kiosk.",
  // The app is for members, not for search results.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Vibe Coded", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#0A1F33",
  viewportFit: "cover",
};

export default function OrderLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`app-root ${grotesk.variable}`}>
      {children}
      <RegisterSW />
    </div>
  );
}
