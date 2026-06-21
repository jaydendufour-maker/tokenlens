import assert from "node:assert/strict";
import test from "node:test";
import { MAX_BODY_BYTES, parseIngestBody } from "./ingest-validation.ts";

test("normalizes a valid SDK event", () => {
  const result = parseIngestBody(JSON.stringify({ events: [{
    ts: "2026-06-21T12:00:00Z", provider: "openai", model: "gpt-test",
    inputTokens: 10, outputTokens: 2, costUsd: 0.01,
    tags: { customer: "acme", attempts: 2 },
  }] }), Date.parse("2026-06-21T12:01:00Z"));
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.events[0].customer, "acme");
    assert.equal(result.events[0].input_tokens, 10);
  }
});

test("rejects negative cost and nested tags", () => {
  for (const event of [
    { costUsd: -1 },
    { latencyMs: -1 },
    { tags: { nested: { secret: true } } },
  ]) {
    const result = parseIngestBody(JSON.stringify({ events: [event] }));
    assert.equal(result.ok, false);
  }
});

test("rejects oversized bodies and batches", () => {
  assert.equal(parseIngestBody("x".repeat(MAX_BODY_BYTES + 1)).status, 413);
  const result = parseIngestBody(JSON.stringify({ events: Array(501).fill({}) }));
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 413);
});
