"""TokenLens — FinOps voor LLM's. Kosten-attributie per customer/feature/team.

    import tokenlens as tl

    tl.configure(sink=tl.HttpSink("https://app.tokenlens/api/ingest", "tl_..."))

    res = tl.track({"customer": "acme", "feature": "summarizer"},
                   lambda: client.chat.completions.create(
                       model="gpt-4o-mini", messages=msgs))

    tl.flush()
"""

from .client import (
    ConsoleSink,
    HttpSink,
    Sink,
    atrack,
    configure,
    flush,
    record,
    track,
    tracked,
)
from .pricing import DEFAULT_PRICING, ModelPrice, cost_usd, price_for
from .types import Tags, UsageEvent

__version__ = "0.1.0"

__all__ = [
    "configure",
    "track",
    "atrack",
    "tracked",
    "record",
    "flush",
    "Sink",
    "ConsoleSink",
    "HttpSink",
    "UsageEvent",
    "Tags",
    "ModelPrice",
    "DEFAULT_PRICING",
    "price_for",
    "cost_usd",
    "__version__",
]
