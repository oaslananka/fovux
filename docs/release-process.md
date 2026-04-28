# Release Process

Releases are completely automated via GitHub Actions on the org mirror.

1. Go to Actions -> Release workflow in the `oaslananka-lab` mirror.
2. Run workflow.
3. Input the version (e.g. `v1.2.3`).
4. Select `publish=true` and type `APPROVE_RELEASE` to actually publish to registries. Otherwise, it will just create a draft GitHub release.

The workflow will automatically sign the binaries with Sigstore and upload provenance. It will also mirror the release back to the canonical repository.
