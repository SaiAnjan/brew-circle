import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";

function hasValue(value: string | null | undefined) {
  return Boolean(value?.trim());
}

function hasSelections(values: string[] | null | undefined) {
  return Array.isArray(values) && values.length > 0;
}

function hasCompletedMarker(profile: DbProfile) {
  return hasValue(profile.onboarding_completed_at) || hasValue(profile.coffee_persona);
}

function hasAnyDnaSelections(dna: DbCoffeeDna | null) {
  if (!dna) return false;
  return (
    hasSelections(dna.methods) ||
    hasSelections(dna.equipment) ||
    hasSelections(dna.favorite_beans) ||
    hasSelections(dna.favorite_roasters) ||
    hasSelections(dna.flavor_prefs) ||
    hasSelections(dna.regions) ||
    hasSelections(dna.usual_drinks) ||
    hasSelections(dna.cafe_visit_reasons) ||
    hasSelections(dna.learning_goals) ||
    hasValue(dna.cafe_frequency) ||
    hasValue(dna.experience_level)
  );
}

export function isOnboardingComplete(profile: DbProfile | null, dna: DbCoffeeDna | null) {
  if (!profile) return false;
  if (hasCompletedMarker(profile)) return true;
  if (hasAnyDnaSelections(dna)) return true;

  const hasRealName = hasValue(profile.name) && profile.name !== "Brewer";
  const hasRealHandle = hasValue(profile.handle) && !profile.handle?.startsWith("brewer_");
  return hasRealName && hasRealHandle;
}
