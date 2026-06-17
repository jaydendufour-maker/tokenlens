# tokenlens-sdk (Python)

**FinOps for LLMs** — attribute every OpenAI/Anthropic call to a `customer`, `feature`, or `team` and see exactly what's eating your bill.

Zero dependencies. Python 3.8+.

```bash
pip install tokenlens-sdk
```

## Quick start

```python
import tokenlens as tl
from openai import OpenAI

client = OpenAI()

tl.configure(
    sink=tl.HttpSink("https://your-tokenlens/api/ingest", "tl_your_api_key"),
    default_tags={"team": "core"},
)

res = tl.track(
    {"customer": "acme-inc", "feature": "summarizer"},
    lambda: client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "summarize this"}],
    ),
)

tl.flush()  # bij shutdown — stuurt gebufferde events
```

`track()` voert je call uit, leest `usage` uit de response (OpenAI **of** Anthropic, object of dict), berekent de kosten en logt het event met jouw tags. De LLM-response geeft het ongewijzigd terug.

## Anthropic

```python
import anthropic
client = anthropic.Anthropic()

tl.track(
    {"customer": "acme-inc", "feature": "chat"},
    lambda: client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=512,
        messages=[{"role": "user", "content": "hi"}],
    ),
)
```

## Async

```python
res = await tl.atrack(
    {"customer": "acme"},
    lambda: async_client.chat.completions.create(model="gpt-4o-mini", messages=msgs),
)
```

## Manueel loggen

Heb je de tokens al, of gebruik je een provider die `track()` niet kent? Log direct:

```python
tl.record(
    {"customer": "acme", "feature": "embeddings"},
    model="gpt-4o-mini",
    input_tokens=1200,
    output_tokens=300,
)
```

## Sinks

- `tl.ConsoleSink()` — print events naar stdout (dogfooding/debuggen).
- `tl.HttpSink(url, api_key, batch_size=20, timeout=5.0)` — batcht en POST't naar de
  TokenLens-backend. Crasht je app **nooit** op een netwerkfout; events worden
  herbufferd voor de volgende `flush()`.

Eigen bestemming? Implementeer het `Sink`-protocol (`record(event)` + `flush()`).

## Prijzen overschrijven

```python
from tokenlens import ModelPrice
tl.configure(
    sink=...,
    pricing={"gpt-4o": ModelPrice(2.5, 10), "my-model": ModelPrice(1.0, 3.0)},
)
```

Matching is op langste-prefix: `gpt-4o-2024-08-06` matcht `gpt-4o`. Onbekend model →
kosten `0.0` (tokens worden wél gelogd).

## Dev

```bash
cd packages/sdk-py
python -m pytest        # of: python -m unittest discover -s tests
python -m build         # bouwt sdist + wheel
```

MIT.
