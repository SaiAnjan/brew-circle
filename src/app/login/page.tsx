"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { configured } = getSupabaseEnv();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (raw.startsWith("+")) return raw;
    return `+91${digits}`;
  };

  const sendOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase not configured. Copy .env.local.example → .env.local and enable Phone auth.");
        return;
      }
      const { error } = await supabase.auth.signInWithOtp({
        phone: formatPhone(phone),
      });
      if (error) throw error;
      setStep("otp");
      setMessage("OTP sent. Check your SMS.");
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
      if (!supabase) return;
      const { error } = await supabase.auth.verifyOtp({
        phone: formatPhone(phone),
        token: otp,
        type: "sms",
      });
      if (error) throw error;
      router.push("/profile");
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
        Mobile number signup · India (+91). Powered by{" "}
        <a href="https://supabase.com" className="underline" target="_blank" rel="noreferrer">
          Supabase
        </a>{" "}
        (open-source Postgres + Auth).
      </p>

      {!configured && (
        <p className="mt-4 rounded-sm border border-primary/20 bg-card p-3 text-xs leading-relaxed text-foreground/80">
          Dev mode: add <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> from your Supabase project (same as
          my-portfolio). Enable Phone provider in Authentication settings.
        </p>
      )}

      <div className="mt-8 space-y-4">
        <label className="block text-sm font-medium">
          Mobile number
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
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
          onClick={() => (step === "phone" ? sendOtp() : verifyOtp())}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Please wait…" : step === "phone" ? "Send OTP" : "Verify & sign in"}
        </button>

        {step === "otp" && (
          <button type="button" className="w-full text-sm text-muted hover:text-primary" onClick={() => setStep("phone")}>
            Change number
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
