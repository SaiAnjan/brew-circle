"use client";

import { createClientIfConfigured } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { useToast } from "@/components/ToastProvider";
import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { isOnboardingComplete } from "@/lib/onboarding";
import { claimCurrentUserProfile } from "@/lib/auth-profile";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type AuthIdentifier = {
  type: "email" | "phone";
  value: string;
};

type AuthFlow = "login" | "signup" | "set-password";
type AuthStage = "form" | "verify";

type PendingOtp = {
  flow: Exclude<AuthFlow, "login">;
  identifier: AuthIdentifier;
  password: string;
};

type AuthUser = {
  id: string;
  email?: string | null;
  phone?: string | null;
};

type AuthClient = NonNullable<ReturnType<typeof createClientIfConfigured>>;

const MIN_PASSWORD_LENGTH = 8;

function generateTemporaryPassword() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  const randomPart = Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0")).join("");
  return `BrewCircle-${randomPart}-9a!`;
}

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

function getContactPatch(identifier: AuthIdentifier) {
  return identifier.type === "email" ? { email: identifier.value } : { phone: identifier.value };
}

async function sendOtpForFlow(supabase: AuthClient, pendingOtp: PendingOtp) {
  if (pendingOtp.identifier.type === "email") {
    return supabase.auth.signInWithOtp({
      email: pendingOtp.identifier.value,
      options: { shouldCreateUser: pendingOtp.flow === "signup" },
    });
  }

  return supabase.auth.signInWithOtp({
    phone: pendingOtp.identifier.value,
    options: {
      shouldCreateUser: pendingOtp.flow === "signup",
      channel: "sms",
    },
  });
}

async function verifyOtpForIdentifier(supabase: AuthClient, identifier: AuthIdentifier, token: string) {
  if (identifier.type === "email") {
    return supabase.auth.verifyOtp({
      email: identifier.value,
      token,
      type: "email",
    });
  }

  return supabase.auth.verifyOtp({
    phone: identifier.value,
    token,
    type: "sms",
  });
}

