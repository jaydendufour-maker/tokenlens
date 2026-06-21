import { test } from "node:test";
import assert from "node:assert/strict";
import { costUsd, priceFor } from "./pricing.js";

test("priceFor matcht langste prefix", () => {
  assert.deepEqual(priceFor("gpt-4o-mini-2024-07-18"), { in: 0.15, out: 0.6 });
  assert.deepEqual(priceFor("gpt-4o-2024-08-06"), { in: 2.5, out: 10 });
  assert.deepEqual(priceFor("claude-3-5-sonnet-20241022"), { in: 3, out: 15 });
  assert.deepEqual(priceFor("gpt-5.5-pro-2026-06-01"), { in: 30, out: 180 });
  assert.deepEqual(priceFor("gpt-5.4-mini-2026-03-05"), { in: 0.75, out: 4.5 });
  assert.deepEqual(priceFor("claude-opus-4-8-20260601"), { in: 5, out: 25 });
  assert.deepEqual(priceFor("claude-haiku-4-5-20251001"), { in: 1, out: 5 });
});

test("onbekend model -> null / kosten 0", () => {
  assert.equal(priceFor("llama-3"), null);
  assert.equal(costUsd("llama-3", 1000, 1000), 0);
});

test("costUsd rekent input+output correct", () => {
  // 1M input @ $2.5 + 1M output @ $10 = $12.5
  assert.equal(costUsd("gpt-4o", 1_000_000, 1_000_000), 12.5);
  // 500k input @ $0.15 = $0.075
  assert.equal(costUsd("gpt-4o-mini", 500_000, 0), 0.075);
});
