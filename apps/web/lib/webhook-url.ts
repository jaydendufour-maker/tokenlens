import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

function publicIpv4(address: string): boolean {
  const parts = address.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => part < 0 || part > 255)) return false;
  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19 || b === 51)) return false;
  if (a === 203 && b === 0) return false;
  return true;
}

export function isPublicAddress(address: string): boolean {
  if (isIP(address) === 4) return publicIpv4(address);
  if (isIP(address) !== 6) return false;
  const value = address.toLowerCase();
  if (value.startsWith("::ffff:")) return publicIpv4(value.slice(7));
  return !(
    value === "::" ||
    value === "::1" ||
    value.startsWith("fc") ||
    value.startsWith("fd") ||
    /^fe[89ab]/.test(value) ||
    value.startsWith("ff") ||
    value.startsWith("2001:db8:")
  );
}

export function webhookUrlSyntaxError(value: string): string | null {
  if (value.length > 2048) return "Webhook-URL is te lang";
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return "Webhook-URL is ongeldig";
  }
  if (url.protocol !== "https:") return "Webhook moet HTTPS gebruiken";
  if (url.username || url.password) return "Webhook mag geen credentials bevatten";
  if (url.port && url.port !== "443") return "Webhook moet HTTPS-poort 443 gebruiken";
  const host = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return "Webhook-host is niet toegestaan";
  }
  if (isIP(host) && !isPublicAddress(host)) return "Privé webhook-adressen zijn niet toegestaan";
  return null;
}

export async function isSafeWebhookUrl(value: string): Promise<boolean> {
  if (webhookUrlSyntaxError(value)) return false;
  try {
    const host = new URL(value).hostname;
    const addresses = await lookup(host, { all: true, verbatim: true });
    return addresses.length > 0 && addresses.every(({ address }) => isPublicAddress(address));
  } catch {
    return false;
  }
}
