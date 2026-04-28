#!/usr/bin/env bash
set -euo pipefail

# Setup remotes
if ! git remote get-url lab >/dev/null 2>&1; then
    git remote add lab https://github.com/oaslananka-lab/fovux.git
fi

echo "Syncing to origin (canonical)..."
git push origin --all
git push origin --tags

echo "Syncing to lab (mirror)..."
git push lab --all
git push lab --tags

echo "Sync successful."
