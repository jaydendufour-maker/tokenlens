"""TokenLens client — configure, track, sinks. Zero runtime deps (urllib)."""

from __future__ import annotations

import functools
import inspect
import json
import threading
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from typing import Any, Callable, Dict, List, Optional, Protocol, TypeVar, runtime_checkable

from .pricing import ModelPrice, cost_usd
from .types import Tags, UsageEvent

T = TypeVar("T")


@runtime_checkable
class Sink(Protocol):
    """Waar events heen gaan. Implementeer je eigen sink of gebruik
    ``ConsoleSink`` / ``HttpSink``."""

    def record(self, event: UsageEvent) -> None: ...

    def flush(self) -> None: ...


class _Config:
    def __init__(
        self,
        sink: Sink,
        pricing: Optional[Dict[str, ModelPrice]],
        default_tags: Optional[Tags],
    ) -> None:
        self.sink = sink
        self.pricing = pricing
        self.default_tags = default_tags or {}


_config: Optional[_Config] = None


def configure(
    sink: Sink,
    *,
    pricing: Optional[Dict[str, ModelPrice]] = None,
    default_tags: Optional[Tags] = None,
) -> None:
    """Initialiseer TokenLens één keer bij app-start."""
    global _config
    _config = _Config(sink, pricing, default_tags)


def _require_config() -> _Config:
    if _config is None:
        raise RuntimeError(
            "TokenLens: roep configure(sink=...) aan voordat je tracked."
        )
    return _config


# ---------------------------------------------------------------- sinks


class ConsoleSink:
    """Schrijft events naar stdout — handig om te dogfooden."""

    def record(self, event: UsageEvent) -> None:
        print(
            f"[tokenlens] ${event.cost_usd:.6f} {event.model} "
            f"{json.dumps(event.tags, default=str)}"
        )

    def flush(self) -> None:  # niets te flushen
        pass


