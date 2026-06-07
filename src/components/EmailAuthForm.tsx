"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { useToast } from "@/components/ToastProvider";
import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { isOnboardingComplete } from "@/lib/onboarding";
import { claimCurrentUserProfile } from "@/lib/auth-profile";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

type AuthIdentifier = {
  type: "email" | "phone";
  value: string;
};

function getAuthErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return fallback;
}

function normalizePhone(raw: string) {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+") && digits.length >= 8) return `+${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length > 10) return `+${digits}`;

  return "";
}

function parseIdentifier(raw: string): AuthIdentifier | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (trimmed.includes("@")) {
    const email = trimmed.toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? { type: "email", value: email } : null;
  }

  const phone = normalizePhone(trimmed);
  return phone ? { type: "phone", value: phone } : null;
}

function getDefaultHandle(userId: string) {
  return `brewer_${userId.slice(0, 8)}`;
}

export function EmailAuthForm() {
  const { configured } = getSupabaseEnv();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = useMemo(() => searchParams.get("email") ?? searchParams.get("phone") ?? "", [searchParams]);
  const [identifierInput, setIdentifierInput] = useState(initialIdentifier);
  const [sentIdentifier, setSentIdentifier] = useState<AuthIdentifier | null>(null);
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const identifier = parseIdentifier(identifierInput);
  const canSendCode = Boolean(identifier);
  const identifierLabel = sentIdentifier?.type === "phone" ? "phone" : "email";

  const sendCode = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        const errorMessage = "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
        setMessage(errorMessage);
        showToast({ title: "Auth is not configured", description: errorMessage, variant: "error" });
        return;
      }

      if (!identifier) {
        const errorMessage = "Enter a valid email or phone number.";
        setMessage(errorMessage);
        showToast({ title: "Invalid login", description: errorMessage, variant: "error" });
        return;
      }

      const { error } =
        identifier.type === "email"
          ? await supabase.auth.signInWithOtp({
              email: identifier.value,
              options: {
                shouldCreateUser: true,
              },
            })
          : await supabase.auth.signInWithOtp({
              phone: identifier.value,
              options: {
                shouldCreateUser: true,
                channel: "sms",
              },
            });

      if (error) throw error;

      setSent(true);
      setSentIdentifier(identifier);
      setOtp("");
      const successMessage = `OTP sent to your ${identifier.type === "email" ? "email" : "phone"}. Enter it below to continue.`;
      setMessage(successMessage);
      showToast({ title: "OTP sent", description: successMessage, variant: "success" });
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, "Could not send OTP");
      setMessage(errorMessage);
      showToast({ title: "Could not send OTP", description: errorMessage, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        const errorMessage = "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.";
        setMessage(errorMessage);
        showToast({ title: "Auth is not configured", description: errorMessage, variant: "error" });
        return;
      }

      if (!sentIdentifier) {
        const errorMessage = "Send an OTP first.";
        setMessage(errorMessage);
        showToast({ title: "OTP required", description: errorMessage, variant: "error" });
        return;
      }

      const token = otp.trim();
      if (!token) {
        const errorMessage = "Enter the OTP.";
        setMessage(errorMessage);
        showToast({ title: "OTP required", description: errorMessage, variant: "error" });
        return;
      }

      const { data, error } =
        sentIdentifier.type === "email"
          ? await supabase.auth.verifyOtp({
              email: sentIdentifier.value,
              token,
              type: "email",
            })
          : await supabase.auth.verifyOtp({
              phone: sentIdentifier.value,
              token,
              type: "sms",
            });

      if (error) throw error;

      const user = data.user;
      if (!user) {
        setMessage("OTP verified, but no user session was returned.");
        return;
      }

      await claimCurrentUserProfile(supabase);

      const contactPatch =
        sentIdentifier.type === "email"
          ? { email: sentIdentifier.value }
          : { phone: sentIdentifier.value };

      const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

      if (existingProfile) {
        const { error: profileUpdateError } = await supabase
          .from("profiles")
          .update(contactPatch)
          .eq("id", user.id);
        if (profileUpdateError) throw profileUpdateError;
      } else {
        const { error: profileInsertError } = await supabase.from("profiles").insert({
          id: user.id,
          ...contactPatch,
          name: "Brewer",
          handle: getDefaultHandle(user.id),
          avatar_initials: "BC",
        });
        if (profileInsertError) throw profileInsertError;
      }

      const { data: existingDna } = await supabase.from("coffee_dna").select("user_id").eq("user_id", user.id).maybeSingle();
      if (!existingDna) {
        const { error: dnaInsertError } = await supabase.from("coffee_dna").insert({ user_id: user.id });
        if (dnaInsertError) throw dnaInsertError;
      }

      const [{ data: profile }, { data: dna }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("coffee_dna").select("*").eq("user_id", user.id).maybeSingle(),
      ]);

      const nextPath = isOnboardingComplete(profile as DbProfile | null, dna as DbCoffeeDna | null)
        ? "/"
        : "/onboarding";

      showToast({
        title: nextPath === "/" ? "Signed in" : "Account verified",
        description: nextPath === "/" ? "Opening the marketplace with your account." : "Finish onboarding to complete your profile.",
        variant: "success",
      });
      router.push(nextPath);
      router.refresh();
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, "Could not verify OTP");
      setMessage(errorMessage);
      showToast({ title: "Could not verify OTP", description: errorMessage, variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">
        Sign in or create account
      </h1>
      <p className="mt-2 text-sm text-muted">
        Enter your email or phone number. If it is new, BrewCircle will take you through onboarding after OTP verification.
      </p>

      {!configured && (
        <p className="mt-4 rounded-sm border border-primary/20 bg-card p-3 text-xs leading-relaxed text-foreground/80">
          Dev mode: add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from your Supabase project.
        </p>
      )}

      <div className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Email or phone
          <input
            type="text"
            value={identifierInput}
            onChange={(event) => {
              setIdentifierInput(event.target.value);
              setMessage(null);
            }}
            placeholder="you@example.com or +91 98765 43210"
            disabled={sent}
            inputMode="text"
            className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
          />
        </label>

        {sent && (
          <label className="block text-sm font-medium">
            OTP
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\s/g, ""))}
              placeholder="Enter code"
              inputMode="numeric"
              autoComplete="one-time-code"
              className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm tracking-[0.25em] focus:border-primary/40 focus:outline-none"
            />
          </label>
        )}

        {message && <p className="text-sm text-muted">{message}</p>}

        <button
          type="button"
          disabled={loading || (!sent && !canSendCode) || (sent && !otp.trim())}
          onClick={sent ? verifyCode : sendCode}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Please wait..." : sent ? "Verify OTP" : "Send OTP"}
        </button>

        {sent && (
          <button
            type="button"
            className="w-full text-sm text-muted hover:text-primary"
            onClick={() => {
              setSent(false);
              setSentIdentifier(null);
              setOtp("");
              setMessage(null);
            }}
          >
            Change {identifierLabel}
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Existing and new users use the same OTP flow.
      </p>

      <p className="mt-4 text-center text-sm text-muted">
        <Link href="/" className="hover:text-primary">
          ← Back to marketplace
        </Link>
      </p>
    </div>
  );
}
