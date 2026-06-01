import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

export function createClient() {
  const { url, key } = getSupabaseEnv();
  if (!url || !key) {
    throw new Error("Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient(url, key);
}

export function createClientIfConfigured() {
  const { url, key, configured } = getSupabaseEnv();
  if (!configured) return null;
  return createBrowserClient(url!, key!);
}
