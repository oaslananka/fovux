# Release Process

This repository automates the release process via `.github/workflows/release.yml`.

## How to trigger a release:
1. Go to the Actions tab in GitHub.
2. Select the `Release` workflow.
3. Click `Run workflow`.
4. Provide the `version` (e.g. `v1.2.3`).
5. Select `true` for publish.
6. Type `APPROVE_RELEASE` to confirm.

The release workflow is guarded and only runs in the `oaslananka-lab/fovux` repository to ensure safe access to publishing credentials via Doppler.

## What flows automatically:
- Artifacts are built for Fovux-mcp and Fovux-studio.
- Provenance and Sigstore signing is added.
- The workflow mirrors the release back to the canonical repository.
