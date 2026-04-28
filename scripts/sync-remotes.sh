#!/usr/bin/env bash
set -euo pipefail

REPO_CANONICAL="git@github.com:oaslananka/fovux.git"
REPO_ORG="git@github.com:oaslananka-lab/fovux.git"

if ! git remote get-url personal >/dev/null 2>&1; then
    git remote add personal "$REPO_CANONICAL"
fi

if ! git remote get-url org >/dev/null 2>&1; then
    git remote add org "$REPO_ORG"
fi

git fetch --all

BRANCH=$(git branch --show-current)
if [ -n "$BRANCH" ]; then
    echo "Pushing branch $BRANCH to personal and org..."
    git push personal "$BRANCH"
    git push org "$BRANCH"
fi

echo "Pushing tags to personal and org..."
git push personal --tags
git push org --tags
