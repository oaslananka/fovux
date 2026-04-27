#!/usr/bin/env bash
set -euo pipefail

version="${1:-}"
if [[ -z "${version}" ]]; then
  echo "usage: scripts/verify_release.sh <version>" >&2
  exit 2
fi

if [[ ! "${version}" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-rc\.[0-9]+)?$ ]]; then
  echo "release version must look like v2.0.0 or v2.0.0-rc.1" >&2
  exit 1
fi

plain="${version#v}"
python_version="$(python - <<'PY'
from pathlib import Path
import re
text = Path("fovux-mcp/src/fovux/__init__.py").read_text()
print(re.search(r'__version__ = "([^"]+)"', text).group(1))
PY
)"
studio_version="$(python - <<'PY'
import json
from pathlib import Path
print(json.loads(Path("fovux-studio/package.json").read_text())["version"])
PY
)"

if [[ "${python_version}" != "${plain}" ]]; then
  echo "fovux-mcp version ${python_version} does not match ${plain}" >&2
  exit 1
fi
if [[ "${studio_version}" != "${plain}" ]]; then
  echo "fovux-studio version ${studio_version} does not match ${plain}" >&2
  exit 1
fi

grep -q "${plain}" RELEASE_NOTES.md
grep -q "${plain}" fovux-mcp/CHANGELOG.md
test -f fovux-mcp/docs/upgrade/v2.md

echo "release preflight passed for ${version}"
