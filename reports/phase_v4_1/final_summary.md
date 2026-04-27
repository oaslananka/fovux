# Fovux v4.1.0 — Final Summary

## Release: Fovux v4.1.0 Hardening Pass

## Date: 2026-04-27

## Status: READY FOR HUMAN REVIEW

---

## Version Coherence ✅

```
$ python scripts/check_versions.py
All version sources are coherent: 4.1.0
```

All 7 version sources (pyproject.toml, **init**.py, package.json, 3 changelogs,
RELEASE_NOTES.md) are aligned to `4.1.0`.

## Tool Documentation ✅

```
$ python fovux-mcp/scripts/check_tool_docs.py
All 36 tools have documentation pages.
```

## Changes by Phase

### Phase 0 — Hygiene Cleanup

- Hardened `.gitignore` (44 patterns covering both packages)
- Created `scripts/forbid_build_artifacts.py` pre-commit hook
- Extended `.pre-commit-config.yaml` with artifact guard

### Phase 1 — Version Coherence

- Fixed version drift: `3.0.0` → `4.1.0` (init), `4.0.0` → `4.1.0` (pyproject, package.json)
- Created `scripts/check_versions.py` with CI integration
- Updated all 3 changelogs with `[4.1.0]` sections
- Rewrote `RELEASE_NOTES.md`; archived old notes to `docs/release-notes/`

### Phase 2 — Cross-package Compatibility

- Created `compat.ts` with `FOVUX_COMPAT` constant and `classifyCompat()` function
- Created `statusBar.ts` for compat state and privacy badge
- Updated `/health` to return `service: "fovux-mcp"` field
- Added `fovux.experimental.allowIncompatibleServer` config
- Test coverage: 11 test cases for all compat states

### Phase 3 — Granular LM Tools

- Created 12 granular tool definitions in `tools/definitions.ts`
- Rewrote `languageModelTools.ts` to register generic + 12 granular tools
- Added 12 `languageModelTools` entries to `package.json`

### Phase 4 — First-run Walkthrough

- 6-step walkthrough (install, profile, server, doctor, dashboard, dataset)
- Walkthrough content in `resources/walkthroughs/`
- `walkthroughActions.ts` with `installBackend`, `runDoctor`, etc.
- Registered in `extension.ts` and `package.json`

### Phase 5 — Tool Documentation Completeness

- Created 8 missing tool doc pages (36/36 coverage)
- `check_tool_docs.py` enforces completeness in CI
- Updated `mkdocs.yml` nav

### Phase 6 — MCP Discovery

- Created `server.json` (MCP Registry) and `smithery.yaml` (Smithery)
- Created `sync_mcp_metadata.py` for version lockstep
- Tests for version alignment

### Phase 8 — Real-server Integration Tests

- Created `test_real_server_smoke.py` with pytest fixture for server lifecycle

### Phase 9 — Doctor Sidebar & Privacy Badge

- Created `doctorTree.ts` with pass/warn/fail tree view
- Privacy badge status bar item in `statusBar.ts`
- Registered `fovux.doctorView` in `package.json`

### Phase 10 — Sigstore Signing & SLSA

- Added sigstore step to `manual-release.yml`
- Created `slsa.yml` workflow
- Created `verify_signatures.sh`
- Created `docs/release-process.md`

### Phase 11 — mkdocs Pages Deploy

- Created `docs-deploy.yml` workflow (gated to `oaslananka-lab/fovux`)

### Phase 12 — Cross-OS CI

- Extended `mcp` job matrix to `ubuntu-24.04`, `macos-14`, `windows-2025`
- Full Python version matrix on Ubuntu; `3.13` only on macOS/Windows
- Created `docs/ci-skip-policy.md`

### Phase 13 — Nightly Compatibility

- Created `nightly-compat.yml` (daily 03:00 UTC)
- Created `test_with_latest_deps.sh` for upstream dep testing

### Phase 14 — LLM Input Fuzzing

- Created `test_fuzz_tool_inputs.py` (Hypothesis-based, 20 examples/tool)
- Created `test_path_traversal.py` (11 tools × 10 payloads)

### Phase 15 — Governance & Citation

- Created `ROADMAP.md`, `SUPPORT.md`, `GOVERNANCE.md`, `MAINTAINERS.md`, `CITATION.cff`
- Created `docs/threat-model.md`, `api-stability.md`, `troubleshooting.md`
- Created `.github/labels.yml` (30 labels)
- Created `sync-labels.yml`, `stale.yml`, `lock.yml` workflows

