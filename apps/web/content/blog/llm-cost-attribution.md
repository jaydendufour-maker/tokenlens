---
title: "LLM cost attribution: a practical guide"
description: What LLM cost attribution is, why traces aren't enough, and how to break your AI bill down by customer, feature and team.
date: 2026-06-15
keywords: llm cost attribution, ai cost attribution, llm finops, openai cost breakdown, anthropic cost tracking
---

Most teams can tell you what their LLM bill *was*. Very few can tell you *who* it was for. That gap — turning one big provider invoice into a breakdown you can act on — is cost attribution.

## Attribution vs observability

Observability tools (traces, logs, latency) answer "what happened in this request?". Attribution answers a different, money-shaped question: "which customer, feature or team is this dollar for?"

You can have perfect traces and still not know that one feature is eating 40% of your Anthropic spend. Attribution is a FinOps concern, not a debugging one.

## The three dimensions that matter

For an AI product, almost every useful cost question maps to one of three tags:

- **Customer** — margins, abuse detection, plan design.
- **Feature** — which part of the product is expensive to run.
- **Team** — internal chargeback when several teams share one key.

If every call carries these three tags, you can answer nearly any cost question with a `group by`.

## How to implement it

The reliable pattern is a single wrapper around your LLM calls that records model, token usage and tags:

```ts
import { track } from "tokenlens-sdk";

await track(
  { customer: "acme", feature: "summarize", team: "growth" },
  () => anthropic.messages.create({ model: "claude-3-5-sonnet", ... })
);
```

Two rules make attribution trustworthy:

1. **One code path.** Every call goes through the same wrapper so cost is computed identically.
2. **Tag at the boundary.** Set the customer/feature where you already know them (the request handler), not deep in the stack.

## What good attribution unlocks

- Per-customer margin: revenue minus their real LLM cost.
- Feature ROI: is the AI feature worth what it costs to run?
- Early warnings: a threshold per tag that fires before the invoice.

## Common mistakes

- Attributing only the expensive model and ignoring the cheap one that runs 50× more often.
- Logging tokens but not normalizing cost when prices change.
- Storing everything but never aggregating — data you don't query is just storage cost.

## Summary

Cost attribution is the FinOps layer on top of your LLM usage: tag every call by customer, feature and team, aggregate, and alert. TokenLens is built for exactly this — open-source SDK plus a dashboard that answers the "who pays for what" question. Free to start.
