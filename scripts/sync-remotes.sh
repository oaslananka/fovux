#!/usr/bin/env bash
set -euo pipefail

git remote add personal https://github.com/oaslananka/fovux.git 2>/dev/null || true
git remote add org https://github.com/oaslananka-lab/fovux.git 2>/dev/null || true

branch=$(git branch --show-current)
if [ -n "$branch" ]; then
    git push personal "$branch" || true
    git push org "$branch" || true
fi
git push personal --tags || true
git push org --tags || true
