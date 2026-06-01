import { currentUser } from "@/lib/data";
import type { UserProfile } from "@/lib/types";
import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";

function dbToUserProfile(row: DbProfile, dna: DbCoffeeDna | null): UserProfile {
  const flavorCoverage = row.flavor_coverage as UserProfile["flavorCoverage"];
  return {
    id: row.id,
    name: row.name ?? "Brewer",
    handle: row.handle ?? "brewer",
    avatar: row.avatar_initials ?? "BC",
    bio: row.bio ?? "",
    location: row.location ?? "",
    brewCount: row.brew_count,
    followerCount: row.follower_count,
    dna: {
      methods: (dna?.methods ?? []) as UserProfile["dna"]["methods"],
      equipment: dna?.equipment ?? [],
      favoriteBeans: dna?.favorite_beans ?? [],
      favoriteRoasters: dna?.favorite_roasters ?? [],
      roastPrefs: dna?.roast_prefs ?? [],
      processPrefs: dna?.process_prefs ?? [],
      flavorPrefs: (dna?.flavor_prefs ?? []) as UserProfile["dna"]["flavorPrefs"],
      regions: dna?.regions ?? [],
      estates: dna?.estates ?? [],
    },
    flavorCoverage: flavorCoverage as UserProfile["flavorCoverage"],
    journey: (row.journey ?? []) as UserProfile["journey"],
    qaStats: row.qa_stats,
    marketplaceRep: row.marketplace_rep,
  };
}

export async function getCurrentUserProfile(): Promise<UserProfile> {
  const supabase = await createClient();
  if (!supabase) return currentUser;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return currentUser;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (!profile) return currentUser;

  const { data: dna } = await supabase.from("coffee_dna").select("*").eq("user_id", user.id).single();

  return dbToUserProfile(profile as DbProfile, dna as DbCoffeeDna | null);
}

export async function updateCoffeeDna(
  userId: string,
  patch: Partial<{
    methods: string[];
    equipment: string[];
    flavor_prefs: string[];
    regions: string[];
  }>,
) {
  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };
  return supabase.from("coffee_dna").update(patch).eq("user_id", userId);
}
