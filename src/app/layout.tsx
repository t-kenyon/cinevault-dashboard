import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const roboto = localFont({ src: "./fonts/Roboto-Variable.ttf", variable: "--font-roboto", weight: "100 900", display: "swap" });
export const metadata: Metadata = { title: "CineVault Dashboard", description: "CineVault Dashboard", applicationName: "CineVault", appleWebApp: { capable: true, title: "CineVault", statusBarStyle: "black" }, robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: "#080808" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={roboto.variable}><body><a href="#main" className="skip">Skip to content</a>{children}</body></html>;
}
