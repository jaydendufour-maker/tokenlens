"""Dogfood-voorbeeld: wrap een echte OpenAI-call met TokenLens.

  export TOKENLENS_URL="https://agentauditor-jd.duckdns.org/api/ingest"
  export TOKENLENS_KEY="tl_..."
  export OPENAI_API_KEY="sk-..."
  python examples/dogfood_openai.py
"""

import os

from openai import OpenAI

import tokenlens as tl

tl.configure(
    sink=tl.HttpSink(os.environ["TOKENLENS_URL"], os.environ["TOKENLENS_KEY"]),
)

client = OpenAI()

res = tl.track(
    {"customer": "acme-inc", "feature": "summarizer"},
    lambda: client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Summarize: TokenLens tracks LLM cost."}],
    ),
)

print(res.choices[0].message.content)
tl.flush()
print("→ check je TokenLens-dashboard: de call staat er nu in.")
