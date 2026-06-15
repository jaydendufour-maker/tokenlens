import { costUsd } from "./pricing.js";
import type { Sink, Tags, TokenLensConfig, UsageEvent } from "./types.js";

export * from "./types.js";
export * from "./pricing.js";

let config: TokenLensConfig | null = null;

/** Initialiseer TokenLens één keer bij app-start. */
export function configure(cfg: TokenLensConfig): void {
  config = cfg;
}

function requireConfig(): TokenLensConfig {
  if (!config) {
    throw new Error("TokenLens: roep configure({ sink }) aan voordat je tracked.");
  }
  return config;
}

/** Sink die events naar stdout schrijft — handig om te dogfooden. */
export function consoleSink(): Sink {
  return {
    record(e) {
      // eslint-disable-next-line no-console
      console.log(`[tokenlens] $${e.costUsd.toFixed(6)} ${e.model} ${JSON.stringify(e.tags)}`);
    },
  };
}

/** Sink die events batcht en naar de TokenLens-backend POST't. */
export function httpSink(opts: {
  url: string;
  apiKey: string;
  batchSize?: number;
  fetchImpl?: typeof fetch;
}): Sink {
  const batchSize = opts.batchSize ?? 20;
  const f = opts.fetchImpl ?? fetch;
  let buffer: UsageEvent[] = [];
  const send = async () => {
    if (buffer.length === 0) return;
    const batch = buffer;
    buffer = [];
    try {
      await f(opts.url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${opts.apiKey}`,
        },
        body: JSON.stringify({ events: batch }),
      });
    } catch {
      // Nooit de app laten crashen op een telemetrie-fout; her-buffer voor flush.
      buffer = batch.concat(buffer);
    }
  };
  return {
    record(e) {
      buffer.push(e);
      if (buffer.length >= batchSize) void send();
    },
    flush: send,
  };
}

interface UsageNumbers {
  inputTokens: number;
  outputTokens: number;
}

/** Lees token-aantallen uit een OpenAI- of Anthropic-response. */
function extractUsage(response: unknown): UsageNumbers | null {
  const u = (response as { usage?: Record<string, number> })?.usage;
  if (!u) return null;
  // OpenAI: prompt_tokens / completion_tokens. Anthropic: input_tokens / output_tokens.
  const inputTokens = u.prompt_tokens ?? u.input_tokens ?? 0;
  const outputTokens = u.completion_tokens ?? u.output_tokens ?? 0;
  return { inputTokens, outputTokens };
}

/**
 * Wrap één LLM-call: voert `fn` uit, leest usage uit de response,
 * berekent kosten en logt het event mét jouw tags.
 *
 *   const res = await track({ customer: "acme", feature: "summarizer" },
 *     () => openai.chat.completions.create({ model: "gpt-4o-mini", messages }));
 */
export async function track<T>(
  tags: Tags,
  fn: () => Promise<T>,
  opts?: { provider?: string; model?: string }
): Promise<T> {
  const cfg = requireConfig();
  const started = nowMs();
  const response = await fn();
  const latencyMs = nowMs() - started;

  const usage = extractUsage(response);
  const model =
    opts?.model ?? (response as { model?: string })?.model ?? "unknown";
  const provider =
    opts?.provider ?? guessProvider(model);

  if (usage) {
    const event: UsageEvent = {
      ts: isoNow(),
      provider,
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: costUsd(model, usage.inputTokens, usage.outputTokens, cfg.pricing),
      latencyMs,
      tags: { ...cfg.defaultTags, ...tags },
    };
    await cfg.sink.record(event);
  }
  return response;
}

function guessProvider(model: string): string {
  if (model.startsWith("claude")) return "anthropic";
  if (model.startsWith("gpt") || model.startsWith("o3") || model.startsWith("o1")) return "openai";
  return "unknown";
}

// Time helpers — geïsoleerd zodat tests ze kunnen mocken.
function nowMs(): number {
  return Number(process.hrtime.bigint() / 1_000_000n);
}
function isoNow(): string {
  return new Date().toISOString();
}

/** Forceer verzending van gebufferde events (bv. bij shutdown). */
export async function flush(): Promise<void> {
  await config?.sink.flush?.();
}
