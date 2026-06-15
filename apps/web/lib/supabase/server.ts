import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Auth-client voor het dashboard (leest de ingelogde user via cookies).
 * Respecteert RLS — users zien alleen eigen data.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll vanuit een Server Component — veilig te negeren met middleware-refresh.
          }
        },
      },
    }
  );
}
