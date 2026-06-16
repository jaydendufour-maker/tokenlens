import { NextRequest, NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * E-mailbevestiging (signup + wachtwoord-reset). Supabase stuurt een link met
 * token_hash (aanbevolen) of een code (PKCE). Beide afgehandeld → sessie gezet
 * → door naar het dashboard. Faalt het → terug naar /login met een melding.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  const dest = (path: string) => NextResponse.redirect(`${SITE_URL}${path}`);
  const sb = await createServerSupabase();

  if (tokenHash && type) {
    const { error } = await sb.auth.verifyOtp({ type, token_hash: tokenHash });
    return error
      ? dest("/login?error=" + encodeURIComponent(error.message))
      : dest(next);
  }

  if (code) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    return error
      ? dest("/login?error=" + encodeURIComponent(error.message))
      : dest(next);
  }

  return dest("/login?error=" + encodeURIComponent("Ongeldige of verlopen link"));
}
