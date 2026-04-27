# Release Process

## Overview

Fovux releases are gated, signed, and require explicit maintainer approval.

## Prerequisites

- [ ] All CI gates green on the release branch.
- [ ] `python scripts/check_versions.py` exits 0.
- [ ] `python scripts/quality_gate.py repo-verify` passes.
- [ ] `CHANGELOG.md` updated with the release version.
- [ ] `RELEASE_NOTES.md` rewritten for the new version.

## Build

```bash
# Backend
cd fovux-mcp
uv sync --locked --extra dev
uv run python -m build

# Studio
cd ../fovux-studio
pnpm install --frozen-lockfile
pnpm build
pnpm exec vsce package --out fovux-studio.vsix --no-dependencies
```

## Signing

Wheels and sdist are signed using Sigstore:

```bash
sigstore sign fovux-mcp/dist/*.whl fovux-mcp/dist/*.tar.gz
```

SLSA Level 3 provenance is generated via `slsa-framework/slsa-github-generator`
and attached to the GitHub Release.

VSIX signing: VS Code Marketplace handles its own signature chain. Open VSX
accepts unsigned packages.

## Publishing

Publishing is triggered via the `Manual Release` workflow:

1. Navigate to Actions → Manual Release.
2. Enter the version (e.g., `v4.1.0`).
3. Set `publish: true` and `approval: APPROVE_RELEASE`.
4. Select target: `all`, `pypi`, `marketplace`, or `open-vsx`.

The workflow:
1. Validates the manual gate.
2. Builds all artifacts.
3. Validates Doppler release secrets.
4. Publishes to selected registries.
5. Creates GitHub Releases on both repos.

## Verification

```bash
bash scripts/verify_signatures.sh dist/
bash scripts/verify_release.sh v4.1.0
```

## Post-Release

- [ ] Verify PyPI package installs correctly.
- [ ] Verify VS Code Marketplace listing is updated.
- [ ] Verify Open VSX listing is updated.
- [ ] Tag the release in both repositories.
