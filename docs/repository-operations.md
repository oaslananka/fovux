# Repository Operations

The canonical repository is `oaslananka/fovux`. The CI/CD mirror is `oaslananka-lab/fovux`.

## Dual-owner mirror model

We use a dual-owner model for this repository:
1. `oaslananka/fovux`: This is the public, canonical repository where developers open PRs, read code, and download releases.
2. `oaslananka-lab/fovux`: This is a private or internal CI/CD runner mirror where heavy testing, scanning, releases, and scheduled maintenance run.

## Auto-deleting merged branches
The canonical repo is configured to automatically delete head branches upon merging.

If you ever need to manually configure it:
```bash
gh api -X PATCH /repos/oaslananka/fovux -f delete_branch_on_merge=true
```

## Repository Hygiene
To safely clean up old branches, run:
```bash
bash scripts/repo-cleanup.sh
```
This is a dry-run script. It will print the actions it would take. To execute, run:
```bash
bash scripts/repo-cleanup.sh --apply
```

## Syncing Remotes
If the automated mirroring fails, you can sync manually using the `scripts/sync-remotes.sh` (or `.ps1`) script.
