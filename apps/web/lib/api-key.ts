import { createHash, randomBytes } from "node:crypto";

const PREFIX = "tk_live_";

/** Genereer een nieuwe API-key + bijbehorende hash/prefix voor opslag. */
export function generateApiKey(): {
  key: string;        // toon één keer aan de user, sla NOOIT op
  hash: string;       // sla dit op (api_key_hash)
  prefix: string;     // sla dit op voor weergave (api_key_prefix)
} {
  const secret = randomBytes(24).toString("base64url");
  const key = PREFIX + secret;
  return {
    key,
    hash: hashApiKey(key),
    prefix: key.slice(0, PREFIX.length + 6), // tk_live_ab12cd
  };
}

/** sha256-hash van een key — voor opslag en vergelijking. */
export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}
