"use client";

import { getFirebaseAuth, isFirebaseConfigured } from "@/lib/firebase/client";
import { ConfirmationResult, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const configured = isFirebaseConfigured();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const verifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    return () => {
      verifierRef.current?.clear();
      verifierRef.current = null;
    };
  }, []);

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
      if (!configured) {
        setMessage("Firebase is not configured. Add the Firebase web app values to .env.local.");
        return;
      }
      const auth = getFirebaseAuth();
      verifierRef.current?.clear();
      verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
      });
      confirmationRef.current = await signInWithPhoneNumber(auth, formatPhone(phone), verifierRef.current);
      setStep("otp");
      setMessage("OTP sent. Check your SMS.");
    } catch (e) {
      verifierRef.current?.clear();
      verifierRef.current = null;
      setMessage(e instanceof Error ? e.message : "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (!confirmationRef.current) {
        setMessage("Send an OTP first.");
        return;
      }
      await confirmationRef.current.confirm(otp);
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
        <a href="https://firebase.google.com/products/auth" className="underline" target="_blank" rel="noreferrer">
          Firebase Phone Auth
        </a>{" "}
        with Supabase for marketplace data.
      </p>

      {!configured && (
        <p className="mt-4 rounded-sm border border-primary/20 bg-card p-3 text-xs leading-relaxed text-foreground/80">
          Dev mode: add <code className="font-mono">NEXT_PUBLIC_FIREBASE_API_KEY</code>,{" "}
          <code className="font-mono">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code>,{" "}
          <code className="font-mono">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code>, and{" "}
          <code className="font-mono">NEXT_PUBLIC_FIREBASE_APP_ID</code> from your Firebase web app.
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
        <div id="recaptcha-container" />

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
