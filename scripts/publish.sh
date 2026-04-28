#!/usr/bin/env bash
set -euo pipefail

# Publish fovux-mcp (Python)
if [ -d "fovux-mcp" ]; then
    echo "Publishing fovux-mcp to PyPI..."
    cd fovux-mcp
    if [ -n "${PYPI_TOKEN:-}" ]; then
        uv publish --token "$PYPI_TOKEN"
    else
        twine upload dist/*.whl dist/*.tar.gz --non-interactive -u __token__ -p "$PYPI_TOKEN"
    fi
    cd ..
fi

# Publish fovux-studio (Node/VS Code)
if [ -d "fovux-studio" ]; then
    cd fovux-studio
    
    if [ -n "${VSCE_PAT:-}" ]; then
        echo "Publishing to VS Code Marketplace..."
        npx vsce publish --packagePath *.vsix --pat "$VSCE_PAT"
    fi

    if [ -n "${OVSX_PAT:-}" ]; then
        echo "Publishing to Open VSX..."
        npx ovsx publish *.vsix --pat "$OVSX_PAT"
    fi

    if [ -n "${NPM_TOKEN:-}" ]; then
        echo "Publishing to npm..."
        npm publish --provenance --access public
    fi
    cd ..
fi
