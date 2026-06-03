import { createClient } from "@/lib/supabase/server";
import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { isOnboardingComplete } from "@/lib/onboarding";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";
  let target = next;

  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          if (user.email) {
            await supabase.from("profiles").update({ email: user.email }).eq("id", user.id).is("email", null);
          }

          const [{ data: profile }, { data: dna }] = await Promise.all([
            supabase.from("profiles").select("*").eq("id", user.id).single(),
            supabase.from("coffee_dna").select("*").eq("user_id", user.id).single(),
          ]);

          target = isOnboardingComplete(profile as DbProfile | null, dna as DbCoffeeDna | null)
            ? "/profile"
            : "/onboarding";
        }
      }
    }
  }

  return NextResponse.redirect(`${origin}${target}`);
}
