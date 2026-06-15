import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client — ALLEEN server-side (ingest, cron).
 * Bypasst RLS, dus nooit naar de client lekken.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY zijn vereist");
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
