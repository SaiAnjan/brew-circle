import type { CoffeeDNA } from "@/lib/types";
import { Dna } from "lucide-react";

function TagGroup({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-cream/40">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-cream/10 bg-espresso px-2.5 py-1 text-xs text-cream/90">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DNAProfile({ dna }: { dna: CoffeeDNA }) {
  return (
    <div className="rounded-2xl border border-amber/20 bg-gradient-to-br from-roast to-espresso p-5">
      <div className="mb-4 flex items-center gap-2">
        <Dna className="h-5 w-5 text-amber" />
        <h3 className="font-display text-lg text-cream">Coffee DNA</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TagGroup label="Methods" items={dna.methods} />
        <TagGroup label="Equipment" items={dna.equipment} />
        <TagGroup label="Roast prefs" items={dna.roastPrefs} />
        <TagGroup label="Processing" items={dna.processPrefs} />
        <TagGroup label="Flavor notes" items={dna.flavorPrefs} />
        <TagGroup label="Regions" items={dna.regions} />
        <TagGroup label="Estates" items={dna.estates} />
        <TagGroup label="Roasters" items={dna.favoriteRoasters} />
        <TagGroup label="Beans" items={dna.favoriteBeans} />
      </div>
    </div>
  );
}
