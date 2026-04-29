#!/usr/bin/env bash
set -euo pipefail

# Publish fovux-mcp (Python)
if [ -d "fovux-mcp" ]; then
  : "${PYPI_TOKEN:?PYPI_TOKEN is required to publish fovux-mcp}"
  echo "Publishing fovux-mcp to PyPI..."
  if command -v uv >/dev/null 2>&1; then
    uvx twine upload fovux-mcp/dist/*.whl fovux-mcp/dist/*.tar.gz \
      --non-interactive -u __token__ -p "$PYPI_TOKEN"
  else
    python -m twine upload fovux-mcp/dist/*.whl fovux-mcp/dist/*.tar.gz \
      --non-interactive -u __token__ -p "$PYPI_TOKEN"
  fi
fi

# Publish fovux-studio (VS Code Marketplace and Open VSX)
if [ -d "fovux-studio" ]; then
  cd fovux-studio

  if [ -n "${VSCE_PAT:-}" ]; then
    echo "Publishing to VS Code Marketplace..."
    pnpm exec vsce publish --packagePath fovux-studio.vsix --pat "$VSCE_PAT"
  fi

  if [ -n "${OVSX_PAT:-}" ]; then
    echo "Publishing to Open VSX..."
    pnpm dlx ovsx publish fovux-studio.vsix --pat "$OVSX_PAT"
  fi

  cd ..
fi
