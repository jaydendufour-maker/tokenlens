import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRO_PRICE_USD = 29;

/** Maakt een NOWPayments-invoice voor de ingelogde user en geeft de betaal-URL terug. */
export async function POST() {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.NOWPAYMENTS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "crypto_not_configured" },
      { status: 503 }
    );
  }

  const res = await fetch("https://api.nowpayments.io/v1/invoice", {
    method: "POST",
    headers: { "x-api-key": apiKey, "content-type": "application/json" },
    body: JSON.stringify({
      price_amount: PRO_PRICE_USD,
      price_currency: "usd",
      order_id: user.id, // ← komt terug in de IPN als order_id
      order_description: "TokenLens Pro — 1 month",
      ipn_callback_url: `${SITE_URL}/api/billing/nowpayments`,
      success_url: `${SITE_URL}/dashboard`,
      cancel_url: `${SITE_URL}/upgrade`,
    }),
  });

  const data = (await res.json().catch(() => null)) as {
    invoice_url?: string;
  } | null;
  if (!res.ok || !data?.invoice_url) {
    return NextResponse.json({ error: "invoice_failed" }, { status: 502 });
  }
  return NextResponse.json({ url: data.invoice_url });
}
