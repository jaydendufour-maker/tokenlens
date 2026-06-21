from tokenlens.pricing import cost_usd, price_for


def test_price_for_matcht_langste_prefix():
    assert price_for("gpt-4o-mini-2024-07-18") == (0.15, 0.6)
    assert price_for("gpt-4o-2024-08-06") == (2.5, 10)
    assert price_for("claude-3-5-sonnet-20241022") == (3, 15)
    assert price_for("gpt-5.5-pro-2026-06-01") == (30, 180)
    assert price_for("gpt-5.4-mini-2026-03-05") == (0.75, 4.5)
    assert price_for("claude-opus-4-8-20260601") == (5, 25)
    assert price_for("claude-haiku-4-5-20251001") == (1, 5)


def test_onbekend_model_geeft_none_en_kosten_nul():
    assert price_for("llama-3") is None
    assert cost_usd("llama-3", 1000, 1000) == 0.0


def test_cost_usd_rekent_input_plus_output():
    # 1M input @ $2.5 + 1M output @ $10 = $12.5
    assert cost_usd("gpt-4o", 1_000_000, 1_000_000) == 12.5
    # 500k input @ $0.15 = $0.075
    assert cost_usd("gpt-4o-mini", 500_000, 0) == 0.075
