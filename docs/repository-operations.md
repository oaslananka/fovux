# Repository Operations

## Dual-owner mirror model

This repository uses a dual-owner model:
- `oaslananka/fovux` is the canonical public repository. It consumes **zero** GitHub Actions minutes.
- `oaslananka-lab/fovux` is the CI/CD runner mirror. All Actions run here, on the org plan.

The mirror periodically pulls from canonical (every 15 minutes) and replays branches and tags into itself. 

If you need an immediate sync, set up a one-time manual webhook from canonical to org that fires `repository_dispatch` events of type `canonical-push`.

## Disable Actions defensively on personal repo

```bash
# Disable Actions entirely on the personal repo
gh api -X PUT /repos/oaslananka/fovux/actions/permissions \
  -f enabled=false

# Re-enable later if needed:
gh api -X PUT /repos/oaslananka/fovux/actions/permissions \
  -f enabled=true -f allowed_actions=all
```

## Branch hygiene

The canonical repo should have "Automatically delete head branches" enabled:
```bash
gh api -X PATCH /repos/oaslananka/fovux -f delete_branch_on_merge=true
```

You can run `bash scripts/repo-cleanup.sh` to review and clean up old branches automatically.
