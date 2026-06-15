# TokenLens — lokaal live krijgen (klik-checklist)

Alles is gebouwd. Dit is puur klikwerk om het op je eigen machine te draaien en te dogfooden.

## 1. Supabase-project (gratis)
1. Ga naar https://supabase.com → **New project** (gratis tier).
2. Wacht tot 'ie klaar is → **SQL Editor** → **New query**.
3. Plak en run de twee migraties (in volgorde):
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_aggregations.sql`
4. **Auth → Providers → Email:** zet "Confirm email" **uit** (makkelijker dogfooden).

## 2. Keys instellen
1. Supabase → **Settings → API**. Kopieer:
   - Project URL
   - `anon` public key
   - `service_role` key (geheim!)
2. Open `apps/web/.env.local` en vul in:
   ```
   NEXT_PUBLIC_SUPABASE_URL=<project url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_URL=<project url>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   ```

## 3. Draaien
```bash
cd apps/web
npm run dev
```
→ open http://localhost:3000 → **Account maken** → log in → **Projecten** → maak een
project → **kopieer de API-key** (wordt één keer getoond).

## 4. Dogfooden op JARVIS / je bots
Installeer de SDK (lokaal pad voor nu) en wrap je LLM-calls:

```ts
import { configure, httpSink, track } from "tokenlens";

configure({
  sink: httpSink({
    url: "http://localhost:3000/api/ingest",
    apiKey: "tk_live_...", // je project-key
  }),
  defaultTags: { team: "jarvis" },
});

// wrap elke call:
const res = await track(
  { customer: "intern", feature: "daily-checkup" },
  () => openai.chat.completions.create({ model: "gpt-4o-mini", messages })
);
```

Roep aan het eind `await flush()` aan zodat de laatste batch verstuurd wordt.
Ververs het dashboard → je ziet kosten per klant/feature/model + per dag.

## Later (deploy naar productie)
- Vercel-deploy van `apps/web` + dezelfde env-vars.
- SDK publiceren op npm (`npm publish` in `packages/sdk`).
- Budget-alerts (cron) + email/webhook — nog te bouwen.
