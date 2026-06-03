"use client";

import { useState } from "react";
import { onboardingSteps } from "@/lib/data";
import { createClientIfConfigured } from "@/lib/supabase/client";
import type { BrewMethod, FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";

const METHODS: BrewMethod[] = ["Espresso", "V60", "Aeropress", "French Press", "Moka Pot", "Cold Brew"];
const EQUIPMENT = ["Comandante C40", "Fellow Stagg EKG", "Hario V60", "Flair 58", "Aeropress", "Breville Bambino"];
const FLAVORS: FlavorNote[] = ["Chocolate", "Nutty", "Caramel", "Floral", "Berry", "Citrus", "Tropical", "Winey", "Spicy"];
const REGIONS = ["Chikmagalur", "Coorg", "Araku Valley", "Sakleshpur", "Nilgiris", "Bababudangiri"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [details, setDetails] = useState({
    name: "",
    handle: "",
    phone: "",
    location: "",
    bio: "",
  });
  const [selected, setSelected] = useState<Record<string, string[]>>({
    methods: ["V60", "Aeropress"],
    equipment: ["Comandante C40", "Hario V60"],
    flavors: ["Berry", "Floral", "Winey"],
    regions: ["Chikmagalur", "Araku Valley"],
  });

  const current = onboardingSteps[step];
  const options: Record<string, string[]> = {
    methods: METHODS,
    equipment: EQUIPMENT,
    flavors: FLAVORS,
    regions: REGIONS,
  };

  const toggle = (key: string, item: string) => {
    setSelected((prev) => {
      const list = prev[key] ?? [];
      return {
        ...prev,
        [key]: list.includes(item) ? list.filter((i) => i !== item) : [...list, item],
      };
    });
  };

  const formatPhone = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
    if (digits.length === 10) return `+91${digits}`;
    if (raw.startsWith("+")) return raw;
    return `+91${digits}`;
  };

  const getInitials = (name: string) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "BC";

  const saveOnboarding = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClientIfConfigured();
      if (!supabase) {
        setMessage("Supabase is not configured.");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const name = details.name.trim() || "Brewer";
      const handle = details.handle.trim().replace(/^@/, "") || `brewer_${user.id.slice(0, 8)}`;
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name,
          handle,
          phone: formatPhone(details.phone),
          location: details.location.trim(),
          bio: details.bio.trim(),
          avatar_initials: getInitials(name),
        })
        .eq("id", user.id);
      if (profileError) throw profileError;

      const { error: dnaError } = await supabase
        .from("coffee_dna")
        .update({
          methods: selected.methods ?? [],
          equipment: selected.equipment ?? [],
          flavor_prefs: selected.flavors ?? [],
          regions: selected.regions ?? [],
        })
        .eq("user_id", user.id);
      if (dnaError) throw dnaError;

      router.push("/profile");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Could not save onboarding");
    } finally {
      setSaving(false);
    }
  };

  const isLast = step === onboardingSteps.length - 1;
  const isDetailsStep = current.id === "details";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8">
        <p className="text-sm text-amber">
          Step {step + 1} of {onboardingSteps.length}
        </p>
        <h1 className="mt-1 font-display text-3xl text-cream">{current.title}</h1>
        <p className="text-cream/60">{current.subtitle}</p>
        <div className="mt-4 flex gap-1">
          {onboardingSteps.map((_, i) => (
            <div key={i} className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-amber" : "bg-cream/10")} />
          ))}
        </div>
      </div>

      {isDetailsStep ? (
        <div className="grid gap-4">
          <label className="block text-sm font-medium">
            Name
            <input
              type="text"
              value={details.name}
              onChange={(e) => setDetails((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Ananya Rao"
              className="mt-1 w-full rounded-sm border border-cream/15 bg-roast px-3 py-2.5 text-sm text-cream focus:border-amber/60 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Handle
            <input
              type="text"
              value={details.handle}
              onChange={(e) => setDetails((prev) => ({ ...prev, handle: e.target.value }))}
              placeholder="ananya_pourover"
              className="mt-1 w-full rounded-sm border border-cream/15 bg-roast px-3 py-2.5 text-sm text-cream focus:border-amber/60 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Phone number
            <input
              type="tel"
              value={details.phone}
              onChange={(e) => setDetails((prev) => ({ ...prev, phone: e.target.value }))}
              placeholder="98765 43210"
              className="mt-1 w-full rounded-sm border border-cream/15 bg-roast px-3 py-2.5 text-sm text-cream focus:border-amber/60 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Location
            <input
              type="text"
              value={details.location}
              onChange={(e) => setDetails((prev) => ({ ...prev, location: e.target.value }))}
              placeholder="Bangalore, Karnataka"
              className="mt-1 w-full rounded-sm border border-cream/15 bg-roast px-3 py-2.5 text-sm text-cream focus:border-amber/60 focus:outline-none"
            />
          </label>
          <label className="block text-sm font-medium">
            Bio
            <textarea
              value={details.bio}
              onChange={(e) => setDetails((prev) => ({ ...prev, bio: e.target.value }))}
              placeholder="Home brewer chasing clarity in Indian specialty coffee."
              rows={3}
              className="mt-1 w-full rounded-sm border border-cream/15 bg-roast px-3 py-2.5 text-sm text-cream focus:border-amber/60 focus:outline-none"
            />
          </label>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {(options[current.id] ?? []).map((item) => {
            const active = (selected[current.id] ?? []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggle(current.id, item)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm transition-colors",
                  active ? "border-amber bg-amber/20 text-amber" : "border-cream/15 text-cream/70 hover:border-cream/30",
                )}
              >
                {item}
              </button>
            );
          })}
        </div>
      )}

      {current.id === "flavors" && (
        <div className="mt-8 rounded-2xl border border-amber/20 bg-roast p-4">
          <p className="text-sm font-medium text-amber">Preview: Your flavor DNA</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(selected.flavors ?? []).map((flavor) => (
              <span key={flavor} className="rounded-full bg-amber/10 px-3 py-1 text-xs text-cream">
                {flavor}
              </span>
            ))}
          </div>
        </div>
      )}

      {message && <p className="mt-6 text-sm text-amber">{message}</p>}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((currentStep) => currentStep - 1)}
          className="rounded-full px-4 py-2 text-sm text-cream/60 disabled:opacity-30"
        >
          Back
        </button>
        {isLast ? (
          <button
            type="button"
            disabled={saving}
            onClick={saveOnboarding}
            className="flex items-center gap-2 rounded-full bg-amber px-6 py-2 text-sm font-medium text-espresso disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : "Save profile & DNA"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((currentStep) => currentStep + 1)}
            className="rounded-full bg-amber px-6 py-2 text-sm font-medium text-espresso"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
