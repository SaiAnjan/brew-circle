import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasSelections(values: string[] | null | undefined) {
  return Array.isArray(values) && values.length > 0;
}

export function isOnboardingComplete(profile: DbProfile | null, dna: DbCoffeeDna | null) {
  if (!profile || !dna) return false;

  const hasRealName = hasValue(profile.name) && profile.name !== "Brewer";
  const hasRealHandle = hasValue(profile.handle) && !profile.handle?.startsWith("brewer_");

  return (
    hasRealName &&
    hasRealHandle &&
    hasValue(profile.phone) &&
    hasValue(profile.location) &&
    hasSelections(dna.methods) &&
    hasSelections(dna.equipment) &&
    hasSelections(dna.flavor_prefs) &&
    hasSelections(dna.regions)
  );
}
