# TokenLens

**FinOps voor LLM's** — zie welke klant/feature/team je OpenAI/Anthropic-rekening opvreet,
en krijg een alert vóór je CFO het vraagt.

Niet weer een observability-tool. TokenLens doet één ding scherp: **kosten-attributie**.
Tag elke LLM-call met `customer`, `feature`, `team` → zie precies waar je spend heen gaat.

## Hoe het werkt
1. **Wrap** je OpenAI/Anthropic-client met de TokenLens-SDK (één regel).
2. Elke call logt provider, model, tokens-in/out, kosten + jouw tags → backend (Supabase).
3. **Dashboard:** kosten over tijd · top-klanten/features by spend · model-breakdown.
4. **Budget-alerts:** email/webhook bij overschrijding per tag.

## Open-core
- SDK = open-source (npm/pip), gratis self-host.
- Gehost dashboard + alerts = Pro $29/mo · Team $99/mo.

## Status
v1 in aanbouw. SDK-core eerst (Node/TS), dan Supabase-schema, dan dashboard.
Beslissing + spec: `~/knowledge-base/income/DECISION-tokenlens-2026-06-15.md`.
