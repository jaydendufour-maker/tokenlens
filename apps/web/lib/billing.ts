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
  // Eén DB-transactie: payment-log en planupdate slagen samen of geen van beide.
  const { data, error } = await admin.rpc("grant_pro_from_payment", {
    p_user_id: i.userId,
    p_provider: i.provider,
    p_external_id: i.externalId,
    p_status: i.status,
    p_amount_usd: i.amountUsd ?? null,
    p_until: i.until ?? null,
    p_add_months: i.addMonths ?? 0,
  });
  if (error) return "error";
  return data === "duplicate" ? "duplicate" : data === "ok" ? "ok" : "error";
}

export async function revokePro(userId: string): Promise<void> {
  const admin = createAdminClient();
  await admin.from("profiles").update({ plan: "free" }).eq("id", userId);
}
