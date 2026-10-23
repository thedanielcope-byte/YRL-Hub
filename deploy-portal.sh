#!/bin/bash
# ============================================================
# Portal deploy — portal.nomadsystems.co
# Owned by the Nomad Systems session (handed off from YRL 2026-06-11).
#
# Static app:  ~/Code/YRL-Hub/portal/  ->  Cloudways app snshakfrsg, /portal/ subfolder
# (portal.nomadsystems.co is a DNS-only Cloudflare A record -> 159.65.243.18,
#  .htaccess host-routes the hostname to /portal/. NOT Vercel/CF Pages.)
#
# Usage:  ./deploy-portal.sh          (real deploy)
#         ./deploy-portal.sh --dry    (preview only, changes nothing)
#
# NOTE: the YRL hub deploy (YRL/deploy-hub.sh) deliberately EXCLUDES portal/,
# so the two never collide. This script is the ONLY thing that ships the portal.
# ============================================================
set -euo pipefail

cd "$(dirname "$0")"
# Ship only an up-to-date main (a stale copy silently rolls back other sessions' work)
if [[ "$(git branch --show-current)" != "main" ]]; then echo ">> !! Not on main" >&2; exit 1; fi
git pull -q --ff-only || { echo ">> !! git pull failed — fix that first" >&2; exit 1; }
SRC="$(pwd)/portal/"
DEST="master_efzzpyxezq@159.65.243.18:/home/master/applications/snshakfrsg/public_html/portal/"
KEY="$HOME/.ssh/yrl_deploy"
REMOTE_DIR="/home/master/applications/snshakfrsg/public_html/portal"

if [[ ! -d "$SRC" ]]; then
  echo ">> !! Source not found: $SRC" >&2
  exit 1
fi

# -r recursive, -l symlinks, -z compress, -v verbose, --checksum = only genuinely
# changed files. --omit-dir-times / --no-perms avoid permission errors on the
# shared web root (macOS ships openrsync, which lacks rsync's --chmod). Perms are
# fixed via SSH chmod after the sync.
FLAGS=(-rlvz --checksum --omit-dir-times --no-perms --itemize-changes
       --exclude='.git' --exclude='.gitattributes' --exclude='.DS_Store'
       # internal docs must NOT ship — the docroot is public and served with no auth
       --exclude='*.md')

if [[ "${1:-}" == "--dry" ]]; then
  FLAGS+=(--dry-run)
  echo ">> DRY RUN — no files will be changed"
fi

rsync "${FLAGS[@]}" -e "ssh -i $KEY -o StrictHostKeyChecking=accept-new" "$SRC" "$DEST"

echo ""
echo ">> Files synced."

# ── Fix permissions so Apache (www-data) can read the files ──────
# Uploaded files can land as 600 (owner-only) -> Apache returns 403.
# Force the portal dir to 755 and web assets to 644 after every sync.
if [[ "${1:-}" != "--dry" ]]; then
  echo ">> Setting web permissions (dir 755, files 644)…"
  ssh -i "$KEY" master_efzzpyxezq@159.65.243.18 \
    "chmod 755 $REMOTE_DIR && find $REMOTE_DIR -maxdepth 1 -type f \( -name '*.html' -o -name '*.js' -o -name '*.json' -o -name '*.png' -o -name '*.webmanifest' \) -exec chmod 644 {} +" \
    && echo ">> Permissions set." \
    || echo ">> !! chmod step failed — check file permissions manually."
fi

# ── No Cloudflare purge ──────────────────────────────────────────
# portal.nomadsystems.co is DNS-only (gray cloud) — there is NO edge cache in
# front of it, so changes are live immediately after the sync.
echo ">> Done — portal.nomadsystems.co is DNS-only, no Cloudflare purge needed."
