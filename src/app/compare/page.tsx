import { CompatibilityView } from "@/components/CompatibilityView";
import { compareUser, currentUser } from "@/lib/data";

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl text-cream">Compatibility</h1>
      <p className="mt-2 text-cream/60">
        Compare Coffee DNA profiles — shared methods, regions, and flavor prefs.
      </p>
      <div className="mt-10">
        <CompatibilityView userA={currentUser} userB={compareUser} />
      </div>
    </div>
  );
}
