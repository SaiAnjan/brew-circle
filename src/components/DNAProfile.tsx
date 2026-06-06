import type { CoffeeDNA } from "@/lib/types";
import { Dna } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";

function TagGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-muted">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DNAProfile({ dna }: { dna: CoffeeDNA }) {
  const groups = [
    { label: "Methods", items: dna.methods },
    { label: "Equipment", items: dna.equipment },
    { label: "Roast prefs", items: dna.roastPrefs },
    { label: "Processing", items: dna.processPrefs },
    { label: "Flavor notes", items: dna.flavorPrefs },
    { label: "Regions", items: dna.regions },
    { label: "Estates", items: dna.estates },
    { label: "Roasters", items: dna.favoriteRoasters },
    { label: "Beans", items: dna.favoriteBeans },
  ];
  const hasDna = groups.some((group) => group.items.length > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Dna className="h-5 w-5 text-accent" />
        <h3 className="font-display text-lg text-foreground">Coffee DNA</h3>
      </div>
      {hasDna ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {groups.map((group) => (
            <TagGroup key={group.label} label={group.label} items={group.items} />
          ))}
        </div>
      ) : (
        <EmptyState
          className="border-border/70 bg-background/60"
          icon={<Dna className="h-5 w-5" />}
          title="No Coffee DNA yet"
          description="Complete onboarding to turn your drink choices into a simple coffee profile."
          actionHref="/onboarding"
          actionLabel="Complete onboarding"
        />
      )}
    </div>
  );
}
