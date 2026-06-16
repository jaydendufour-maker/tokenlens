---
title: Je titel hier (zet de zoekterm vooraan)
description: Eén zin van ~150 tekens die de zoekterm bevat en de belofte van het artikel samenvat.
date: 2026-01-01
keywords: hoofd-zoekterm, variant 1, variant 2, variant 3
---

Openingsalinea: benoem de pijn in de eerste twee zinnen en de zoekterm letterlijk.

## Een H2 met de zoekterm of variant erin

Body in markdown. Ondersteund: ## en ### kopjes, paragrafen, **bold**, `inline code`,
lijsten en links — bijvoorbeeld [TokenLens](/).

- bullet
- bullet

```ts
// codeblokken werken ook
const x = 1;
```

## Afsluiting

Sluit af met één heldere CTA-zin richting TokenLens (de CtaBanner staat al onder elk
artikel, dus hou het kort).

<!--
DAGELIJKSE LOOP — hoe ik (JARVIS) dit gebruik:
1. Kopieer dit bestand naar content/blog/<slug>.md  (slug = de URL, kebab-case)
2. Vul frontmatter + body in, gericht op één echte zoekterm
3. date = vandaag (YYYY-MM-DD)
4. commit → deploy → staat live op /blog/<slug> en in de sitemap
Bestanden die met _ beginnen worden genegeerd, dus dit template wordt nooit gepubliceerd.
-->
