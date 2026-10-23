import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const roboto = localFont({ src: "./fonts/Roboto-Variable.ttf", variable: "--font-roboto", weight: "100 900", display: "swap" });
export const metadata: Metadata = { title: "CineVault · Private Collection", description: "CineVault analytics preview using fictional sample data only.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className={roboto.variable}><body><a href="#main" className="skip">Skip to content</a>{children}<footer>Dedicated to the preservation of exceptional films. <span>Viewing analytics respect member sharing preferences · V1</span></footer></body></html>;
}
