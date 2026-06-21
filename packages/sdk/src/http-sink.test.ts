import assert from "node:assert/strict";
import test from "node:test";
import { httpSink } from "./index.js";
import type { UsageEvent } from "./types.js";

const event: UsageEvent = {
  ts: "2026-06-21T00:00:00Z", provider: "openai", model: "gpt-test",
  inputTokens: 1, outputTokens: 1, costUsd: 0.01, tags: {},
};

test("http sink retries a batch after non-2xx instead of dropping it", async () => {
  const bodies: string[] = [];
  let calls = 0;
  const sink = httpSink({
    url: "https://example.test/api/ingest", apiKey: "tk_test", batchSize: 1,
    fetchImpl: async (_url, init) => {
      calls++;
      bodies.push(String(init?.body));
      return { ok: calls > 1, status: calls > 1 ? 200 : 500 } as Response;
    },
  });
  sink.record(event);
  await sink.flush?.();
  assert.equal(calls, 2);
  assert.equal(bodies[0], bodies[1]);
});
