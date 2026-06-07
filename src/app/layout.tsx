import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Nav } from "@/components/Nav";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BrewCircle — Marketplace for home coffee brewers",
  description:
    "Buy, sell, and rent brewing gear across India. Coffee DNA, community, and sessions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="flex min-h-full flex-col antialiased">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border py-8 text-center text-xs text-muted">
            BrewCircle · India&apos;s home coffee marketplace
          </footer>
        </ToastProvider>
      </body>
    </html>
  );
}
