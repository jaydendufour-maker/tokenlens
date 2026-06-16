import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Betaal-helpers. Provider-agnostisch: beide rails (crypto + kaart) sturen een
 * webhook die uiteindelijk `recordAndGrant` aanroept → idempotent Pro toekennen.
 */

// ── signature-verificatie ──────────────────────────────────────────────────
function safeEq(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}

// NOWPayments IPN: HMAC-SHA512 van de JSON met alfabetisch gesorteerde keys.
function sortDeep(v: unknown): unknown {
  if (Array.isArray(v)) return v.map(sortDeep);
  if (v && typeof v === "object") {
    return Object.keys(v as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortDeep((v as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return v;
}

export function verifyNowPaymentsSig(
  rawBody: string,
  sig: string | null
): boolean {
  const secret = process.env.NOWPAYMENTS_IPN_SECRET;
  if (!secret || !sig) return false;
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawBody);
  } catch {
    return false;
  }
  const digest = createHmac("sha512", secret)
    .update(JSON.stringify(sortDeep(parsed)))
    .digest("hex");
  return safeEq(digest, sig);
}

// LemonSqueezy: HMAC-SHA256 (hex) van de RAUWE request-body.
export function verifyLemonSqueezySig(
  rawBody: string,
  sig: string | null
): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !sig) return false;
  const digest = createHmac("sha256", secret).update(rawBody).digest("hex");
  return safeEq(digest, sig);
}

// ── Pro toekennen / intrekken ──────────────────────────────────────────────
interface GrantInput {
  userId: string;
  provider: "nowpayments" | "lemonsqueezy" | "paddle";
  externalId: string; // uniek per betaling/event → idempotentie
  status: string;
  amountUsd?: number | null;
  until?: string | null; // exacte vervaldatum (kaart-abo: renews_at)
  addMonths?: number; // crypto: verleng met N maanden vanaf max(nu, huidige)
}

export async function recordAndGrant(
  i: GrantInput
): Promise<"ok" | "duplicate" | "error"> {
  const admin = createAdminClient();

  // idempotentie: dezelfde (provider, external_id) telt maar één keer
  const { error } = await admin.from("payments").insert({
    user_id: i.userId,
    provider: i.provider,
    external_id: i.externalId,
    status: i.status,
    amount_usd: i.amountUsd ?? null,
  });
  if (error) {
    if ((error as { code?: string }).code === "23505") return "duplicate";
    return "error";
  }

  let until = i.until ?? null;
  if (i.addMonths) {
    const { data } = await admin
      .from("profiles")
      .select("plan_expires_at")
      .eq("id", i.userId)
      .maybeSingle();
    const now = new Date();
    const base =
      data?.plan_expires_at && new Date(data.plan_expires_at) > now
        ? new Date(data.plan_expires_at)
        : now;
    base.setMonth(base.getMonth() + i.addMonths);
    until = base.toISOString();
  }

  const { error: upErr } = await admin
    .from("profiles")
    .update({ plan: "pro", plan_expires_at: until })
    .eq("id", i.userId);
  return upErr ? "error" : "ok";
}

export async function revokePro(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("profiles").update({ plan: "free" }).eq("id", userId);
}
