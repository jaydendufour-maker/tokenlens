# tokenlens-sdk

**FinOps for LLMs.** Wrap any OpenAI/Anthropic call and attribute its cost to a
customer, feature or team — so you can see *who* is eating your LLM bill and get
alerted before the invoice lands.

The SDK measures your calls. It never proxies them and never sees your provider keys.

## Install

```bash
npm i tokenlens-sdk
```

## Quick start

```ts
import { configure, httpSink, track } from "tokenlens-sdk";

configure({
  sink: httpSink({
    url: "https://your-tokenlens-host/api/ingest",
    apiKey: "tk_live_...", // your TokenLens project key
  }),
  defaultTags: { team: "growth" },
});

// wrap any LLM call — that's it
const res = await track(
  { customer: "acme-inc", feature: "chat" },
  () => openai.chat.completions.create({ model: "gpt-4o-mini", messages })
);
```

`track` runs your call, reads token usage from the response, computes cost from the
model, and ships an event with your tags. Cost is derived consistently across your
whole codebase — no per-call bookkeeping.

Call `flush()` before your process exits so the last batch is sent.

## API

- `configure(config)` — set the sink and default tags once at startup.
- `track(tags, fn)` — run `fn` (your LLM call) and record an attributed usage event.
- `httpSink({ url, apiKey })` — send events to a TokenLens backend.
- `consoleSink()` — log events to stdout (handy for local dev).
- `flush()` — flush any buffered events.
- `costUsd(model, inTokens, outTokens)` / `priceFor(model)` — pricing helpers.
- `DEFAULT_PRICING` — override per-model prices via `configure({ pricing })`.

## Why not just observability?

Helicone, Langfuse and friends give you traces. tokenlens answers a money-shaped
question instead: which customer, feature or team is this dollar for? That's cost
attribution — the FinOps layer on top of usage.

## License

MIT