### Phase 16 — VSIX Bundle-size Check

- Created `check-bundle-size.js` (15% threshold)
- Created `bundle-size-baseline.json` (placeholder)
- Added `check:bundle-size` script to `package.json`

## Files Created (new)

| Count   | Category                  |
| ------- | ------------------------- |
| 8       | Tool documentation pages  |
| 6       | Walkthrough content files |
| 5       | Governance documents      |
| 4       | GitHub workflows          |
| 3       | Security test files       |
| 3       | Documentation pages       |
| 2       | MCP discovery manifests   |
| 2       | Bundle-size checker       |
| 2       | Tool definition types     |
| 1       | Version checker script    |
| 1       | Artifact guard script     |
| 1       | Metadata sync script      |
| 1       | Signature verifier        |
| 1       | Nightly dep test script   |
| 1       | Status bar utilities      |
| 1       | Compat module             |
| 1       | Doctor tree view          |
| 1       | Walkthrough actions       |
| 1       | Integration test          |
| 1       | Labels config             |
| 1       | CI skip policy            |
| **~47** | **Total new files**       |

## Files Modified

| File                                           | Changes                                                        |
| ---------------------------------------------- | -------------------------------------------------------------- |
| `fovux-mcp/pyproject.toml`                     | Version → 4.1.0                                                |
| `fovux-mcp/src/fovux/__init__.py`              | Version → 4.1.0                                                |
| `fovux-mcp/src/fovux/http/routes.py`           | Added `service` field to `/health`                             |
| `fovux-mcp/mkdocs.yml`                         | Added 8 tool pages to nav                                      |
| `fovux-studio/package.json`                    | Version, 12 LM tools, walkthrough, doctor view, config, script |
| `fovux-studio/src/extension.ts`                | Walkthrough + privacy badge wiring                             |
| `fovux-studio/src/fovux/languageModelTools.ts` | Full rewrite for granular tools                                |
| `.gitignore`                                   | Comprehensive pattern coverage                                 |
| `.pre-commit-config.yaml`                      | 2 new hooks                                                    |
| `.github/workflows/org-ci.yml`                 | Cross-OS matrix, version check                                 |
| `.github/workflows/manual-release.yml`         | Sigstore step                                                  |
| `scripts/quality_gate.py`                      | Version check integration                                      |
| `CHANGELOG.md` (root)                          | 4.1.0 entry                                                    |
| `fovux-mcp/CHANGELOG.md`                       | 4.1.0 entry                                                    |
| `fovux-studio/CHANGELOG.md`                    | 4.1.0 entry                                                    |
| `RELEASE_NOTES.md`                             | Full rewrite                                                   |

## What Was NOT Done

1. **Phase 7 (JSON Schema export)** — Skipped for now; requires running the actual tool registry and extracting pydantic schemas. Can be done as a follow-up.
2. **git rm --cached** — Workspace is not a git repo; artifact removal commands are documented but deferred.
3. **Studio integration test** (`realServer.test.ts`) — Deferred as it requires a running server in the test environment.
4. **Actual CI runs** — No tags pushed, no workflows triggered, per the operating principles.
5. **Bundle-size baseline** — Placeholder; needs a clean build to set the real value.
6. **DOI for CITATION.cff** — Omitted until a Zenodo DOI is minted.

## Verification Commands

```bash
python scripts/check_versions.py                     # ✅ All coherent: 4.1.0
python fovux-mcp/scripts/check_tool_docs.py           # ✅ All 36 tools documented
# Deferred (require toolchain):
# python scripts/quality_gate.py repo-verify
# cd fovux-mcp && uv run pytest --no-header -q
# cd fovux-studio && pnpm verify
```

## Human Review Checklist

- [ ] Verify all version sources in the actual git repo
- [ ] Run `pnpm verify` in fovux-studio
- [ ] Run `uv run pytest` in fovux-mcp
- [ ] Review CHANGELOG.md entries for completeness
- [ ] Review RELEASE_NOTES.md
- [ ] Review the 12 granular tool descriptions for LLM accuracy
- [ ] Set the bundle-size baseline after clean build
- [ ] Execute `git rm --cached` commands for tracked artifacts
- [ ] Tag v4.1.0 only after all checks pass
