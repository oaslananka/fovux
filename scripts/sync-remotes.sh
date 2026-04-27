#!/usr/bin/env bash
set -euo pipefail

branch="${1:-main}"
PUSH_TAGS="${PUSH_TAGS:-false}"
SKIP_ORG_CI="${SKIP_ORG_CI:-false}"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is not clean. Commit or stash changes before syncing." >&2
  exit 1
fi

ensure_remote() {
  local name="$1"
  local url="$2"
  if ! git remote get-url "$name" >/dev/null 2>&1; then
    git remote add "$name" "$url"
  elif [ "$(git remote get-url "$name")" != "$url" ]; then
    git remote set-url "$name" "$url"
  fi
}

ensure_remote "github-personal" "git@github.com:oaslananka/fovux.git"
ensure_remote "github-org" "git@github.com:oaslananka-lab/fovux.git"
ensure_remote "azure" "git@ssh.dev.azure.com:v3/oaslananka/open-source/fovux"

echo "Pushing branch $branch to all remotes..."
git push github-personal "$branch"
git push github-org "$branch"
git push azure "$branch"

if [ "$PUSH_TAGS" = "true" ]; then
  echo "Pushing tags to all remotes..."
  git push github-personal --tags
  git push github-org --tags
  git push azure --tags
fi

if [ "$SKIP_ORG_CI" != "true" ]; then
  if command -v gh >/dev/null 2>&1; then
    echo "Triggering org CI in oaslananka-lab/fovux..."
    gh workflow run org-ci.yml --repo oaslananka-lab/fovux --ref "$branch"
  else
    echo "GitHub CLI not found; org CI could not be manually dispatched." >&2
  fi
fi

echo ""
echo "Sync Complete!"
echo "Remotes:"
git remote -v
echo "Pushed ref: $branch"
