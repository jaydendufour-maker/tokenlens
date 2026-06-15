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
  "gpt-4o-mini": { in: 0.15, out: 0.6 },
  "gpt-4o": { in: 2.5, out: 10 },
  "gpt-4.1-mini": { in: 0.4, out: 1.6 },
  "gpt-4.1": { in: 2, out: 8 },
  "o3-mini": { in: 1.1, out: 4.4 },
  "o3": { in: 2, out: 8 },
  // Anthropic
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
