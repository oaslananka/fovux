#!/usr/bin/env bash
# Review-first repository cleanup. Never run unattended.
# Usage:
#   bash scripts/repo-cleanup.sh           # dry-run, prints actions only
#   bash scripts/repo-cleanup.sh --apply   # actually performs the deletions
set -euo pipefail

APPLY="${1:-}"
REPO_CANONICAL="oaslananka/fovux"
REPO_ORG="oaslananka-lab/fovux"

say()   { printf '\033[1;36m[plan]\033[0m %s\n' "$*"; }
do_or_print() {
  if [ "$APPLY" = "--apply" ]; then
    echo "+ $*"; eval "$@"
  else
    say "$*"
  fi
}

echo "== Local branches with gone upstream and >30 days old =="
git fetch --all --prune
git for-each-ref --format='%(refname:short) %(upstream:track) %(committerdate:unix)' refs/heads \
  | awk -v cutoff="$(date -d '30 days ago' +%s 2>/dev/null || date -v-30d +%s)" \
        '$2 ~ /gone/ && $3+0 < cutoff { print $1 }' \
  | grep -v '^chore/autonomy-setup$' \
  | while read -r br; do
      do_or_print "git branch -D '$br'"
    done

echo
echo "== Remote branches on canonical older than 90 days, no open PR =="
gh api -X GET "/repos/${REPO_CANONICAL}/branches?per_page=100" --jq '.[].name' \
  | grep -Ev '^(main|master|develop|gh-pages)$' \
  | grep -Ev '^(release|hotfix)/' \
  | while read -r br; do
      open_count=$(gh pr list --repo "$REPO_CANONICAL" --head "$br" --state open --json number --jq 'length')
      [ "$open_count" -gt 0 ] && continue

      sha=$(gh api "/repos/${REPO_CANONICAL}/branches/${br}" --jq '.commit.sha' 2>/dev/null) || continue
      last=$(gh api "/repos/${REPO_CANONICAL}/commits/${sha}" --jq '.commit.committer.date' 2>/dev/null) || continue
      cutoff=$(date -d '90 days ago' --iso-8601=seconds 2>/dev/null || date -v-90d +%FT%T)
      if [[ "$last" < "$cutoff" ]]; then
        do_or_print "gh api -X DELETE /repos/${REPO_CANONICAL}/git/refs/heads/${br}"
      fi
    done

echo
echo "== Same on org mirror =="
gh api -X GET "/repos/${REPO_ORG}/branches?per_page=100" --jq '.[].name' \
  | grep -Ev '^(main|master|develop|gh-pages)$' \
  | grep -Ev '^(release|hotfix)/' \
  | while read -r br; do
      sha=$(gh api "/repos/${REPO_ORG}/branches/${br}" --jq '.commit.sha' 2>/dev/null) || continue
      last=$(gh api "/repos/${REPO_ORG}/commits/${sha}" --jq '.commit.committer.date' 2>/dev/null) || continue
      cutoff=$(date -d '90 days ago' --iso-8601=seconds 2>/dev/null || date -v-90d +%FT%T)
      if [[ "$last" < "$cutoff" ]]; then
        do_or_print "gh api -X DELETE /repos/${REPO_ORG}/git/refs/heads/${br}"
      fi
    done

echo
echo "== Decisions you must make manually (script only lists, never deletes) =="
echo
echo "Open PRs older than 60 days:"
gh pr list --repo "$REPO_CANONICAL" --state open --limit 200 \
  --json number,title,updatedAt,author \
  --jq '.[] | select(.updatedAt < (now - 60*86400 | todate)) | "  #\(.number)  \(.title)  (last: \(.updatedAt), by \(.author.login))"' || true
echo
echo "Draft PRs older than 30 days:"
gh pr list --repo "$REPO_CANONICAL" --state open --draft --limit 200 \
  --json number,title,updatedAt \
  --jq '.[] | select(.updatedAt < (now - 30*86400 | todate)) | "  #\(.number)  \(.title)  (last: \(.updatedAt))"' || true
echo
echo "Tags on canonical without a GitHub Release:"
git ls-remote --tags "https://github.com/${REPO_CANONICAL}.git" \
  | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}' | sort -u > /tmp/canonical_tags.txt
gh release list --repo "$REPO_CANONICAL" --limit 200 --json tagName --jq '.[].tagName' | sort -u > /tmp/canonical_releases.txt
comm -23 /tmp/canonical_tags.txt /tmp/canonical_releases.txt | sed 's/^/  /' || true
echo
echo "Tag mismatch (org has, canonical does not):"
git ls-remote --tags "https://github.com/${REPO_ORG}.git" \
  | awk '{print $2}' | sed 's|refs/tags/||' | grep -v '\^{}' | sort -u > /tmp/org_tags.txt
comm -23 /tmp/org_tags.txt /tmp/canonical_tags.txt | sed 's/^/  /' || true

echo
if [ "$APPLY" != "--apply" ]; then
  echo "Dry run complete. Re-run with: bash scripts/repo-cleanup.sh --apply"
fi
