import type { ModelPrice } from "./pricing.js";

/** De tags waarmee je kosten toewijst — het hart van TokenLens. */
export interface Tags {
  /** Welke eindklant veroorzaakte deze call (kern-attributie). */
  customer?: string;
  /** Welke feature/product-onderdeel. */
  feature?: string;
  /** Welk intern team / kostenplaats. */
  team?: string;
  /** Vrije extra tags. */
  [key: string]: string | number | undefined;
}

/** Eén gelogde LLM-call. */
export interface UsageEvent {
  ts: string; // ISO timestamp
  provider: "openai" | "anthropic" | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  latencyMs?: number;
  tags: Tags;
}

/** Waar events heen gaan. Implementeer je eigen sink of gebruik httpSink/consoleSink. */
export interface Sink {
  record(event: UsageEvent): void | Promise<void>;
  flush?(): void | Promise<void>;
}

export interface TokenLensConfig {
  sink: Sink;
  pricing?: Record<string, ModelPrice>;
  /** Default-tags toegepast op elke call (bv. team/omgeving). */
  defaultTags?: Tags;
}