class HttpSink:
    """Batcht events en POST't ze naar de TokenLens-backend.

    Crasht je app nooit op een telemetrie-fout: bij een netwerkfout worden
    events terug in de buffer gezet voor een volgende ``flush()``.
    """

    def __init__(
        self,
        url: str,
        api_key: str,
        *,
        batch_size: int = 20,
        timeout: float = 5.0,
    ) -> None:
        self.url = url
        self.api_key = api_key
        self.batch_size = batch_size
        self.timeout = timeout
        self._buffer: List[UsageEvent] = []
        self._lock = threading.Lock()

    def record(self, event: UsageEvent) -> None:
        with self._lock:
            self._buffer.append(event)
            ready = len(self._buffer) >= self.batch_size
        if ready:
            self.flush()

    def flush(self) -> None:
        with self._lock:
            if not self._buffer:
                return
            batch = self._buffer
            self._buffer = []
        if not self._send(batch):
            # her-buffer vooraan voor een latere flush
            with self._lock:
                self._buffer = batch + self._buffer

    def _send(self, batch: List[UsageEvent]) -> bool:
        body = json.dumps(
            {"events": [e.to_payload() for e in batch]}, default=str
        ).encode("utf-8")
        req = urllib.request.Request(
            self.url,
            data=body,
            method="POST",
            headers={
                "content-type": "application/json",
                "authorization": f"Bearer {self.api_key}",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                return 200 <= resp.status < 300
        except (urllib.error.URLError, OSError, ValueError):
            return False


# ---------------------------------------------------------------- helpers


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _guess_provider(model: str) -> str:
    if model.startswith("claude"):
        return "anthropic"
    if model.startswith(("gpt", "o3", "o1")):
        return "openai"
    return "unknown"


def _attr_or_key(obj: Any, name: str) -> Any:
    """Lees ``name`` als attribuut (SDK-objecten) óf als dict-key (raw JSON)."""
    if obj is None:
        return None
    if isinstance(obj, dict):
        return obj.get(name)
    return getattr(obj, name, None)


def _extract_usage(response: Any) -> Optional[Dict[str, int]]:
    """Lees token-aantallen uit een OpenAI- of Anthropic-response."""
    u = _attr_or_key(response, "usage")
    if u is None:
        return None
    # OpenAI: prompt_tokens / completion_tokens. Anthropic: input_tokens / output_tokens.
    input_tokens = _attr_or_key(u, "prompt_tokens")
    if input_tokens is None:
        input_tokens = _attr_or_key(u, "input_tokens")
    output_tokens = _attr_or_key(u, "completion_tokens")
    if output_tokens is None:
        output_tokens = _attr_or_key(u, "output_tokens")
    return {
        "input_tokens": int(input_tokens or 0),
        "output_tokens": int(output_tokens or 0),
    }


# ---------------------------------------------------------------- public API


def record(
    tags: Tags,
    *,
    model: str,
    input_tokens: int,
    output_tokens: int,
    provider: Optional[str] = None,
    latency_ms: Optional[float] = None,
) -> UsageEvent:
    """Log een call handmatig (als je de tokens al hebt)."""
    cfg = _require_config()
    event = UsageEvent(
        ts=_iso_now(),
        provider=provider or _guess_provider(model),
        model=model,
        input_tokens=int(input_tokens),
        output_tokens=int(output_tokens),
        cost_usd=cost_usd(model, int(input_tokens), int(output_tokens), cfg.pricing),
        latency_ms=latency_ms,
        tags={**cfg.default_tags, **tags},
    )
    cfg.sink.record(event)
    return event


def track(
    tags: Tags,
    fn: Callable[[], T],
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> T:
    """Wrap één LLM-call: voert ``fn`` uit, leest usage uit de response,
    berekent kosten en logt het event mét jouw tags.

        res = track({"customer": "acme", "feature": "summarizer"},
                    lambda: client.chat.completions.create(
                        model="gpt-4o-mini", messages=messages))
    """
    cfg = _require_config()
    started = time.perf_counter()
    response = fn()
    latency_ms = (time.perf_counter() - started) * 1000

    usage = _extract_usage(response)
    if usage is not None:
        resolved_model = model or _attr_or_key(response, "model") or "unknown"
        record(
            tags,
            model=resolved_model,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
            provider=provider or _guess_provider(resolved_model),
            latency_ms=latency_ms,
        )
    return response


async def atrack(
    tags: Tags,
    fn: Callable[[], Any],
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> Any:
    """Async-variant van :func:`track` — ``fn`` geeft een awaitable terug."""
    cfg = _require_config()
    started = time.perf_counter()
    response = await fn()
    latency_ms = (time.perf_counter() - started) * 1000

    usage = _extract_usage(response)
    if usage is not None:
        resolved_model = model or _attr_or_key(response, "model") or "unknown"
        record(
            tags,
            model=resolved_model,
            input_tokens=usage["input_tokens"],
            output_tokens=usage["output_tokens"],
            provider=provider or _guess_provider(resolved_model),
            latency_ms=latency_ms,
        )
    return response


def tracked(
    tags: Tags,
    *,
    provider: Optional[str] = None,
    model: Optional[str] = None,
) -> Callable[[Callable[..., Any]], Callable[..., Any]]:
    """Decorator-variant: tag elke aanroep van een functie die een LLM-response
    teruggeeft. Werkt op sync én async functies.

        @tl.tracked({"feature": "summarizer"})
        def summarize(text):
            return client.chat.completions.create(model="gpt-4o-mini", messages=...)
    """

    def deco(fn: Callable[..., Any]) -> Callable[..., Any]:
        if inspect.iscoroutinefunction(fn):

            @functools.wraps(fn)
            async def awrapper(*args: Any, **kwargs: Any) -> Any:
                return await atrack(
                    tags, lambda: fn(*args, **kwargs), provider=provider, model=model
                )

            return awrapper

        @functools.wraps(fn)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return track(
                tags, lambda: fn(*args, **kwargs), provider=provider, model=model
            )

        return wrapper

    return deco


def flush() -> None:
    """Forceer verzending van gebufferde events (bv. bij shutdown)."""
    if _config is not None:
        _config.sink.flush()
