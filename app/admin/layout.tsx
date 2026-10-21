import type { Metadata, Viewport } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Coffee OS", template: "%s · Coffee OS" },
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Coffee OS", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#0A1F33", viewportFit: "cover" };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
