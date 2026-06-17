"""Prijstabel in USD per 1M tokens (input / output).

Prijzen veranderen — overschrijf via ``configure(pricing={...})``.
Matching is op prefix: ``"gpt-4o-2024-08-06"`` matcht ``"gpt-4o"``.
Houd dit in sync met de TS-SDK (``packages/sdk/src/pricing.ts``).
"""

from __future__ import annotations

from typing import Dict, NamedTuple, Optional


class ModelPrice(NamedTuple):
    """USD per 1M tokens."""

    in_: float  # input
    out: float  # output


DEFAULT_PRICING: Dict[str, ModelPrice] = {
    # OpenAI
    "gpt-4o-mini": ModelPrice(0.15, 0.6),
    "gpt-4o": ModelPrice(2.5, 10),
    "gpt-4.1-mini": ModelPrice(0.4, 1.6),
    "gpt-4.1": ModelPrice(2, 8),
    "o3-mini": ModelPrice(1.1, 4.4),
    "o3": ModelPrice(2, 8),
    # Anthropic
    "claude-haiku": ModelPrice(0.8, 4),
    "claude-3-5-haiku": ModelPrice(0.8, 4),
    "claude-sonnet": ModelPrice(3, 15),
    "claude-3-5-sonnet": ModelPrice(3, 15),
    "claude-opus": ModelPrice(15, 75),
    "claude-3-opus": ModelPrice(15, 75),
}


def price_for(
    model: str, table: Optional[Dict[str, ModelPrice]] = None
) -> Optional[ModelPrice]:
    """Vind de prijs voor een model via langste-prefix-match."""
    table = DEFAULT_PRICING if table is None else table
    best: Optional[ModelPrice] = None
    best_len = -1
    for key, price in table.items():
        if model.startswith(key) and len(key) > best_len:
            best = price
            best_len = len(key)
    return best


def cost_usd(
    model: str,
    input_tokens: int,
    output_tokens: int,
    table: Optional[Dict[str, ModelPrice]] = None,
) -> float:
    """Kosten in USD voor een call. Geeft 0.0 als model onbekend (logt wel tokens)."""
    p = price_for(model, table)
    if p is None:
        return 0.0
    return (input_tokens * p.in_ + output_tokens * p.out) / 1_000_000
