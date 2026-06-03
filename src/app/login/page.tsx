"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { configured } = getSupabaseEnv();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;

      setStep("otp");
      setMessage("OTP sent. Check your email.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otp.trim(),
        type: "email",
      });
      if (error) throw error;

      router.push("/onboarding");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Email OTP signup. Powered by{" "}
        <a href="https://supabase.com" className="underline" target="_blank" rel="noreferrer">
          Supabase Auth
        </a>{" "}
        for login and marketplace data.
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={step === "otp"}
            className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
          />
        </label>

        {step === "otp" && (
          <label className="block text-sm font-medium">
            OTP code
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
            />
          </label>
        )}

        {message && <p className="text-sm text-muted">{message}</p>}

        <button
          type="button"
          disabled={loading}
          onClick={() => (step === "email" ? sendOtp() : verifyOtp())}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Please wait…" : step === "email" ? "Send email OTP" : "Verify & continue"}
        </button>

        {step === "otp" && (
          <button type="button" className="w-full text-sm text-muted hover:text-primary" onClick={() => setStep("email")}>
            Change email
          </button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/" className="hover:text-primary">
          ← Back to marketplace
        </Link>
      </p>
    </div>
  );
}
