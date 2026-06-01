"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Coffee, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Marketplace" },
  { href: "/discover", label: "Discover" },
  { href: "/community", label: "Community" },
  { href: "/sessions", label: "Sessions" },
  { href: "/profile", label: "Profile" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight text-primary">
          <Coffee className="h-4 w-4" />
          BrewCircle
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-none px-2 py-1 text-[15px] transition-colors",
                pathname === link.href
                  ? "font-medium text-primary"
                  : "text-foreground/70 hover:bg-card hover:text-primary",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="ml-2 rounded-sm border border-primary/20 px-3 py-1 text-[15px] font-medium hover:bg-card"
          >
            Sign in
          </Link>
          <Link
            href="/onboarding"
            className="ml-1 rounded-sm bg-primary px-3 py-1 text-[15px] font-medium text-background hover:opacity-90"
          >
            DNA Setup
          </Link>
        </nav>
        <button
          type="button"
          className="rounded-lg p-2 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-3 md:hidden">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={cn(
                "block px-2 py-2 text-sm",
                pathname === link.href ? "font-medium text-primary" : "text-foreground/80",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="mt-2 block px-2 py-2 text-sm font-medium">
            Sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
