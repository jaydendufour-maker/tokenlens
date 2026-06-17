"""Kerntypes voor TokenLens."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, Optional

# Tags = vrij dict; customer/feature/team zijn de kern-attributie-assen.
Tags = Dict[str, Any]


@dataclass
class UsageEvent:
    """Eén gelogde LLM-call."""

    ts: str  # ISO-8601 timestamp
    provider: str
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: float
    tags: Tags = field(default_factory=dict)
    latency_ms: Optional[float] = None

    def to_payload(self) -> Dict[str, Any]:
        """Naar het JSON-formaat dat /api/ingest verwacht (camelCase)."""
        return {
            "ts": self.ts,
            "provider": self.provider,
            "model": self.model,
            "inputTokens": self.input_tokens,
            "outputTokens": self.output_tokens,
            "costUsd": self.cost_usd,
            "latencyMs": self.latency_ms,
            "tags": self.tags,
        }
