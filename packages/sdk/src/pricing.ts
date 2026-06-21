/**
 * Prijstabel in USD per 1M tokens (input / output).
 * Prijzen veranderen — overschrijf via `configure({ pricing: {...} })`.
 * Matching is op prefix: "gpt-4o-2024-08-06" matcht "gpt-4o".
 */
export interface ModelPrice {
  /** USD per 1M input tokens */
  in: number;
  /** USD per 1M output tokens */
  out: number;
}

export const DEFAULT_PRICING: Record<string, ModelPrice> = {
  // OpenAI
  // Standard short-context rates, verified against official pricing 2026-06-21.
  "gpt-5.5-pro": { in: 30, out: 180 },
  "gpt-5.5": { in: 5, out: 30 },
  "gpt-5.4-mini": { in: 0.75, out: 4.5 },
  "gpt-5.4-nano": { in: 0.2, out: 1.25 },
  "gpt-5.4-pro": { in: 30, out: 180 },
  "gpt-5.4": { in: 2.5, out: 15 },
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4.1": { in: 2, out: 8 },
  "o3-mini": { in: 1.1, out: 4.4 },
  "o3": { in: 2, out: 8 },
  // Anthropic
  // Base input/output rates, verified against official pricing 2026-06-21.
  "claude-fable-5": { in: 10, out: 50 },
  "claude-mythos-5": { in: 10, out: 50 },
  "claude-opus-4-8": { in: 5, out: 25 },
  "claude-opus-4-7": { in: 5, out: 25 },
  "claude-opus-4-6": { in: 5, out: 25 },
  "claude-opus-4-5": { in: 5, out: 25 },
  "claude-sonnet-4-6": { in: 3, out: 15 },
  "claude-sonnet-4-5": { in: 3, out: 15 },
  "claude-haiku-4-5": { in: 1, out: 5 },
  "claude-haiku": { in: 0.8, out: 4 },
  "claude-3-5-haiku": { in: 0.8, out: 4 },
  "claude-sonnet": { in: 3, out: 15 },
  "claude-3-5-sonnet": { in: 3, out: 15 },
  "claude-opus": { in: 15, out: 75 },
  "claude-3-opus": { in: 15, out: 75 },
};

/** Vind de prijs voor een model via langste-prefix-match. */
export function priceFor(
  model: string,
  table: Record<string, ModelPrice> = DEFAULT_PRICING
): ModelPrice | null {
  let best: ModelPrice | null = null;
  let bestLen = -1;
  for (const key of Object.keys(table)) {
    if (model.startsWith(key) && key.length > bestLen) {
      best = table[key];
      bestLen = key.length;
    }
  }
  return best;
}

/** Kosten in USD voor een call. Geeft 0 als model onbekend (logt wel tokens). */
export function costUsd(
  model: string,
  inputTokens: number,
  outputTokens: number,
  table?: Record<string, ModelPrice>
): number {
  const p = priceFor(model, table);
  if (!p) return 0;
  return (inputTokens * p.in + outputTokens * p.out) / 1_000_000;
}
