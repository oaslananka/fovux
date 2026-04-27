# Phase 0 — Hygiene Cleanup Summary

## Date: 2026-04-27

## Changes Made

### Files modified
- `.gitignore` — hardened with comprehensive patterns for both packages
- `.pre-commit-config.yaml` — added `forbid-build-artifacts` (pre-commit) and `check-versions` (pre-push) hooks

### Files created
- `scripts/forbid_build_artifacts.py` — pre-commit hook that rejects staging of known build artifacts

### Files to delete (requires git repo)
The following tracked artifacts exist on disk and should be untracked:
- `fovux-mcp/htmlcov/` (entire directory)
- `fovux-mcp/coverage.xml` (129 KB)
- `fovux-mcp/junit.xml` (29 KB)
- `fovux-mcp/requirements-audit.txt` (9 KB)
- `fovux-mcp/.coverage` (69 KB)

**Note:** The workspace is not currently a git repository (no `.git` directory). The `git rm --cached` commands must be executed once the repo is initialized. The `.gitignore` changes ensure these files will not be re-committed.

## Commands to run (deferred — no git repo)
```bash
git rm -r --cached fovux-mcp/htmlcov || true
git rm --cached fovux-mcp/coverage.xml fovux-mcp/junit.xml fovux-mcp/requirements-audit.txt fovux-mcp/.coverage || true
```

## Pass/Fail
- `.gitignore` hardened: **PASS**
- `forbid_build_artifacts.py` created: **PASS**
- Pre-commit hooks extended: **PASS**
- `git rm --cached` execution: **DEFERRED** (no git repo — must be run manually)

## Deferred Items
- Actual `git rm --cached` to untrack committed artifacts
- Synthetic test of pre-commit guard rejecting `htmlcov/index.html`
