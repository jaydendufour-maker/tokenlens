# r/devops + r/FinOps — post

> Audience: cost-control / platform / FinOps people. Angle = chargeback,
> showback, budget guardrails. Treat LLM spend like any other cloud cost line.

## Title

`LLM spend has no cost-attribution layer — built one (showback per team/feature + budget alerts)`

## Body

We have showback/chargeback for compute, storage, egress — but LLM API spend
shows up as one opaque vendor line, even though it's increasingly a real chunk
of the bill and grows with usage.

TokenLens adds the attribution layer: tag each LLM call with `team` / `feature`
/ `customer`, and get cost broken down by dimension over time, plus budget
alerts via email + webhook (wire it to Slack/PagerDuty) when a scope crosses a
threshold.

- SDK is MIT + zero-dep (TS + Python). Telemetry never blocks the request path
  (failed sends re-buffer, never throw).
- `Sink` interface is pluggable if you want events in your own warehouse instead
  of the hosted dashboard.

```python
tl.track({"team": "search", "feature": "reranker"},
         lambda: client.messages.create(model="claude-3-5-sonnet-...", ...))
```

Curious how teams here handle this today — homegrown tagging in logs + a dbt
model? Something off-the-shelf? Repo: <GITHUB_URL>
