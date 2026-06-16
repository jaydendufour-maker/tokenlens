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

## Pricing (open-core)
- **SDK** = open-source op npm (`npm i tokenlens-sdk`), gratis.
- **Free** = totale spend-dashboard (de teaser — je ziet *dat* je een probleem hebt).
- **Pro $29/mo** = breakdown per klant/feature/team + budget-alerts (email/webhook). Geen trial.

## Repo-structuur
```
packages/sdk      → de open-source SDK (tokenlens-sdk op npm)
apps/web          → Next.js 16: publieke landing + SEO-pagina's + dashboard + ingest + cron
supabase          → schema.sql (alles) + migrations/ (0001-0004)
deploy-vm.sh      → one-command deploy naar de GCP-VM
SETUP-JAYDEN.md   → Supabase opzetten + lokaal draaien
LAUNCH.md         → resterende launch-kliks (Supabase/npm/GitHub/payments)
GROWTH-ENGINE.md  → de SEO-/content-groeimotor + dagelijkse loop
```

## Lokaal draaien
```bash
cd apps/web
cp .env.example .env.local   # vul Supabase-keys in (zie SETUP-JAYDEN.md)
npm run dev                  # http://localhost:3000
```
De publieke + SEO-pagina's werken óók zonder Supabase; alleen dashboard/login niet.

## Deployen
```bash
./deploy-vm.sh               # bouwt lokaal, uploadt standalone-bundle, herstart de service
```

## Status
**Live** op de GCP-VM (publieke site + SEO-motor). Dashboard activeert zodra Supabase
gekoppeld is — zie **LAUNCH.md** voor de resterende kliks.
