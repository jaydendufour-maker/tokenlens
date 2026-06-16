# TokenLens — Launch checklist

De code is **deploy-ready** en draait al live op de VM (publieke site + SEO-motor).
Dit zijn de resterende stappen die jouw accounts vereisen. Allemaal **$0** tot je verdient.

Volgorde: 1 → 2 maakt het dashboard live. 3 → 4 maakt de SDK + repo publiek. 5 = betalen aanzetten.

---

## 1. Supabase koppelen (dashboard live) — gratis
1. https://supabase.com → **New project** (free tier).
2. **SQL Editor → New query** → plak heel `supabase/schema.sql` → **Run**.
   (Dat is alle 4 de migraties in één keer, incl. `profiles` voor free/pro.)
3. **Auth → Providers → Email** → "Confirm email" **uit** (makkelijker dogfooden).
4. **Settings → API** → kopieer: Project URL, `anon` key, `service_role` key.

## 2. Keys op de VM zetten + herstarten
Op de VM staat `~/tokenlens/.env` (nu zonder Supabase). Vul aan:
```
NEXT_PUBLIC_SUPABASE_URL=<project url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_URL=<project url>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
CRON_SECRET=<verzin iets langs>
```
Dan: `sudo systemctl restart tokenlens`.
→ Login + dashboard werken nu op https://agentauditor-jd.duckdns.org.
(Keys plak je zelf in de VM-shell — nooit via chat.)

## 3. SDK publiceren op npm — gratis
De naam `tokenlens` was bezet → het pakket heet **`tokenlens-sdk`** (gecheckt: vrij).
```bash
cd packages/sdk
npm login            # eenmalig je npm-account
npm publish          # bouwt automatisch (prepublishOnly) en publiceert publiek
```
→ `npm i tokenlens-sdk` werkt wereldwijd.

## 4. GitHub publiek maken — gratis
1. Maak een repo (bv. `github.com/<jouw-handle>/tokenlens`).
2. Vervang overal de placeholder `USER` / repo-URL:
   - `packages/sdk/package.json` (homepage/repository/bugs)
   - zet `NEXT_PUBLIC_GITHUB_URL=https://github.com/<handle>/tokenlens` in de VM-`.env`
     (de site leest 'm daar vandaan — code hoeft niet aangepast).
3. ```bash
   git remote add origin https://github.com/<handle>/tokenlens.git
   git push -u origin main
   ```

## 5. Betalingen aanzetten (Pro $29/mo) — $0 vooraf, % per verkoop
De plan-gating staat al (account = `free`/`pro` in `profiles`; dashboard-breakdown +
alerts zitten achter `pro`, ook server-side afgedwongen). Wat nog moet:
1. Account bij **Paddle** of **LemonSqueezy** (merchant-of-record → regelt BTW + TH/Payoneer-payout, $0 vooraf).
2. Maak een product "TokenLens Pro — $29/mo".
3. Webhook `checkout.completed` → endpoint dat `update profiles set plan='pro' where id=<user>`
   zet (via service_role). *(Dit endpoint is nog niet gebouwd — kleine klus zodra je de provider kiest.)*

**Tot dat af is** kun je handmatig iemand op Pro zetten (bv. jezelf om te dogfooden):
in de Supabase SQL Editor:
```sql
update public.profiles set plan = 'pro' where id = '<jouw-user-id>';
```

---

## Optioneel later
- Eigen domein i.p.v. `agentauditor-jd.duckdns.org` (DuckDNS-subdomein + cert, ~1 klik).
- Python-SDK.
- Groei: zie `GROWTH-ENGINE.md` (SEO-pagina's draaien al; dagelijkse blog-loop).
