/**
 * Model-catalogus voor de programmatic SEO-pagina's (/pricing, /compare).
 * Prijzen in USD per 1M tokens. Prijzen veranderen — dit is een momentopname;
 * elke pagina vermeldt dat expliciet en linkt naar de bron.
 */
export interface Model {
  slug: string;
  apiId?: string;
  name: string;
  provider: "OpenAI" | "Anthropic";
  in: number; // USD / 1M input tokens
  out: number; // USD / 1M output tokens
  blurb: string;
}

export const MODELS: Model[] = [
  {
    slug: "gpt-5-5",
    apiId: "gpt-5.5",
    name: "GPT-5.5",
    provider: "OpenAI",
    in: 5,
    out: 30,
    blurb: "OpenAI's latest general model; standard short-context API pricing.",
  },
  {
    slug: "gpt-5-4",
    apiId: "gpt-5.4",
    name: "GPT-5.4",
    provider: "OpenAI",
    in: 2.5,
    out: 15,
    blurb: "OpenAI general model for coding, agents and complex workflows.",
  },
  {
    slug: "gpt-5-4-mini",
    apiId: "gpt-5.4-mini",
    name: "GPT-5.4 mini",
    provider: "OpenAI",
    in: 0.75,
    out: 4.5,
    blurb: "Lower-cost GPT-5.4 model for high-volume workloads.",
  },
  {
    slug: "gpt-5-4-nano",
    apiId: "gpt-5.4-nano",
    name: "GPT-5.4 nano",
    provider: "OpenAI",
    in: 0.2,
    out: 1.25,
    blurb: "Small GPT-5.4 model for classification and simple high-volume tasks.",
  },
  {
    slug: "claude-opus-4-8",
    name: "Claude Opus 4.8",
    provider: "Anthropic",
    in: 5,
    out: 25,
    blurb: "Anthropic's flagship model for demanding reasoning and agent work.",
  },
  {
    slug: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    in: 3,
    out: 15,
    blurb: "Anthropic's balanced production model for quality, speed and cost.",
  },
  {
    slug: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    in: 1,
    out: 5,
    blurb: "Anthropic's fast model for latency-sensitive, high-volume tasks.",
  },
  {
    slug: "gpt-4o-mini",
    name: "GPT-4o mini",
    provider: "OpenAI",
    in: 0.15,
    out: 0.6,
    blurb: "OpenAI's goedkope, snelle model voor high-volume taken.",
  },
  {
    slug: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    in: 2.5,
    out: 10,
    blurb: "OpenAI's multimodale vlaggenschip voor algemene taken.",
  },
  {
    slug: "gpt-4-1-mini",
    apiId: "gpt-4.1-mini",
    name: "GPT-4.1 mini",
    provider: "OpenAI",
    in: 0.4,
    out: 1.6,
    blurb: "Goedkoop GPT-4.1-model met groot contextvenster.",
  },
  {
    slug: "gpt-4-1",
    apiId: "gpt-4.1",
    name: "GPT-4.1",
    provider: "OpenAI",
    in: 2,
    out: 8,
    blurb: "GPT-4.1 voor coding en lange context.",
  },
  {
    slug: "o3-mini",
    name: "OpenAI o3-mini",
    provider: "OpenAI",
    in: 1.1,
    out: 4.4,
    blurb: "Goedkoper reasoning-model.",
  },
  {
    slug: "o3",
    name: "OpenAI o3",
    provider: "OpenAI",
    in: 2,
    out: 8,
    blurb: "Reasoning-model voor zware redeneertaken.",
  },
  {
    slug: "claude-3-5-haiku",
    name: "Claude 3.5 Haiku",
    provider: "Anthropic",
    in: 0.8,
    out: 4,
    blurb: "Anthropic's snelle, goedkope model.",
  },
  {
    slug: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic",
    in: 3,
    out: 15,
    blurb: "Anthropic's gebalanceerde werkpaard.",
  },
  {
    slug: "claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    in: 15,
    out: 75,
    blurb: "Anthropic's krachtigste (en duurste) model.",
  },
];

/** Curated vergelijkingen — hoge zoekintentie ("X vs Y pricing"). */
export const COMPARISONS: [string, string][] = [
  ["gpt-5-5", "claude-opus-4-8"],
  ["gpt-5-4", "claude-sonnet-4-6"],
  ["gpt-5-4-mini", "claude-haiku-4-5"],
  ["gpt-5-4", "gpt-5-4-mini"],
  ["gpt-4o", "claude-3-5-sonnet"],
  ["gpt-4o-mini", "claude-3-5-haiku"],
];

export function modelBySlug(slug: string): Model | undefined {
  return MODELS.find((m) => m.slug === slug);
}

export function compareSlug(a: string, b: string): string {
  return `${a}-vs-${b}`;
}

/** Kosten in USD voor een gegeven aantal input/output tokens. */
export function calcCost(m: Model, inTok: number, outTok: number): number {
  return (inTok * m.in + outTok * m.out) / 1_000_000;
}

/** Prijs per 1M tokens netjes geformatteerd. */
export function perMillion(n: number): string {
  return `$${n.toFixed(2)}`;
}
