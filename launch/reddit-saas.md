# r/SaaS — post

> Audience: founders. Angle = margin/unit-economics, not tech. Honest, no hype.
> Many SaaS subs require flair / restrict promo to specific threads — check first.

## Title

`How do you track which customer is eating your LLM margin? I built a tool for it`

## Body

If your product wraps OpenAI/Anthropic, your cost-of-goods is now partly a
variable LLM bill — but the provider invoice is one lump sum. You can't easily
see that customer A is unprofitable while customer B subsidizes them, or that a
single feature is half your bill.

I built TokenLens to attribute LLM spend to a `customer`, `feature`, or `team`.
You tag your calls once, and the dashboard shows cost per dimension over time,
plus budget alerts (email/webhook) when something crosses a threshold — so you
catch a runaway customer mid-month, not on the invoice.

- Drop-in SDK (TypeScript + Python), open source.
- Free tier = totals; per-customer/feature breakdown + alerts are paid ($29/mo).

It's early and solo-built. If you run an AI feature: what would you want to *do*
with the attribution once you have it — alert, rate-limit per customer, bill it
back? That's what I'm trying to figure out next.

Link: <SITE_URL>  ·  Repo: <GITHUB_URL>
