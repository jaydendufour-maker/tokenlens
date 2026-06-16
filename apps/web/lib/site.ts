/**
 * Centrale site-constanten. Eén plek om de publieke URL en GitHub-repo te zetten.
 * Overschrijfbaar via env zodat je niks in de code hoeft te wijzigen bij launch.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://tokenlens.dev";

// Zet NEXT_PUBLIC_GITHUB_URL bij launch (of vervang USER hieronder door je handle).
export const GITHUB_URL =
  process.env.NEXT_PUBLIC_GITHUB_URL ?? "https://github.com/USER/tokenlens";

// LemonSqueezy hosted-checkout-link voor Pro (kaart). Leeg = kaart-rail nog uit.
export const LS_CHECKOUT_URL =
  process.env.NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL ?? "";

export const PRO_PRICE = "$29/mo";
