# HUMAN REVIEW READY

## Fovux v4.1.0 — Hardening Pass

**Status:** All automated phases complete. Awaiting human review before tag and release.

**Agent attestation:** No tags were pushed, no release workflows were triggered,
no secrets were accessed, and no external network requests were made.

### Quick Validation

```bash
python scripts/check_versions.py
python fovux-mcp/scripts/check_tool_docs.py
```

### Full Validation (requires toolchain)

```bash
cd fovux-mcp && uv sync --locked --extra dev && uv run pytest --no-header -q
cd ../fovux-studio && pnpm install --frozen-lockfile && pnpm verify
```

### Before Tagging

1. Run `git rm -r --cached fovux-mcp/htmlcov fovux-mcp/coverage.xml fovux-mcp/junit.xml fovux-mcp/requirements-audit.txt fovux-mcp/.coverage` to untrack build artifacts.
2. Set the bundle-size baseline: `cd fovux-studio && pnpm build && pnpm exec vsce package --out fovux-studio.vsix --no-dependencies && node scripts/check-bundle-size.js --update-baseline`.
3. Review and approve all changelog entries.
4. Tag `v4.1.0` on the main branch.
5. Trigger the Manual Release workflow in `oaslananka-lab/fovux`.
