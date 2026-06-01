"use client";

import Link from "next/link";
import { useState } from "react";
import { onboardingSteps } from "@/lib/data";
import type { BrewMethod, FlavorNote } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const METHODS: BrewMethod[] = ["Espresso", "V60", "Aeropress", "French Press", "Moka Pot", "Cold Brew"];
const EQUIPMENT = ["Comandante C40", "Fellow Stagg EKG", "Hario V60", "Flair 58", "Aeropress", "Breville Bambino"];
const FLAVORS: FlavorNote[] = ["Chocolate", "Nutty", "Caramel", "Floral", "Berry", "Citrus", "Tropical", "Winey", "Spicy"];
const REGIONS = ["Chikmagalur", "Coorg", "Araku Valley", "Sakleshpur", "Nilgiris", "Bababudangiri"];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
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

  const isLast = step === onboardingSteps.length - 1;

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
            <div
              key={i}
              className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-amber" : "bg-cream/10")}
            />
          ))}
        </div>
      </div>

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
                active
                  ? "border-amber bg-amber/20 text-amber"
                  : "border-cream/15 text-cream/70 hover:border-cream/30",
              )}
            >
              {item}
            </button>
          );
        })}
      </div>

      {step === 2 && (
        <div className="mt-8 rounded-2xl border border-amber/20 bg-roast p-4">
          <p className="text-sm font-medium text-amber">Preview: Your flavor DNA</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(selected.flavors ?? []).map((f) => (
              <span key={f} className="rounded-full bg-amber/10 px-3 py-1 text-xs text-cream">
                {f}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
          className="rounded-full px-4 py-2 text-sm text-cream/60 disabled:opacity-30"
        >
          Back
        </button>
        {isLast ? (
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full bg-amber px-6 py-2 text-sm font-medium text-espresso"
          >
            <Check className="h-4 w-4" />
            Save DNA & view profile
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-full bg-amber px-6 py-2 text-sm font-medium text-espresso"
          >
            Continue
          </button>
        )}
      </div>
    </div>
  );
}
