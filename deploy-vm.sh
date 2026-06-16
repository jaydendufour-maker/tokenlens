#!/usr/bin/env bash
# TokenLens → GCP VM deploy. Bouwt lokaal (npm ci faalt op de 1GB-box),
# uploadt de standalone-bundle en herstart de service.
#
#   ./deploy-vm.sh
#
# Vereist: gcloud (geauthenticeerd), een lokale build-omgeving.
set -euo pipefail

VM="${TOKENLENS_VM:-mastermind-bot}"
ZONE="${TOKENLENS_ZONE:-us-west1-b}"
REMOTE_DIR="${TOKENLENS_REMOTE_DIR:-/home/jayden/tokenlens}"
SERVICE="${TOKENLENS_SERVICE:-tokenlens}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
WEB="$ROOT/apps/web"
BUNDLE="/tmp/tokenlens.tar.gz"

echo "▶ 1/5  build (standalone)…"
cd "$WEB"
npm run build

echo "▶ 2/5  bundle assembleren…"
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true
rm -f "$BUNDLE"
( cd .next/standalone && tar -czf "$BUNDLE" . )
echo "   $(du -h "$BUNDLE" | cut -f1)"

echo "▶ 3/5  uploaden naar $VM…"
gcloud compute scp "$BUNDLE" "$VM:$REMOTE_DIR.tar.gz" --zone "$ZONE"

echo "▶ 4/5  uitpakken + service herstarten…"
gcloud compute ssh "$VM" --zone "$ZONE" --command "
  set -e
  mkdir -p '$REMOTE_DIR'
  # bewaar .env, vervang de rest
  [ -f '$REMOTE_DIR/.env' ] && cp '$REMOTE_DIR/.env' /tmp/tokenlens.env.bak || true
  rm -rf '$REMOTE_DIR'/*
  tar -xzf '$REMOTE_DIR.tar.gz' -C '$REMOTE_DIR'
  [ -f /tmp/tokenlens.env.bak ] && cp /tmp/tokenlens.env.bak '$REMOTE_DIR/.env' || true
  sudo systemctl restart '$SERVICE'
  sleep 3
  systemctl is-active '$SERVICE'
  curl -s -o /dev/null -w 'local probe: %{http_code}\n' http://127.0.0.1:3000/
"

echo "▶ 5/5  klaar. Live: https://agentauditor-jd.duckdns.org"
