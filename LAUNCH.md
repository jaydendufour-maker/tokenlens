# TokenLens — Launch checklist

De code is **deploy-ready** en draait al live op de VM (publieke site + SEO-motor).
Dit zijn de resterende stappen die jouw accounts vereisen. Allemaal **$0** tot je verdient.

Volgorde: 1 → 2 maakt het dashboard live. 3 → 4 maakt de SDK + repo publiek. 5 = betalen aanzetten.

---

## 1. Supabase koppelen (dashboard live) — gratis
1. https://supabase.com → **New project** (free tier).
2. **SQL Editor → New query** → plak heel `supabase/schema.sql` → **Run**.
   (Alle migraties 0001-0008 in één keer, incl. profiles, payments en hardening.)
3. **Settings → API** → kopieer: Project URL, `anon` key, `service_role` key.

### 1b. Auth correct zetten (signup + verificatiemail die werkt)
4. **Authentication → URL Configuration:**
   - **Site URL:** `https://agentauditor-jd.duckdns.org`
   - **Redirect URLs** (toevoegen): `https://agentauditor-jd.duckdns.org/auth/confirm`
     en `https://agentauditor-jd.duckdns.org/**`
5. **Authentication → Providers → Email:** "Confirm email" **AAN** (we willen verificatie).
6. **Authentication → Email Templates → "Confirm signup"** → vervang de link door:
   ```html
   <h2>Bevestig je TokenLens-account</h2>
   <p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup&next=/dashboard">Bevestig mijn account</a></p>
   ```
   (De `/auth/confirm`-route is al gebouwd en zet de sessie + stuurt door naar het dashboard.)
7. **E-mail-aflevering** (zodat de mail écht aankomt, niet in spam):
   - **Nu/gratis:** Supabase's ingebouwde mail werkt meteen, maar is **gelimiteerd
     (~2-4/uur, testniveau)** — prima om te dogfooden en eerste users.
   - **Voor echt (aanraders bij groei):** **Authentication → SMTP Settings** → eigen
     SMTP via **Resend** (gratis tot 3.000/mnd). Vereist een **eigen verzend-domein**
     (DKIM/SPF) → daarvoor heb je een echt domein nodig (~$10/jr, bv. `tokenlens.dev`).
     Dat lost meteen ook de nette URL op. Tot dan: ingebouwde mail.

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
1. Repo: `https://github.com/jaydendufour-maker/tokenlens`.
2. Zet `NEXT_PUBLIC_GITHUB_URL=https://github.com/jaydendufour-maker/tokenlens`
   in de VM-`.env` (de code heeft dezelfde veilige default).
3. ```bash
   git remote add origin https://github.com/jaydendufour-maker/tokenlens.git
   git push -u origin main
   ```

## 5. Betalingen aanzetten (Pro $29/mo) — $0 vooraf, % per verkoop
De code is **al gebouwd**: twee rails (crypto + kaart) → dezelfde idempotente,
signature-geverifieerde unlock. Plan-gating (`profiles.plan` + `plan_expires_at`)
staat en wordt server-side afgedwongen. Je hoeft alleen accounts te koppelen.

### 5a. Crypto — NOWPayments (geld direct in je wallet)
1. Account op https://nowpayments.io → voeg je **wallet-adres** toe (bv. USDC/USDT).
2. **Settings → API keys** → kopieer de API-key.
3. **Settings → IPN** → zet een **IPN secret** + callback-URL
   `https://<jouw-site>/api/billing/nowpayments`.
4. Op de VM in `~/tokenlens/.env`:
   ```
   NOWPAYMENTS_API_KEY=<api key>
   NOWPAYMENTS_IPN_SECRET=<ipn secret>
   ```
   → `sudo systemctl restart tokenlens`. De crypto-knop op `/upgrade` werkt nu.

### 5b. Kaart — LemonSqueezy (uitbetaling naar je Wise)
1. Account op https://lemonsqueezy.com → store aanmaken. **Check bij aanmelden dat
   Thailand in de payout-landen zit** (bank-route → vul je **Wise USD account-details**
   in; $50 min payout, 1% fee). *(Zit TH er niet bij → gebruik Paddle, zie onder.)*
2. Maak een **subscription-product** "TokenLens Pro" à **$29/mo** → kopieer de
   **checkout-link**.
3. **Settings → Webhooks** → URL `https://<jouw-site>/api/billing/lemonsqueezy`,
   selecteer de `subscription_*`-events, zet een **signing secret**.
4. In `~/tokenlens/.env`:
   ```
   LEMONSQUEEZY_WEBHOOK_SECRET=<signing secret>
   NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL=<checkout-link>
   ```
   → restart. De kaart-knop op `/upgrade` werkt nu (user-id gaat automatisch mee).

> **Paddle-fallback** (als LemonSqueezy geen TH-payout doet): Paddle betaalt
> gegarandeerd naar Wise (SWIFT/IBAN), $100 min + ~$15 SWIFT-fee. De webhook-handler
> is provider-agnostisch; een Paddle-route toevoegen is een kleine klus.

### Handmatig iemand op Pro zetten (dogfooden / vóór de rails live zijn)
In de Supabase SQL Editor:
```sql
update public.profiles set plan = 'pro', plan_expires_at = null
where id = '<jouw-user-id>';
```

---

## Optioneel later
- Eigen domein i.p.v. `agentauditor-jd.duckdns.org` (DuckDNS-subdomein + cert, ~1 klik).
- Python-SDK.
- Groei: zie `GROWTH-ENGINE.md` (SEO-pagina's draaien al; dagelijkse blog-loop).
