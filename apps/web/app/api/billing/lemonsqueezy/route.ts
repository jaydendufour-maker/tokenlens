import { NextRequest, NextResponse } from "next/server";
import { verifyLemonSqueezySig, recordAndGrant, revokePro } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * LemonSqueezy webhook (kaart-rail). user-id komt mee via custom data:
 * checkout-link met ?checkout[custom][user_id]=<id> → terug in meta.custom_data.
 */
const ACTIVATE = new Set([
  "subscription_created",
  "subscription_payment_success",
  "subscription_resumed",
  "subscription_unpaused",
]);
const DEACTIVATE = new Set([
  "subscription_cancelled",
  "subscription_expired",
  "subscription_paused",
]);

export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifyLemonSqueezySig(raw, req.headers.get("x-signature"))) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let evt: {
    meta?: { event_name?: string; custom_data?: { user_id?: string } };
    data?: { id?: string; attributes?: { renews_at?: string } };
  };
  try {
    evt = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const name = evt.meta?.event_name ?? "";
  const userId = evt.meta?.custom_data?.user_id;
  if (!userId) {
    return NextResponse.json({ ok: true, skipped: "no_user" });
  }

  if (ACTIVATE.has(name)) {
    const renews = evt.data?.attributes?.renews_at ?? null;
    const id = String(evt.data?.id ?? "");
    const res = await recordAndGrant({
      userId,
      provider: "lemonsqueezy",
      externalId: `${name}:${id}:${renews ?? ""}`,
      status: name,
      until: renews,
    });
    return NextResponse.json({ ok: res !== "error", result: res });
  }

  if (DEACTIVATE.has(name)) {
    await revokePro(userId);
    return NextResponse.json({ ok: true, result: "revoked" });
  }

  return NextResponse.json({ ok: true, skipped: name });
}
