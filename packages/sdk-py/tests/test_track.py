import asyncio

import tokenlens as tl


class CaptureSink:
    def __init__(self):
        self.events = []
        self.flushed = 0

    def record(self, event):
        self.events.append(event)

    def flush(self):
        self.flushed += 1


# --- mock responses (lijken op OpenAI / Anthropic SDK-objecten) ---


class _Usage:
    def __init__(self, **kw):
        self.__dict__.update(kw)


class _Resp:
    def __init__(self, model, usage):
        self.model = model
        self.usage = usage


def test_track_leest_openai_usage_en_rekent_kosten():
    sink = CaptureSink()
    tl.configure(sink=sink)
    resp = _Resp("gpt-4o-mini", _Usage(prompt_tokens=1000, completion_tokens=500))

    out = tl.track({"customer": "acme", "feature": "sum"}, lambda: resp)

    assert out is resp
    assert len(sink.events) == 1
    e = sink.events[0]
    assert e.provider == "openai"
    assert e.input_tokens == 1000 and e.output_tokens == 500
    # 1000 @ 0.15/1M + 500 @ 0.6/1M
    assert abs(e.cost_usd - (1000 * 0.15 + 500 * 0.6) / 1_000_000) < 1e-12
    assert e.tags["customer"] == "acme"
    assert e.latency_ms is not None


def test_track_leest_anthropic_usage_uit_dict():
    sink = CaptureSink()
    tl.configure(sink=sink, default_tags={"team": "core"})
    resp = {"model": "claude-3-5-sonnet-20241022",
            "usage": {"input_tokens": 2000, "output_tokens": 1000}}

    tl.track({"feature": "chat"}, lambda: resp)

    e = sink.events[0]
    assert e.provider == "anthropic"
    assert e.tags["team"] == "core"  # default tag toegepast
    assert e.tags["feature"] == "chat"
    assert e.cost_usd == (2000 * 3 + 1000 * 15) / 1_000_000


def test_track_zonder_usage_logt_niets():
    sink = CaptureSink()
    tl.configure(sink=sink)
    tl.track({"customer": "x"}, lambda: {"model": "gpt-4o"})  # geen usage
    assert sink.events == []


def test_record_handmatig():
    sink = CaptureSink()
    tl.configure(sink=sink)
    e = tl.record({"customer": "y"}, model="gpt-4o", input_tokens=1_000_000,
                  output_tokens=0)
    assert e.cost_usd == 2.5
    assert sink.events[0] is e


def test_flush_roept_sink_flush():
    sink = CaptureSink()
    tl.configure(sink=sink)
    tl.flush()
    assert sink.flushed == 1


def test_atrack_async():
    sink = CaptureSink()
    tl.configure(sink=sink)

    async def call():
        return _Resp("gpt-4o", _Usage(input_tokens=10, output_tokens=10))

    asyncio.run(tl.atrack({"customer": "z"}, call))
    assert len(sink.events) == 1
    assert sink.events[0].model == "gpt-4o"
