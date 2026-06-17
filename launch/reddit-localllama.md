# r/LocalLLaMA — post

> Audience: hands-on builders, cost-conscious, multi-provider, anti-hype.
> Lead with the dev problem + code. Mention the SDK is open source + BYO-sink.
> Read each sub's self-promo rules before posting; engage in comments.

## Title

`I built an open-source SDK to attribute LLM cost per customer/feature/model (TS + Python)`

## Body

Like a lot of you I run calls across several models/providers and the provider
dashboards only give me one number per month. I couldn't answer "which feature
is this $X?" without grepping logs.

So I made TokenLens: wrap a call, tag it, get a cost breakdown.

```python
import tokenlens as tl
tl.configure(sink=tl.HttpSink(URL, KEY))

tl.track({"customer": "acme", "feature": "rag"},
         lambda: client.chat.completions.create(model="gpt-4o-mini", messages=m))
```

- Reads `usage` from OpenAI **and** Anthropic responses, computes cost from a
  pricing table you can override.
- SDKs are MIT, **zero dependencies**, TS + Python.
- Don't want my backend? Implement the `Sink` interface and ship events wherever
  (Postgres, a file, stdout). The hosted dashboard is optional.

Not trying to be Langfuse/Helicone — no tracing/prompt-logging. Just the cost
attribution piece, because that's the part I kept needing.

Repo + SDK: <GITHUB_URL>

Would love feedback on the API. Specifically: do you prefer explicit
`track(tags, fn)` or auto-patching the client so you don't touch call sites?
