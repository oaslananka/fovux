# Fovux Documentation

This directory holds monorepo-level documentation for operating, releasing, and demonstrating
Fovux. Product documentation for the MCP server lives under `fovux-mcp/docs`.

## Start Here

- [Architecture](architecture.md) explains the MCP server, VS Code extension, HTTP/SSE transport,
  local auth model, and run lifecycle.
- [Repository Operations](repository-operations.md) describes the canonical repository, CI mirror,
  remotes, and manual release gates.
- [Demo Script](demo-script.md) is the 90-second recording checklist and screenshot set.
- [MCP Docs](../fovux-mcp/docs/index.md) cover tools, configuration, security, and user workflows.
- [Studio Source](../fovux-studio/README.md) covers extension setup, packaging, and UI features.

## Release Readiness

The v2.0.0 hardening train is designed to keep source, local checks, and CI aligned:

- `oaslananka/fovux` is the canonical public source repository.
- `oaslananka-lab/fovux` is the CI/CD mirror that runs automatic GitHub Actions checks on push and
  pull request.
- Azure DevOps and GitLab remain manual mirror paths.
- Registry publishing is manual-gated and requires maintainer-supplied tokens.

Before a release, run the repo-level quality gate:

```bash
python scripts/quality_gate.py repo-verify
```
