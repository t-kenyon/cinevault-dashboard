import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = { title: "CineVault · The viewing room", description: "CineVault analytics preview using fictional sample data only.", robots: { index: false, follow: false } };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a href="#main" className="skip">Skip to content</a><header className="masthead"><Link href="/" className="brand"><span className="brand-mark">C</span> CINEVAULT<span className="edition"> / THE VIEWING ROOM</span></Link><span className="demo">FICTIONAL DEMO DATA</span></header>{children}<footer>Made for movie nights. <span>Sample analytics · No Plex or Tautulli connection · V1</span></footer></body></html>;
}
