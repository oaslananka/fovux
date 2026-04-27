"""Check version coherence across the Fovux monorepo.

Reads all sources of truth for the package version and asserts they
match.  Exits non-zero with a clear diff on mismatch.

Sources:
  1. fovux-mcp/pyproject.toml            [project].version
  2. fovux-mcp/src/fovux/__init__.py      __version__
  3. fovux-studio/package.json            version
  4. CHANGELOG.md (root)                  top version header
  5. fovux-mcp/CHANGELOG.md               top version header
  6. fovux-studio/CHANGELOG.md            top version header
  7. RELEASE_NOTES.md                     headline version
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path


def _repo_root() -> Path:
    """Locate the monorepo root relative to this script."""
    return Path(__file__).resolve().parent.parent


def _read_pyproject_version(root: Path) -> str:
    """Extract version from pyproject.toml."""
    pyproject = root / "fovux-mcp" / "pyproject.toml"
    content = pyproject.read_text(encoding="utf-8")
    match = re.search(r'^version\s*=\s*"([^"]+)"', content, re.MULTILINE)
    if not match:
        return "<not found in pyproject.toml>"
    return match.group(1)


def _read_init_version(root: Path) -> str:
    """Extract __version__ from fovux/__init__.py."""
    init_file = root / "fovux-mcp" / "src" / "fovux" / "__init__.py"
    content = init_file.read_text(encoding="utf-8")
    match = re.search(r'^__version__\s*=\s*"([^"]+)"', content, re.MULTILINE)
    if not match:
        return "<not found in __init__.py>"
    return match.group(1)


def _read_package_json_version(root: Path) -> str:
    """Extract version from fovux-studio/package.json."""
    pkg = root / "fovux-studio" / "package.json"
    data = json.loads(pkg.read_text(encoding="utf-8"))
    return str(data.get("version", "<not found in package.json>"))


def _read_changelog_top_version(changelog_path: Path) -> str:
    """Extract the version from the topmost ## [x.y.z] header."""
    if not changelog_path.exists():
        return f"<{changelog_path.name} not found>"
    content = changelog_path.read_text(encoding="utf-8")
    match = re.search(r"^##\s*\[([^\]]+)\]", content, re.MULTILINE)
    if not match:
        return f"<no version header in {changelog_path.name}>"
    version = match.group(1)
    if version.lower() == "unreleased":
        # Look for the next versioned header
        matches = re.findall(r"^##\s*\[([^\]]+)\]", content, re.MULTILINE)
        for candidate in matches:
            if candidate.lower() != "unreleased":
                return candidate
        return "Unreleased"
    return version


def _read_release_notes_version(root: Path) -> str:
    """Extract version from RELEASE_NOTES.md headline."""
    rn = root / "RELEASE_NOTES.md"
    if not rn.exists():
        return "<RELEASE_NOTES.md not found>"
    content = rn.read_text(encoding="utf-8")
    match = re.search(r"^#\s+Fovux\s+(\S+)", content, re.MULTILINE)
    if not match:
        return "<no version in RELEASE_NOTES.md>"
    return match.group(1)


def check_versions() -> int:
    """Check all version sources and return 0 if coherent, 1 otherwise."""
    root = _repo_root()

    sources: dict[str, str] = {
        "fovux-mcp/pyproject.toml": _read_pyproject_version(root),
        "fovux-mcp/src/fovux/__init__.py": _read_init_version(root),
        "fovux-studio/package.json": _read_package_json_version(root),
        "CHANGELOG.md (root)": _read_changelog_top_version(root / "CHANGELOG.md"),
        "fovux-mcp/CHANGELOG.md": _read_changelog_top_version(
            root / "fovux-mcp" / "CHANGELOG.md"
        ),
        "fovux-studio/CHANGELOG.md": _read_changelog_top_version(
            root / "fovux-studio" / "CHANGELOG.md"
        ),
        "RELEASE_NOTES.md": _read_release_notes_version(root),
    }

    unique_versions = set(sources.values())

    if len(unique_versions) == 1:
        version = unique_versions.pop()
        print(f"All version sources are coherent: {version}")
        return 0

    print("VERSION MISMATCH DETECTED")
    print()
    max_label = max(len(label) for label in sources)
    for label, version in sources.items():
        marker = "  " if version == max(unique_versions, key=lambda v: list(sources.values()).count(v)) else "!!"
        print(f"  {marker} {label:<{max_label}}  {version}")
    print()
    print(f"Found {len(unique_versions)} distinct versions: {sorted(unique_versions)}")
    return 1


if __name__ == "__main__":
    raise SystemExit(check_versions())
