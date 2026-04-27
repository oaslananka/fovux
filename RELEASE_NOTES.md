# Fovux 4.1.0 Release Notes

Fovux 4.1.0 is a hardening release that unifies versions across the monorepo, enforces cross-package compatibility at runtime, closes documentation gaps, and adds security, governance, and CI infrastructure for long-term maintenance.

## Headline Wins

- **Version coherence.** All packages now share a single source-of-truth version (`4.1.0`). A pre-commit hook and CI guard enforce consistency across `pyproject.toml`, `package.json`, `__init__.py`, changelogs, and release notes.
- **Cross-package compatibility contract.** Fovux Studio probes the connected fovux-mcp server version at activation and classifies the connection as `recommended`, `supported`, or `incompatible`. Incompatible servers are blocked until upgraded or overridden.
- **12 granular Language Model Tools.** VS Code Copilot agent mode and other LLM hosts now see individual `fovux_dataset_inspect`, `fovux_train_start`, `fovux_eval_run`, and nine more tool registrations with full input schemas. The generic dispatcher remains available as fallback.
- **First-run walkthrough.** New users reach their first successful run within 5 minutes through a guided Getting Started walkthrough in VS Code.
- **Doctor sidebar and privacy badge.** System health diagnostics are surfaced in a dedicated sidebar tree view. A persistent status bar badge confirms local-only operation.
- **Complete tool documentation.** All 37 registered MCP tools now have documentation pages enforced by a CI completeness gate.
- **MCP discovery.** `server.json` (MCP Registry) and `smithery.yaml` (Smithery) manifests are shipped for ecosystem discoverability.
- **Signed releases.** Wheels are signed via Sigstore and carry SLSA Level 3 provenance.
- **Cross-OS CI.** Backend tests now run on Ubuntu, macOS, and Windows.
- **Nightly compatibility.** A scheduled job tests against the latest versions of `ultralytics`, `onnxruntime`, `torch`, and other critical dependencies.
- **LLM input fuzzing.** Hypothesis-based fuzzing and explicit path-traversal tests harden tool inputs against adversarial LLM payloads.
- **Governance.** ROADMAP, SUPPORT, GOVERNANCE, MAINTAINERS, CITATION.cff, threat model, release process, API stability policy, and troubleshooting guides are now part of the repository.

## Breaking Changes

None. This is a backward-compatible minor release.

## Upgrade Path

```bash
# Backend
cd fovux-mcp
uv sync --locked --extra dev
uv run pytest --no-header -q

# Studio
cd ../fovux-studio
pnpm install --frozen-lockfile
pnpm verify
```

## Release Validation

- `python scripts/check_versions.py` confirms all version sources are coherent.
- `python scripts/quality_gate.py repo-verify` runs the full local validation.
- Backend coverage gate: 90%. Studio coverage gate: 85%.
- `mkdocs build --strict` confirms all 37 tool pages are present and valid.
- VSIX bundle-size regression check passes within the +15% envelope.

## Previous Release Notes

- [3.0.0](docs/release-notes/3.0.0.md)
- [2.0.0](docs/release-notes/2.0.0.md)
