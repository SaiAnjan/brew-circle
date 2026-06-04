"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getAuthRedirectOrigin, getSupabaseEnv } from "@/lib/supabase/config";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type AuthMode = "signin" | "signup";

type EmailAuthFormProps = {
  mode: AuthMode;
};

function isMissingProfileEmailColumn(error: { code?: string; message?: string } | null) {
  const message = error?.message?.toLowerCase() ?? "";
  return Boolean(
    error &&
      (error.code === "42703" || (message.includes("profiles.email") && message.includes("does not exist"))),
  );
}

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const { configured } = getSupabaseEnv();
  const searchParams = useSearchParams();
  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);
  const [email, setEmail] = useState(initialEmail);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [unknownEmail, setUnknownEmail] = useState(false);
  const [existingEmail, setExistingEmail] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isSignup = mode === "signup";
  const normalizedEmail = email.trim().toLowerCase();

  const sendLink = async () => {
    setLoading(true);
    setMessage(null);
    setUnknownEmail(false);
    setExistingEmail(false);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      const { data: existingProfile, error: lookupError } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", normalizedEmail)
        .maybeSingle();
      const canCheckExistingProfile = !isMissingProfileEmailColumn(lookupError);
      if (lookupError && canCheckExistingProfile) throw lookupError;

      if (!isSignup && canCheckExistingProfile && !existingProfile) {
        setUnknownEmail(true);
        setMessage("No BrewCircle account found for this email.");
        return;
      }

      if (isSignup && canCheckExistingProfile && existingProfile) {
        setExistingEmail(true);
        setMessage("A BrewCircle account already exists for this email.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          emailRedirectTo: `${getAuthRedirectOrigin(window.location.origin)}/auth/callback?next=${isSignup ? "/onboarding" : "/profile"}`,
          shouldCreateUser: isSignup,
        },
      });

      if (error) {
        const errorText = error.message.toLowerCase();
        if (!isSignup && (errorText.includes("signup") || errorText.includes("not found") || errorText.includes("user"))) {
          setUnknownEmail(true);
          setMessage("No BrewCircle account found for this email.");
          return;
        }
        throw error;
      }

      setSent(true);
      setMessage(
        isSignup
          ? "Sign-up link sent. Open your email to create your account and continue onboarding."
          : "Sign-in link sent. Open your email to access your account.",
      );
    } catch (error) {
      setMessage(getAuthErrorMessage(error, `Could not send ${isSignup ? "sign-up" : "sign-in"} link`));
    } finally {
      setLoading(false);
    }
  };

  const alternateHref = isSignup ? "/login" : `/signup${normalizedEmail ? `?email=${encodeURIComponent(normalizedEmail)}` : ""}`;

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{isSignup ? "Create account" : "Sign in"}</h1>
      <p className="mt-2 text-sm text-muted">
        {isSignup
          ? "Create your BrewCircle account with an email link. Phone number is collected during onboarding."
          : "Sign in with the email linked to your BrewCircle account."}
      </p>

      {!configured && (
        <p className="mt-4 rounded-sm border border-primary/20 bg-card p-3 text-xs leading-relaxed text-foreground/80">
          Dev mode: add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from your Supabase project.
        </p>
      )}

      <div className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setUnknownEmail(false);
              setExistingEmail(false);
            }}
            placeholder="you@example.com"
            disabled={sent}
            className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
          />
        </label>

        {message && <p className="text-sm text-muted">{message}</p>}

        <button
          type="button"
          disabled={loading || sent || !normalizedEmail}
          onClick={sendLink}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : sent
              ? "Check your email"
              : isSignup
                ? "Create account"
                : "Sign in"}
        </button>

        {unknownEmail && (
          <Link
            href={alternateHref}
            className="block w-full rounded-sm border border-primary/20 py-2.5 text-center text-sm font-medium hover:bg-primary/5"
          >
            Sign up with this email
          </Link>
        )}

        {existingEmail && (
          <Link
            href={alternateHref}
            className="block w-full rounded-sm border border-primary/20 py-2.5 text-center text-sm font-medium hover:bg-primary/5"
          >
            Sign in with this email
          </Link>
        )}

        {sent && (
          <button type="button" className="w-full text-sm text-muted hover:text-primary" onClick={() => setSent(false)}>
            Change email
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New to BrewCircle?"}{" "}
        <Link href={alternateHref} className="text-primary hover:underline">
          {isSignup ? "Sign in" : "Create account"}
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/" className="hover:text-primary">
          ← Back to marketplace
        </Link>
      </p>
    </div>
  );
}
