#!/usr/bin/env bash
set -euo pipefail

TARGET="${PUBLISH_TARGET:-all}"

# Publish fovux-mcp (Python)
if [ -d "fovux-mcp" ] && [[ "$TARGET" == "all" || "$TARGET" == "pypi" ]]; then
    echo "Publishing fovux-mcp to PyPI..."
    cd fovux-mcp
    if [ -n "${PYPI_TOKEN:-}" ]; then
        uv publish --token "$PYPI_TOKEN"
    else
        # Fallback to twine if uv publish not configured
        twine upload dist/*.whl dist/*.tar.gz --non-interactive -u __token__ -p "$PYPI_TOKEN"
    fi
    cd ..
fi

# Publish fovux-studio (Node/VS Code)
if [ -d "fovux-studio" ]; then
    cd fovux-studio
    
    if [[ "$TARGET" == "all" || "$TARGET" == "marketplace" ]]; then
        if [ -n "${VSCE_PAT:-}" ]; then
            echo "Publishing to VS Code Marketplace..."
            pnpm exec vsce publish --packagePath fovux-studio.vsix --pat "$VSCE_PAT" --no-dependencies
        fi
    fi

    if [[ "$TARGET" == "all" || "$TARGET" == "open-vsx" ]]; then
        if [ -n "${OVSX_PAT:-}" ]; then
            echo "Publishing to Open VSX..."
            pnpm dlx ovsx publish fovux-studio.vsix --pat "$OVSX_PAT"
        fi
    fi

    if [[ "$TARGET" == "all" ]]; then
        if [ -n "${NPM_TOKEN:-}" ]; then
            echo "Publishing to npm..."
            npm publish --provenance --access public
        fi
    fi
    cd ..
fi
