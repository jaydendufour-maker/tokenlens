"""Dogfood-voorbeeld: wrap een echte Anthropic-call met TokenLens.

  export TOKENLENS_URL="https://agentauditor-jd.duckdns.org/api/ingest"
  export TOKENLENS_KEY="tl_..."        # API-key uit je TokenLens-project
  export ANTHROPIC_API_KEY="sk-ant-..."
  python examples/dogfood_anthropic.py
"""

import os

import anthropic

import tokenlens as tl

tl.configure(
    sink=tl.HttpSink(os.environ["TOKENLENS_URL"], os.environ["TOKENLENS_KEY"]),
    default_tags={"team": "jarvis"},
)

client = anthropic.Anthropic()

res = tl.track(
    {"customer": "internal", "feature": "morning-brief"},
    lambda: client.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=128,
        messages=[{"role": "user", "content": "Geef 1 zin marktupdate."}],
    ),
)

print(res.content[0].text)
tl.flush()  # stuur het gebufferde event vóór exit
print("→ check je TokenLens-dashboard: de call staat er nu in.")