async function ensureProfileRows(supabase: AuthClient, user: AuthUser, identifier: AuthIdentifier) {
  await claimCurrentUserProfile(supabase);

  const contactPatch = getContactPatch(identifier);
  const { data: existingProfile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  if (existingProfile) {
    await supabase.from("profiles").update(contactPatch).eq("id", user.id);
  } else {
    await supabase.from("profiles").insert({
      id: user.id,
      ...contactPatch,
      name: "Brewer",
      handle: getDefaultHandle(user.id),
      avatar_initials: "BC",
    });
  }

  const { data: existingDna } = await supabase.from("coffee_dna").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!existingDna) {
    await supabase.from("coffee_dna").insert({ user_id: user.id });
  }

  const [{ data: profile }, { data: dna }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("coffee_dna").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return isOnboardingComplete(profile as DbProfile | null, dna as DbCoffeeDna | null) ? "/" : "/onboarding";
}

function getFlowTitle(flow: AuthFlow) {
  if (flow === "signup") return "Create account";
  if (flow === "set-password") return "Set your password";
  return "Sign in";
}

function getFlowDescription(flow: AuthFlow) {
  if (flow === "signup") return "Create a BrewCircle account with email or phone. We will verify it once with an OTP.";
  if (flow === "set-password") return "Use this if your account was created before passwords existed, or if you need a new password.";
  return "Sign in with the password linked to your BrewCircle account.";
}

export function EmailAuthForm({ mode = "login" }: { mode?: "login" | "signup" }) {
  const { configured } = getSupabaseEnv();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialIdentifier = searchParams.get("email") ?? searchParams.get("phone") ?? "";
  const [flow, setFlow] = useState<AuthFlow>(mode);
  const [stage, setStage] = useState<AuthStage>("form");
  const [identifierInput, setIdentifierInput] = useState(initialIdentifier);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [skipPasswordForNow, setSkipPasswordForNow] = useState(false);
  const [pendingOtp, setPendingOtp] = useState<PendingOtp | null>(null);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const identifier = parseIdentifier(identifierInput);
  const canSkipPassword = flow === "signup";
  const isSkippingPassword = canSkipPassword && skipPasswordForNow;
  const needsPasswordConfirmation = flow !== "login" && !isSkippingPassword;
  const passwordReady = isSkippingPassword || (flow === "login" ? Boolean(password) : password.length >= MIN_PASSWORD_LENGTH);
  const passwordsMatch = !needsPasswordConfirmation || password === confirmPassword;
  const canSubmitForm = Boolean(identifier) && passwordReady && passwordsMatch;
  const canVerifyOtp = Boolean(pendingOtp && otp.trim());

  const notify = (title: string, description: string, variant: "success" | "error" | "warning" = "success") => {
    setMessage(description);
    showToast({ title, description, variant });
  };

  const resetFlow = (nextFlow: AuthFlow) => {
    setFlow(nextFlow);
    setStage("form");
    setPassword("");
    setConfirmPassword("");
    setSkipPasswordForNow(false);
    setPendingOtp(null);
    setOtp("");
    setMessage(null);
  };

  const redirectAfterAuth = async (supabase: AuthClient, user: AuthUser, activeIdentifier: AuthIdentifier) => {
    const nextPath = await ensureProfileRows(supabase, user, activeIdentifier);
    showToast({
      title: nextPath === "/" ? "Signed in" : "Account ready",
      description: nextPath === "/" ? "Opening the marketplace with your account." : "Finish onboarding to complete your profile.",
      variant: "success",
    });
    router.push(nextPath);
    router.refresh();
  };

  const signInWithPassword = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        notify("Auth is not configured", "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.", "error");
        return;
      }

      if (!identifier) {
        notify("Invalid sign in", "Enter a valid email or phone number.", "error");
        return;
      }

      if (!password) {
        notify("Password required", "Enter your account password.", "error");
        return;
      }

      const { data, error } =
        identifier.type === "email"
          ? await supabase.auth.signInWithPassword({ email: identifier.value, password })
          : await supabase.auth.signInWithPassword({ phone: identifier.value, password });

      if (error) throw error;
      if (!data.user) {
        notify("Could not sign in", "Password was accepted, but no user session was returned.", "error");
        return;
      }

      await redirectAfterAuth(supabase, data.user, identifier);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, "Could not sign in");
      notify(
        "Could not sign in",
        `${errorMessage}. If this account was created before passwords, use “Set password with OTP”.`,
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const sendSignupOrPasswordSetupOtp = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        notify("Auth is not configured", "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.", "error");
        return;
      }

      if (!identifier) {
        notify("Invalid account", "Enter a valid email or phone number.", "error");
        return;
      }

      if (!isSkippingPassword && password.length < MIN_PASSWORD_LENGTH) {
        notify("Password too short", `Use at least ${MIN_PASSWORD_LENGTH} characters.`, "error");
        return;
      }

      if (!isSkippingPassword && password !== confirmPassword) {
        notify("Passwords do not match", "Re-enter the same password in both fields.", "error");
        return;
      }

      if (flow === "signup") {
        const { data: existingProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq(identifier.type, identifier.value)
          .maybeSingle();

        if (existingProfile) {
          resetFlow("login");
          notify("Account already exists", "Sign in with your password. If you never created one, use Set password with OTP.", "warning");
          return;
        }
      }

      const otpRequest: PendingOtp = {
        flow: flow === "signup" ? "signup" : "set-password",
        identifier,
        password: isSkippingPassword ? generateTemporaryPassword() : password,
      };
      const { error } = await sendOtpForFlow(supabase, otpRequest);
      if (error) throw error;

      setPendingOtp(otpRequest);
      setOtp("");
      setStage("verify");
      notify(
        "OTP sent",
        `Enter the OTP sent to your ${identifier.type === "email" ? "email" : "phone"} to ${
          flow === "signup"
            ? isSkippingPassword
              ? "create your account and continue to onboarding"
              : "create your account"
            : "set your password"
        }.`,
      );
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, flow === "signup" ? "Could not start signup" : "Could not send OTP");
      notify(flow === "signup" ? "Could not create account" : "Could not send OTP", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtpAndSetPassword = async () => {
    setLoading(true);
    setMessage(null);

    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        notify("Auth is not configured", "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.", "error");
        return;
      }

      if (!pendingOtp) {
        notify("OTP session missing", "Start the flow again to receive a fresh OTP.", "error");
        setStage("form");
        return;
      }

      const token = otp.trim();
      if (!token) {
        notify("OTP required", "Enter the OTP.", "error");
        return;
      }

      const { data, error } = await verifyOtpForIdentifier(supabase, pendingOtp.identifier, token);
      if (error) throw error;

      const user = data.user;
      if (!user) {
        notify("Could not verify OTP", "OTP verified, but no user session was returned.", "error");
        return;
      }

      const { error: passwordError } = await supabase.auth.updateUser({ password: pendingOtp.password });
      if (passwordError) throw passwordError;

      await redirectAfterAuth(supabase, user, pendingOtp.identifier);
    } catch (error) {
      const errorMessage = getAuthErrorMessage(error, "Could not verify OTP");
      notify("Could not finish setup", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const submitForm = () => {
    if (stage === "verify") {
      void verifyOtpAndSetPassword();
      return;
    }

    if (flow === "login") {
      void signInWithPassword();
      return;
    }

    void sendSignupOrPasswordSetupOtp();
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight text-primary">{stage === "verify" ? "Verify OTP" : getFlowTitle(flow)}</h1>
      <p className="mt-2 text-sm text-muted">
        {stage === "verify"
          ? `This OTP is only for ${pendingOtp?.flow === "signup" ? "account creation" : "password setup"}. Normal sign in uses your password.`
          : getFlowDescription(flow)}
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
            disabled={stage === "verify"}
            inputMode="text"
            className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
          />
        </label>

        {stage === "form" && (
          <>
            {!isSkippingPassword && (
              <label className="block text-sm font-medium">
                {flow === "login" ? "Password" : "Create password"}
                <input
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setMessage(null);
                  }}
                  autoComplete={flow === "login" ? "current-password" : "new-password"}
                  className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
                />
              </label>
            )}

            {needsPasswordConfirmation && (
              <label className="block text-sm font-medium">
                Confirm password
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setMessage(null);
                  }}
                  autoComplete="new-password"
                  className="mt-1 w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-sm focus:border-primary/40 focus:outline-none"
                />
              </label>
            )}

            {canSkipPassword && (
              <button
                type="button"
                onClick={() => {
                  setSkipPasswordForNow((currentValue) => !currentValue);
                  setPassword("");
                  setConfirmPassword("");
                  setMessage(null);
                }}
                className="w-full rounded-sm border border-primary/20 bg-card px-3 py-2.5 text-left text-sm text-muted hover:border-primary/40 hover:text-primary"
              >
                {isSkippingPassword ? "✓ Password will be set later" : "Skip password for now"}
                <span className="mt-1 block text-xs leading-relaxed text-muted">
                  {isSkippingPassword
                    ? "We will generate a temporary internal password after OTP verification. You can set your real password later."
                    : "Use this to reach onboarding faster. If you sign out, use Set password with OTP before your next login."}
                </span>
              </button>
            )}
          </>
        )}

        {stage === "verify" && (
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
          disabled={loading || (stage === "form" ? !canSubmitForm : !canVerifyOtp)}
          onClick={submitForm}
          className="w-full rounded-sm bg-primary py-2.5 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Please wait..."
            : stage === "verify"
              ? pendingOtp?.flow === "signup"
                ? "Verify and create account"
                : "Verify and set password"
              : flow === "login"
                ? "Sign in"
                : flow === "signup"
                  ? "Send signup OTP"
                  : "Send password setup OTP"}
        </button>

        {stage === "verify" && (
          <button
            type="button"
            className="w-full text-sm text-muted hover:text-primary"
            onClick={() => {
              setStage("form");
              setPendingOtp(null);
              setOtp("");
              setMessage(null);
            }}
          >
            Change details
          </button>
        )}
      </div>

      <div className="mt-8 space-y-3 text-center text-sm text-muted">
        {flow === "login" ? (
          <>
            <p>
              New to BrewCircle?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
            <button type="button" className="hover:text-primary" onClick={() => resetFlow("set-password")}>
              Created before passwords? Set password with OTP
            </button>
          </>
        ) : flow === "signup" ? (
          <p>
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        ) : (
          <button type="button" className="hover:text-primary" onClick={() => resetFlow("login")}>
            ← Back to sign in
          </button>
        )}

        <p>
          <Link href="/" className="hover:text-primary">
            ← Back to marketplace
          </Link>
        </p>
      </div>
    </div>
  );
}
