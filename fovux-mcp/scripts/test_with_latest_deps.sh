#!/usr/bin/env bash
set -euo pipefail

# Test fovux-mcp against the latest published versions of critical dependencies.
# Intended for the nightly compatibility CI job.

WATCHED_DEPS=(
  ultralytics
  onnxruntime
  torch
  torchvision
  onnx
  opencv-python-headless
  fastmcp
  fastapi
  pydantic
)

echo "=== Nightly Compatibility Test ==="
echo "Date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
echo "Commit: ${GITHUB_SHA:-$(git rev-parse HEAD 2>/dev/null || echo 'unknown')}"
echo ""

# Install base deps from lockfile, then force-upgrade watched deps
uv sync --locked --extra dev

echo "Upgrading watched dependencies to latest..."
for dep in "${WATCHED_DEPS[@]}"; do
  echo "  Upgrading: $dep"
  uv pip install --upgrade "$dep" 2>/dev/null || echo "  Warning: could not upgrade $dep"
done

echo ""
echo "Installed versions:"
for dep in "${WATCHED_DEPS[@]}"; do
  version=$(uv pip show "$dep" 2>/dev/null | grep "^Version:" | cut -d' ' -f2 || echo "not installed")
  echo "  $dep: $version"
done

echo ""
echo "=== Running test suite ==="

# Run tests and capture output
if uv run pytest tests --no-header -q --timeout=120 2>&1 | tee nightly-compat-report.txt; then
  echo ""
  echo "=== All tests passed ==="
  exit 0
else
  echo ""
  echo "=== COMPATIBILITY BREAK DETECTED ==="
  exit 1
fi
