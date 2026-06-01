"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/community", label: "Community" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/sessions", label: "Sessions" },
  { href: "/profile", label: "Profile" },
  { href: "/compare", label: "Compare" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-espresso/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-cream">
          <Coffee className="h-5 w-5 text-amber" />
          BrewCircle
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                pathname === link.href
                  ? "bg-amber/20 text-amber"
                  : "text-cream/70 hover:bg-cream/5 hover:text-cream",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            className="ml-2 rounded-full bg-amber px-3 py-1.5 text-sm font-medium text-espresso hover:bg-amber-light"
          >
            DNA Setup
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 text-cream md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-cream/10 px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block rounded-lg px-3 py-2 text-sm",
                pathname === link.href ? "bg-amber/20 text-amber" : "text-cream/80",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/onboarding"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-lg bg-amber px-3 py-2 text-center text-sm font-medium text-espresso"
          >
            DNA Setup
          </Link>
        </nav>
      )}
    </header>
  );
}
