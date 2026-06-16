import { NextRequest, NextResponse } from "next/server";
import { verifyNowPaymentsSig, recordAndGrant } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * NOWPayments IPN. Bij een afgeronde crypto-betaling → user 1 maand Pro.
 * order_id = onze user-id (meegestuurd bij het aanmaken van de invoice).
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyNowPaymentsSig(raw, req.headers.get("x-nowpayments-sig"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let body: {
    payment_status?: string;
    payment_id?: string | number;
    order_id?: string;
    price_amount?: number;
  };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const status = body.payment_status ?? "";
  // alleen definitieve statussen tellen
  if (status !== "finished" && status !== "confirmed") {
    return NextResponse.json({ ok: true, skipped: status });
  }

  const userId = body.order_id;
  if (!userId || !body.payment_id) {
    return NextResponse.json({ ok: true, skipped: "no_user_or_payment" });
  }

  const res = await recordAndGrant({
    userId,
    provider: "nowpayments",
    externalId: String(body.payment_id),
    status,
    amountUsd: Number(body.price_amount) || null,
    addMonths: 1,
  });

  return NextResponse.json({ ok: res !== "error", result: res });
}
