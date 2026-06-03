"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { configured } = getSupabaseEnv();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const sendMagicLink = async () => {
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
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
          shouldCreateUser: true,
        },
      });
      if (error) throw error;

      setSent(true);
      setMessage("Magic link sent. Open your email and click the link to continue onboarding.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not send magic link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Email magic-link signup. Powered by{" "}
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
            disabled={sent}
            className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
          />
        </label>

        {message && <p className="text-sm text-muted">{message}</p>}

        <button
          type="button"
          disabled={loading || sent}
          onClick={sendMagicLink}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Please wait..." : sent ? "Check your email" : "Send magic link"}
        </button>

        {sent && (
          <button type="button" className="w-full text-sm text-muted hover:text-primary" onClick={() => setSent(false)}>
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
