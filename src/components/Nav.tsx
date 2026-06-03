"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Coffee, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { isOnboardingComplete } from "@/lib/onboarding";

const links = [
  { href: "/", label: "Marketplace" },
  { href: "/discover", label: "Discover" },
  { href: "/community", label: "Community" },
  { href: "/sessions", label: "Sessions" },
];

type AuthNavState = {
  status: "loading" | "signed-out" | "signed-in";
  onboarded: boolean;
};

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [authState, setAuthState] = useState<AuthNavState>({
    status: "loading",
    onboarded: false,
  });

  useEffect(() => {
    const supabase = createClientIfConfigured();
    if (!supabase) {
      queueMicrotask(() => setAuthState({ status: "signed-out", onboarded: false }));
      return;
    }

    let active = true;

    const syncAuthState = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!active) return;

      if (!user) {
        setAuthState({ status: "signed-out", onboarded: false });
        return;
      }

      const [{ data: profile }, { data: dna }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("coffee_dna").select("*").eq("user_id", user.id).single(),
      ]);

      if (!active) return;

      setAuthState({
        status: "signed-in",
        onboarded: isOnboardingComplete(profile as DbProfile | null, dna as DbCoffeeDna | null),
      });
    };

    syncAuthState();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncAuthState();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    const supabase = createClientIfConfigured();
    if (supabase) {
      await supabase.auth.signOut();
    }
    setAuthState({ status: "signed-out", onboarded: false });
    setOpen(false);
    router.push("/");
    router.refresh();
  };

  const accountHref = authState.onboarded ? "/profile" : "/onboarding";
  const accountLabel = authState.onboarded ? "Profile" : "Finish setup";

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
          {authState.status === "signed-in" ? (
            <>
              <Link
                href={accountHref}
                className="ml-2 rounded-sm bg-primary px-3 py-1 text-[15px] font-medium text-background hover:opacity-90"
              >
                {accountLabel}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="ml-1 rounded-sm border border-primary/20 px-3 py-1 text-[15px] font-medium hover:bg-card"
              >
                Sign out
              </button>
            </>
          ) : authState.status === "signed-out" ? (
            <>
              <Link
                href="/login"
                className="ml-2 rounded-sm border border-primary/20 px-3 py-1 text-[15px] font-medium hover:bg-card"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="ml-1 rounded-sm bg-primary px-3 py-1 text-[15px] font-medium text-background hover:opacity-90"
              >
                Sign up
              </Link>
            </>
          ) : null}
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
          {authState.status === "signed-in" ? (
            <>
              <Link href={accountHref} onClick={() => setOpen(false)} className="mt-2 block px-2 py-2 text-sm font-medium text-primary">
                {accountLabel}
              </Link>
              <button type="button" onClick={signOut} className="block px-2 py-2 text-sm font-medium">
                Sign out
              </button>
            </>
          ) : authState.status === "signed-out" ? (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="mt-2 block px-2 py-2 text-sm font-medium">
                Sign in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="block px-2 py-2 text-sm font-medium text-primary">
                Sign up
              </Link>
            </>
          ) : null}
        </nav>
      )}
    </header>
  );
}
