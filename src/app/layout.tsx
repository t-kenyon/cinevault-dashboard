import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const roboto = localFont({ src: "./fonts/Roboto-Variable.ttf", variable: "--font-roboto", weight: "100 900", display: "swap" });
const title = "CineVault Dashboard";
const description = "Dedicated to the preservation of exceptional films.";
export const metadata: Metadata = {
  metadataBase: new URL("https://cinevault-dashboard.com"),
  title,
  description,
  applicationName: "CineVault",
  appleWebApp: { capable: true, title: "CineVault", statusBarStyle: "black" },
  openGraph: { title, description, siteName: "CineVault", type: "website", url: "/", locale: "en_US" },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [{ url: "/opengraph-image.jpg", width: 1200, height: 630, alt: "CineVault silver and gold wordmark in front of a closed bank vault door" }],
  },
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#080808" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={roboto.variable}><body><a href="#main" className="skip">Skip to content</a>{children}</body></html>;
}
