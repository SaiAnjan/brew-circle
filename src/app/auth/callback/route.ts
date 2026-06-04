import type { DbCoffeeDna, DbProfile } from "@/lib/database.types";
import { getSupabaseEnv } from "@/lib/supabase/config";
import { createServerClient } from "@supabase/ssr";
import { isOnboardingComplete } from "@/lib/onboarding";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/profile";
  let target = next;
  const response = NextResponse.redirect(`${origin}${target}`);

  if (code) {
    const { url, key, configured } = getSupabaseEnv();
    if (configured) {
      const supabase = createServerClient(url!, key!, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      });

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

  response.headers.set("Location", `${origin}${target}`);
  return response;
}
