# TokenLens — Groei-motor (SEO + dagelijkse loop)

Dit is het automatische-verkeer-deel. Het product trekt klanten via pagina's die
op echte zoektermen ranken — niet via "hopen dat je gevonden wordt".

## Wat er staat (gebouwd)

| Onderdeel | Route | Bron | Aantal |
|-----------|-------|------|--------|
| Model-pricing | `/pricing/[model]` | `apps/web/lib/models.ts` | 9 pagina's |
| Vergelijkingen | `/compare/[a]-vs-[b]` | `lib/models.ts` (COMPARISONS) | 6 pagina's |
| Pricing-index | `/pricing` | — | 1 |
| Blog | `/blog/[slug]` | `apps/web/content/blog/*.md` | groeit dagelijks |
| Blog-index | `/blog` | — | 1 |
| Sitemap | `/sitemap.xml` | auto uit alle bovenstaande | — |
| Robots | `/robots.txt` | app-routes geblokt, rest open | — |

Elke pagina heeft eigen `<title>`/description + JSON-LD structured data + interne
links + een CTA naar `/login`. Dat is wat Google nodig heeft om ze los te ranken.

**Meer pricing/compare-pagina's** = gewoon een model of paar toevoegen in
`lib/models.ts`. Eén regel data → nieuwe pagina + sitemap-entry.

## De dagelijkse loop (jouw "1×/dag JARVIS aanzetten")

De eenheid is bewust simpel: **één `.md`-bestand in `apps/web/content/blog/` = één
artikel live.** Geen herbouw, geen code.

Wat JARVIS elke run doet:
1. Kies één echte zoekterm (uit de backlog hieronder of vers gevonden).
2. Schrijf `apps/web/content/blog/<slug>.md` op basis van `_TEMPLATE.md`.
3. `date` = vandaag. Commit → deploy → live op `/blog/<slug>` + in de sitemap.
4. (Optioneel) lever 1-2 kant-en-klare Reddit/HN-replies voor threads waar de pijn
   nu speelt — jij plakt + post (handmatig, anders ban-risico).

Aanroepen: open de terminal en zeg bv. *"continue tokenlens — schrijf het artikel
van vandaag"*. Later autonoom via `claude -p` op de VM (trekt uit de Agent-SDK-credit).

## Zoekterm-backlog (artikel-ideeën, hoge intentie)

- track Anthropic / Claude cost per customer
- OpenAI cost per user / per request
- LLM cost monitoring (open source)
- how to set a budget alert on OpenAI spend
- chargeback LLM cost across teams
- prompt caching cost savings explained
- gpt-4o vs gpt-4o-mini: when is mini enough
- detecting an LLM cost spike / runaway retries
- per-feature AI cost (feature-level FinOps)
- self-hosted vs API cost crossover

## Configuratie

- `NEXT_PUBLIC_SITE_URL` in `.env.local` (bv. `https://tokenlens.dev`) → gebruikt in
  sitemap + canonicals. Zonder gezet valt 'ie terug op `https://tokenlens.dev`.

## Wat nog handmatig blijft (bewust)

- Het **posten** van promo-links in andermans communities (Reddit/HN) → ik schrijf,
  jij klikt. Bot-posten = shadowban = merk dood.
- De **Show HN** (de grote spike) → pas afvuren als product + een paar artikelen
  staan, niet op dag 1.
