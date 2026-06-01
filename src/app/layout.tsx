import type { Metadata } from "next";
import { Playfair_Display, Source_Sans_3 } from "next/font/google";
import { Nav } from "@/components/Nav";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BrewCircle — India's home coffee community",
  description:
    "Social network, marketplace, and discovery for Indian specialty home coffee brewers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${sourceSans.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-espresso text-cream antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-cream/10 py-8 text-center text-xs text-cream/40">
          BrewCircle · India&apos;s home coffee community · Mock MVP
        </footer>
      </body>
    </html>
  );
}
