const MAX_BATCH = 500;
export const MAX_BODY_BYTES = 512_000;
const MAX_TOKENS = 2_147_483_647;
const MAX_COST_USD = 1_000_000;
const MAX_LATENCY_MS = 86_400_000;
const MAX_TAGS = 32;

export interface NormalizedUsageEvent {
  ts: string;
  provider: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  latency_ms: number | null;
  customer: string | null;
  feature: string | null;
  team: string | null;
  tags: Record<string, string | number>;
}

type ParseResult =
  | { ok: true; events: NormalizedUsageEvent[] }
  | { ok: false; error: string; status: number };

function text(value: unknown, fallback: string, max: number): string | null {
  if (value == null) return fallback;
  if (typeof value !== "string") return null;
  const result = value.trim();
  return result.length > 0 && result.length <= max ? result : null;
}

function integer(value: unknown, max: number, nullable = false): number | null {
  if (value == null && nullable) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const result = Math.round(value);
  return result >= 0 && result <= max ? result : null;
}

function normalizeTags(value: unknown): Record<string, string | number> | null {
  if (value == null) return {};
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  if (entries.length > MAX_TAGS) return null;

  const tags: Record<string, string | number> = {};
  for (const [key, tagValue] of entries) {
    if (!key || key.length > 64) return null;
    if (typeof tagValue === "string") {
      if (tagValue.length > 256) return null;
      tags[key] = tagValue;
    } else if (typeof tagValue === "number" && Number.isFinite(tagValue)) {
      tags[key] = tagValue;
    } else if (tagValue != null) {
      return null;
    }
  }
  return tags;
}

export function parseIngestBody(raw: string, nowMs = Date.now()): ParseResult {
  if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, error: "payload_too_large", status: 413 };
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return { ok: false, error: "invalid_json", status: 400 };
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "invalid_body", status: 400 };
  }
  const events = (body as { events?: unknown }).events;
  if (!Array.isArray(events)) {
    return { ok: false, error: "events_required", status: 400 };
  }
  if (events.length > MAX_BATCH) {
    return { ok: false, error: "batch_too_large", status: 413 };
  }

  const normalized: NormalizedUsageEvent[] = [];
  for (const [index, value] of events.entries()) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, error: `invalid_event_${index}`, status: 400 };
    }
    const event = value as Record<string, unknown>;
    const provider = text(event.provider, "unknown", 64);
    const model = text(event.model, "unknown", 160);
    const inputTokens = integer(event.inputTokens ?? 0, MAX_TOKENS);
    const outputTokens = integer(event.outputTokens ?? 0, MAX_TOKENS);
    const latency = integer(event.latencyMs, MAX_LATENCY_MS, true);
    const invalidLatency = event.latencyMs != null && latency == null;
    const tags = normalizeTags(event.tags);
    const cost = event.costUsd ?? 0;
    if (
      provider == null ||
      model == null ||
      inputTokens == null ||
      outputTokens == null ||
      invalidLatency ||
      tags == null ||
      typeof cost !== "number" ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      cost > MAX_COST_USD
    ) {
      return { ok: false, error: `invalid_event_${index}`, status: 400 };
    }

    const parsedTs = event.ts == null ? nowMs : Date.parse(String(event.ts));
    const minTs = Date.UTC(2020, 0, 1);
    if (!Number.isFinite(parsedTs) || parsedTs < minTs || parsedTs > nowMs + 300_000) {
      return { ok: false, error: `invalid_event_${index}`, status: 400 };
    }

    const tagText = (key: string) =>
      tags[key] == null ? null : String(tags[key]).slice(0, 256);
    normalized.push({
      ts: new Date(parsedTs).toISOString(),
      provider,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      cost_usd: cost,
      latency_ms: latency,
      customer: tagText("customer"),
      feature: tagText("feature"),
      team: tagText("team"),
      tags,
    });
  }
  return { ok: true, events: normalized };
}
