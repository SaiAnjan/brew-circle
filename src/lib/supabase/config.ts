export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return { url, key, configured: Boolean(url && key) };
}

export function getAuthRedirectOrigin(currentOrigin?: string) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, "");

  if (currentOrigin && !/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(currentOrigin)) {
    return currentOrigin.replace(/\/$/, "");
  }

  return "https://brew-circle.vercel.app";
}
