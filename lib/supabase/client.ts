import { createBrowserClient } from "@supabase/ssr";

// Supabase project tayyor bo'lgach `supabase gen types` bilan almashtiring
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
