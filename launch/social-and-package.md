# Short-form: X/Twitter, package descriptions, repo "About"

## X / Twitter (launch thread)

**1/**
Your OpenAI dashboard tells you *what* you spent.
Not *who* spent it.

I built TokenLens: tag your LLM calls → see cost per customer, feature, and team.
Open source SDK (TS + Python). 🧵

**2/**
```python
tl.track({"customer": "acme", "feature": "summarizer"},
         lambda: client.chat.completions.create(model="gpt-4o-mini", ...))
```
Reads usage from OpenAI + Anthropic, computes cost, tags it. That's it.

**3/**
Dashboard = cost over time + breakdown by customer/feature/model + budget
alerts (email/webhook) so you catch a spike before finance does.

Not an observability tool — just the cost-attribution piece nobody does cleanly.

**4/**
SDKs are MIT, zero deps. Bring your own sink if you don't want the backend.
Free tier shows totals; breakdown + alerts are paid.

Try it: https://agentauditor-jd.duckdns.org
Repo: https://github.com/jaydendufour-maker/tokenlens
Feedback very welcome 🙏

---

## npm description (package.json — already set)

`FinOps for LLMs — cost attribution per customer/feature/team for OpenAI & Anthropic.`

## PyPI summary (pyproject — already set)

Same as above.

## GitHub repo "About" (≤120 chars)

`FinOps for LLMs: attribute OpenAI/Anthropic cost to customer, feature & team. Open-source SDK (TS + Python) + dashboard.`

## GitHub topics

`llm` `finops` `openai` `anthropic` `cost-tracking` `observability` `typescript` `python` `llmops`
