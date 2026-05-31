#!/bin/bash
# ZMS Vault Auto-Sync and GBrain Memory Incorporation Script

VAULT_DIR="/Users/josephbzidle/Documents/ZMS Vault"
GBRAIN_CLI="/Users/josephbzidle/.bun/bin/bun /Users/josephbzidle/gbrain/src/cli.ts"

echo "=== Starting Sync: $(date) ==="

# 1. Navigate to the vault directory
cd "$VAULT_DIR" || { echo "Error: Could not navigate to $VAULT_DIR"; exit 1; }

# 2. Pull changes from GitHub (e.g. from iPhone/iPad)
echo "Pulling latest notes from GitHub..."
git pull origin main --rebase || { echo "Git pull failed"; exit 1; }

# 3. Add and commit any local changes on the Mac Mini
if [[ -n $(git status -s) ]]; then
  echo "Found local changes. Committing and pushing..."
  git add .
  git commit -m "Auto-sync from Mac Mini: $(date '+%Y-%m-%d %H:%M:%S')"
  git push origin main || { echo "Git push failed"; exit 1; }
else
  echo "No local changes to push."
fi

# 4. Sync with GBrain (using --no-embed to prevent hitting OpenAI key quota)
echo "Incorporating notes into GBrain Memory..."
$GBRAIN_CLI sync --source zms-vault --no-embed || { echo "GBrain sync failed"; exit 1; }

echo "=== Sync Complete: $(date) ==="
