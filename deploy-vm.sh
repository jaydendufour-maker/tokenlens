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
REMOTE_OWNER="${TOKENLENS_REMOTE_OWNER:-jayden}"

ROOT="$(cd "$(dirname "$0")" && pwd)"
WEB="$ROOT/apps/web"
RELEASE_ID="$(date -u +%Y%m%d_%H%M%S)"
BUNDLE="/tmp/tokenlens-$RELEASE_ID.tar.gz"
REMOTE_BUNDLE="/tmp/tokenlens-$RELEASE_ID.tar.gz"

echo "▶ 1/5  build (standalone)…"
cd "$WEB"
npm run build

echo "▶ 2/5  bundle assembleren…"
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public || true
( cd .next/standalone && tar -czf "$BUNDLE" . )
echo "   $(du -h "$BUNDLE" | cut -f1)"

echo "▶ 3/5  uploaden naar $VM…"
gcloud compute scp "$BUNDLE" "$VM:$REMOTE_BUNDLE" --zone "$ZONE"

echo "▶ 4/5  uitpakken + service herstarten…"
gcloud compute ssh "$VM" --zone "$ZONE" --command "
  set -eu
  RELEASE='$REMOTE_DIR.release.$RELEASE_ID'
  ROLLBACK='$REMOTE_DIR.rollback.$RELEASE_ID'
  sudo install -d -o '$REMOTE_OWNER' -g '$REMOTE_OWNER' \"\$RELEASE\"
  sudo -u '$REMOTE_OWNER' tar -xzf '$REMOTE_BUNDLE' -C \"\$RELEASE\"
  if [ -f '$REMOTE_DIR/.env' ]; then
    sudo cp '$REMOTE_DIR/.env' \"\$RELEASE/.env\"
    sudo chown '$REMOTE_OWNER:$REMOTE_OWNER' \"\$RELEASE/.env\"
    sudo chmod 600 \"\$RELEASE/.env\"
  fi
  sudo mv '$REMOTE_DIR' \"\$ROLLBACK\"
  sudo mv \"\$RELEASE\" '$REMOTE_DIR'
  if sudo systemctl restart '$SERVICE' && sleep 3 && \
     systemctl is-active '$SERVICE' && \
     curl -fsS -o /dev/null http://127.0.0.1:3000/; then
    sudo mv '$REMOTE_BUNDLE' \"\$ROLLBACK.bundle.tar.gz\"
    echo 'local probe: 200'
  else
    sudo systemctl stop '$SERVICE' || true
    sudo mv '$REMOTE_DIR' \"\$RELEASE.failed\"
    sudo mv \"\$ROLLBACK\" '$REMOTE_DIR'
    sudo systemctl start '$SERVICE'
    echo 'deploy failed; previous release restored' >&2
    exit 1
  fi
"

trash "$BUNDLE" 2>/dev/null || true

echo "▶ 5/5  klaar. Live: https://agentauditor-jd.duckdns.org"
