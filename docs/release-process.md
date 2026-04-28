# Release process

Releases are semi-automated and must be triggered manually from the organizational repository.

## 1. Trigger release

1. Go to `oaslananka-lab/fovux` → Actions → **Release**.
2. Click **Run workflow**.
3. Fill in the version (e.g., `v4.1.0`).
4. Set **Publish to registries** to `true` if you want to push to PyPI/npm/Marketplace.
5. Set **Approval** to `APPROVE_RELEASE`.
6. Click **Run workflow**.

## 2. What happens

- The codebase is built for both `fovux-mcp` and `fovux-studio`.
- Artifacts are signed with Sigstore.
- Build provenance is attested.
- If publish is `true`, artifacts are pushed to their respective registries.
- A GitHub Release is created (or updated if it already exists as a draft).

## 3. Release Notes

Release notes are automatically drafted by **Release Drafter** when PRs are merged to `main`. The release workflow will use these notes to populate the GitHub Release body.
