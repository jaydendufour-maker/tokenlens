# TokenLens — Launch Checklist

Product is built and live on https://agentauditor-jd.duckdns.org. The remaining
work is **distribution** — the research flagged review/launch velocity as the
kill-factor, not the product. This is the execution order.

Copy lives in `launch/`. Replace every `<GITHUB_URL>` / `<SITE_URL>` placeholder
before posting.

---

## Phase 0 — Pre-flight (do once, in order)

- [ ] **Run migration `0006`** in Supabase SQL editor (`supabase/migrations/0006_date_range.sql`).
      Only needed for the custom date-range; presets/export already work without it.
- [ ] **Pick the public GitHub repo name** and create it (public).
      Then set `NEXT_PUBLIC_GITHUB_URL` in the VM `.env` and `./deploy-vm.sh` so the
      site links resolve. Push the repo: `git push -u origin tokenlens-launch-ready`
      (or merge to `main` first).
- [ ] **(Optional) custom domain** (~$10) → custom SMTP → emails out of spam.
- [ ] **Resend key** in VM `.env` (`RESEND_API_KEY`) so budget-alert emails fire
      (no-op without it — webhooks still work).

## Phase 1 — Publish the SDKs (the distribution surface)

- [ ] **npm**: `cd packages/sdk && npm publish` (name `tokenlens-sdk`, already free).
- [ ] **PyPI**: `cd packages/sdk-py && python -m build && twine upload dist/*`
      (verify `tokenlens-sdk` is free on PyPI first; rename in `pyproject.toml` if not).
- [ ] Confirm both install clean in a fresh env (`npm i tokenlens-sdk`,
      `pip install tokenlens-sdk`).

## Phase 2 — Dogfood for proof (before any post)

- [ ] Create a project in the dashboard → grab the API key.
- [ ] Run `packages/sdk-py/examples/dogfood_*.py` against real calls so the
      dashboard has actual data.
- [ ] Take 2-3 clean screenshots (breakdown + alert). These go in the posts.

## Phase 3 — Launch posts (don't fire all at once)

Order matters. Space them out; never cross-post the same hour.

- [ ] **Show HN** (`launch/SHOW-HN.md`) — best Tue–Thu ~8-10am ET.
      Submit, then immediately post the body as the first comment.
      **Camp the thread for 2 hours**, reply to every comment.
- [ ] **r/LocalLLaMA** (`launch/reddit-localllama.md`) — different day.
- [ ] **r/SaaS** (`launch/reddit-saas.md`).
- [ ] **r/devops** + **r/FinOps** (`launch/reddit-devops-finops.md`).
- [ ] **X/Twitter thread** (`launch/social-and-package.md`) — same day as HN.

> ⚠️ Every sub has self-promo rules. Read them; some need flair or only allow
> promo in a weekly thread. A removed post burns the launch.

## Phase 4 — Engagement loop (the part that actually converts)

- [ ] Answer every comment within minutes for the first 2h, then hourly.
- [ ] Log every feature request / objection → next build sprint.
- [ ] If someone self-hosts the SDK, that's a win — help them, ask for a star.

---

## Blocked-on-you (can't be automated)

| Item | Why |
|---|---|
| Create GitHub repo + push | needs your account |
| npm + PyPI publish | needs your registry accounts |
| Run migration 0006 | needs Supabase dashboard access |
| Post to HN/Reddit/X | needs your accounts + can't be botted (= instant ban) |
| Payment accounts (NOWPayments/LemonSqueezy) | see `tokenlens-live` memory / `LAUNCH.md` §5 |

## What I (JARVIS) can still do autonomously

- Refine any post copy / write more variants (Indie Hackers, dev.to article).
- Build a comparison page (TokenLens vs Helicone vs Langfuse) for SEO.
- Write a launch-day "first 1000 events free" landing tweak.
- Build auto-instrumentation (monkeypatch the OpenAI/Anthropic client) if the HN
  feedback says explicit `track()` is too much friction.

> IP note: all copy is anonymous/abstract — no real name, location, or other
> projects referenced. Keep it that way in comments too.
