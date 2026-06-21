# Show HN post

> Post type: **Show HN**. Title field + body field below.
> HN rules: no marketing voice, lead with the problem, be honest it's early,
> ask for feedback. Reply to every comment fast in the first 2 hours.

---

## Title (max 80 chars — pick one)

- `Show HN: TokenLens – attribute your LLM bill to customer, feature, and team`
- `Show HN: Open-source SDK to see which customer is eating your OpenAI bill`

(First one is safer/clearer. Keep it plain — no emoji, no "revolutionary".)

---

## URL field

`https://agentauditor-jd.duckdns.org`  *(or your custom domain once set)*

---

## Body (first comment — post this yourself right after submitting)

I kept hitting the same wall: the OpenAI/Anthropic dashboards tell you *what
you spent*, but not *who or what spent it*. When one customer's usage spikes or
a new feature quietly doubles the bill, you find out at the end of the month
with no way to break it down.

TokenLens is a small SDK + dashboard that fixes the attribution gap. You wrap
your LLM calls with tags:

```python
import tokenlens as tl
tl.configure(sink=tl.HttpSink(URL, API_KEY))

res = tl.track(
    {"customer": "acme-inc", "feature": "summarizer"},
    lambda: client.chat.completions.create(model="gpt-4o-mini", messages=msgs),
)
```

It reads `usage` from the response (OpenAI *or* Anthropic), computes cost from a
pricing table, and logs the event with your tags. The dashboard then shows cost
over time and a breakdown by customer / feature / model, plus budget alerts
(email + webhook) so you hear about a spike *before* finance does.

What it deliberately is **not**: a full observability/tracing tool. Helicone and
Langfuse already do prompts, latency, traces. The one thing I wanted and
couldn't get cleanly was **cost attribution per business dimension** — so that's
the whole wedge.

Details:
- SDKs are open source, MIT, zero runtime deps — TypeScript (`tokenlens-sdk` on
  npm) and Python (`tokenlens-sdk` on PyPI). Bring your own sink if you don't
  want the hosted backend.
- Free tier shows totals; the per-dimension breakdown + alerts are paid.
- Telemetry never blocks your app — a failed network call re-buffers, it never
  throws into your request path.

It's early and I'm solo on it, so I'd genuinely like feedback on:
1. Is tag-on-the-call the right ergonomic, or would you want auto-instrumentation
   (monkeypatch the client) instead?
2. What dimension am I missing besides customer/feature/team/model?

Repo: https://github.com/jaydendufour-maker/tokenlens  ·  Happy to answer anything.
