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
  const persona = profile.coffee_persona;
  const hasContact = hasValue(profile.email) || hasValue(profile.phone);
  const hasProfileBasics = hasRealName && hasRealHandle && hasContact && hasValue(profile.location);

  if (!hasProfileBasics) return false;

  if (persona === "cafe_regular") {
    return hasSelections(dna.usual_drinks) && hasSelections(dna.cafe_visit_reasons) && hasValue(dna.cafe_frequency);
  }

  if (persona === "casual_drinker" || persona === "coffee_curious") {
    return hasSelections(dna.usual_drinks) && hasValue(dna.cafe_frequency);
  }

  return hasSelections(dna.methods) && hasSelections(dna.equipment) && hasSelections(dna.flavor_prefs) && hasSelections(dna.regions);
}
