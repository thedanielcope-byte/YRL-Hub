#!/bin/bash
# ============================================================
# YRL Hub deploy — rsync over SSH to Cloudways (app: snshakfrsg)
# Ships the top-level yrl-*.html pages of ~/Code/YRL-Hub (portal/ has its own deploy-portal.sh)
# Usage:  ./deploy-hub.sh            (real deploy)
#         ./deploy-hub.sh --dry      (preview only, changes nothing)
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
# Ship only an up-to-date main (a stale copy silently rolls back other sessions' work)
if [[ "$(git branch --show-current)" != "main" ]]; then echo ">> !! Not on main" >&2; exit 1; fi
git pull -q --ff-only || { echo ">> !! git pull failed — fix that first" >&2; exit 1; }
SRC="$(pwd)/"
DEST="master_efzzpyxezq@159.65.243.18:/home/master/applications/snshakfrsg/public_html/"
KEY="$HOME/.ssh/yrl_deploy"

# -r recursive, -l symlinks, -z compress, -v verbose, --checksum = only genuinely changed files
# --omit-dir-times avoids "Operation not permitted" on the shared web root.
# (Permissions are fixed via SSH chmod after the sync — see below — because macOS
#  ships openrsync, which doesn't support rsync's --chmod flag.)
# NOTE: portal/ is excluded — portal.nomadsystems.co is owned by a separate
# Claude session/project now. Do not remove this exclude or re-add portal here.
FLAGS=(-rlvz --checksum --omit-dir-times --no-perms --itemize-changes
       --exclude='.git' --exclude='.gitattributes' --exclude='.DS_Store'
       --exclude='Disbursement Form' --exclude='*.pdf' --exclude='*.png' --exclude='*.jpg'
       --exclude='portal' --exclude='supabase' --exclude='deploy-*.sh' --exclude='.gitignore'
       --exclude='*.md' --exclude='*.sql' --exclude='_portal-backups')

if [[ "${1:-}" == "--dry" ]]; then
  FLAGS+=(--dry-run)
  echo ">> DRY RUN — no files will be changed"
fi

rsync "${FLAGS[@]}" -e "ssh -i $KEY -o StrictHostKeyChecking=accept-new" "$SRC" "$DEST"

echo ""
echo ">> Files synced."

# ── Fix permissions so Apache (www-data) can read the files ──────
# Uploaded files can land as 600 (owner-only) → Apache returns 403.
# Force web assets to 644 after every sync.
REMOTE_DIR="/home/master/applications/snshakfrsg/public_html"
if [[ "${1:-}" != "--dry" ]]; then
  echo ">> Setting web file permissions to 644…"
  ssh -i "$KEY" master_efzzpyxezq@159.65.243.18 \
    "chmod 644 $REMOTE_DIR/yrl-*.html $REMOTE_DIR/yrl-*.js" \
    && echo ">> Permissions set." \
    || echo ">> !! chmod step failed — check file permissions manually."
fi

# ── Cloudflare cache purge ───────────────────────────────────
# Reads CF_API_TOKEN and CF_ZONE_ID from a local-only secrets file
# (never committed, never synced into the repo).
SECRETS="$HOME/.yrl-deploy.env"
if [[ "${1:-}" == "--dry" ]]; then
  echo ">> (dry run — skipping Cloudflare purge)"
elif [[ -f "$SECRETS" ]]; then
  # shellcheck disable=SC1090
  source "$SECRETS"
  if [[ -n "${CF_API_TOKEN:-}" && -n "${CF_ZONE_ID:-}" ]]; then
    echo ">> Purging Cloudflare cache…"
    RESP=$(curl -s -X POST \
      "https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
      -H "Authorization: Bearer ${CF_API_TOKEN}" \
      -H "Content-Type: application/json" \
      --data '{"purge_everything":true}')
    if echo "$RESP" | grep -q '"success":true'; then
      echo ">> Cloudflare cache purged. Live site is up to date."
    else
      echo ">> !! Cloudflare purge FAILED — response:"; echo "$RESP"
      echo "   Purge manually: Cloudflare -> yrl.nomadsystems.co -> Caching -> Purge Everything"
    fi
  else
    echo ">> $SECRETS exists but CF_API_TOKEN / CF_ZONE_ID not set — skipping purge."
  fi
else
  echo ">> No $SECRETS found — skipping auto-purge."
  echo "   Purge manually: Cloudflare -> yrl.nomadsystems.co -> Caching -> Purge Everything"
fi
