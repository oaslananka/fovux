# Repository operations

This repository follows the **Dual-Owner Mirror** model for security and CI/CD efficiency.

## Architecture

- **Canonical Repository:** `oaslananka/fovux`
  - Primary entry point for maintainers and contributors.
  - Contains code, issues, and PRs.
  - Only lightweight linting runs here.
- **Mirror Repository:** `oaslananka-lab/fovux`
  - Dedicated runner for heavy CI, security scans, and releases.
  - Automatically synchronized from canonical.
  - Stores all secrets in Doppler.

## Synchronization

### Automatic
Any push to `oaslananka/fovux` (all branches and tags) is automatically mirrored to `oaslananka-lab/fovux` via the `Mirror to org` workflow.

### Manual recovery
If the automatic mirror fails, maintainers can sync manually from a local machine using:

```bash
bash scripts/sync-remotes.sh
```

## Secret management
Secrets are NOT stored in GitHub. They are fetched dynamically from Doppler at runtime. Maintainers should only manage secrets in the Doppler dashboard.

## Repository hygiene

### Automated branch deletion
To keep the branch list clean, ensure the "Automatically delete head branches" setting is enabled in the canonical repository settings. If not enabled, a maintainer can enable it via CLI:

```bash
gh api -X PATCH /repos/oaslananka/fovux -f delete_branch_on_merge=true
```

### Manual cleanup script
For periodic deep cleanup of stale local and remote branches, use the provided cleanup script:

```bash
# Dry-run to review what would be deleted
bash scripts/repo-cleanup.sh

# Apply deletions
bash scripts/repo-cleanup.sh --apply
```

### Monthly hygiene report
A monthly workflow runs in the lab repository to identify stale branches and old PRs, opening a tracking issue for maintainer review.
