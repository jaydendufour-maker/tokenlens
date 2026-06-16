---
title: How to track OpenAI cost per customer
description: A practical, code-first guide to attributing your OpenAI spend to individual customers so you can see margins and stop silent overspend.
date: 2026-06-16
keywords: track openai cost per customer, openai cost attribution, llm cost per user, openai usage tracking
---

If you sell an AI product, your OpenAI bill is one number and your customers are many. The moment a single customer's usage spikes, you find out weeks later — on the invoice. This guide shows how to attribute every OpenAI call to a customer so you can see per-customer cost in real time.

## Why per-customer cost matters

Without attribution you can't answer three questions that decide whether your product survives:

- Which customers are unprofitable at their current plan?
- Which feature is driving the bill, and for whom?
- Is a spike an abusive user, a bug, or real growth?

List price per 1M tokens is the easy part. The hard part is mapping spend back to the customer who caused it.

## The naive approach (and why it breaks)

The first instinct is to log `usage` from the OpenAI response and write a row to your database. That works until you have retries, streaming, multiple models, and three engineers who each log slightly differently. Within a month your numbers don't reconcile with the invoice.

You want one wrapper that every call goes through, that computes cost the same way every time.

## The wrapper approach

Wrap each call once, tag it with the customer, and let the tracker compute cost from token usage:

```ts
import { track } from "tokenlens-sdk";

const res = await track(
  { customer: "acme-inc", feature: "chat" },
  () => openai.chat.completions.create({ model: "gpt-4o-mini", messages })
);
```

Now every call carries a `customer` tag. Cost is derived from the model and token counts, so it's consistent across your whole codebase — no per-call bookkeeping.

## Turning calls into per-customer cost

Once calls are tagged, aggregation is a `group by customer`. You get a table like:

- `acme-inc` — $214.80 this month
- `globex` — $61.20
- `initech` — $9.40

From there you can spot the customer who is 3× your average, set a budget alert, or move them to a higher tier before the bill lands.

## Set an alert before the bill

Attribution tells you what happened. An alert tells you *while* it's happening. Set a per-customer monthly threshold and get a webhook or email the moment a customer crosses it — that's the difference between catching overspend on day 3 versus on the invoice.

## Summary

- Route every OpenAI call through one wrapper.
- Tag each call with the customer (and feature/team).
- Aggregate by customer to see real per-customer cost.
- Add a threshold alert so spikes reach you early.

TokenLens does exactly this — an open-source SDK for the wrapper, a dashboard for attribution, and budget alerts on top. It's free to start.
