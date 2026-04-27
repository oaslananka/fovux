"""Filesystem safety checks used by tools and HTTP entrypoints."""

from __future__ import annotations

import os
import tempfile
from collections.abc import Iterable
from pathlib import Path

from fovux.config import load_config
from fovux.core.errors import FovuxPathValidationError
from fovux.core.paths import get_fovux_home

_BYTES_PER_MB = 1024 * 1024


def resolve_local_path(path: Path) -> Path:
    """Expand and resolve a local path without requiring it to already exist."""
    return path.expanduser().resolve(strict=False)


def ensure_within_root(path: Path, root: Path) -> Path:
    """Ensure a file stays within an expected root, even through symlinks."""
    resolved_path = resolve_local_path(path)
    resolved_root = resolve_local_path(root)
    try:
        resolved_path.relative_to(resolved_root)
    except ValueError as exc:
        raise FovuxPathValidationError(
            str(path),
            f"resolved path escapes allowed root {resolved_root}",
            hint="Use a path inside the selected dataset or run directory.",
        ) from exc
    return resolved_path


def max_file_size_bytes() -> int:
    """Return the configured maximum readable file size in bytes."""
    config = load_config()
    return config.validation.max_file_size_mb * _BYTES_PER_MB


def validate_file_size(path: Path, *, max_bytes: int | None = None) -> None:
    """Reject files larger than the configured local safety limit."""
    limit = max_bytes or max_file_size_bytes()
    if not path.exists() or not path.is_file():
        return
    size = path.stat().st_size
    if size > limit:
        raise FovuxPathValidationError(
            str(path),
            f"file size {size} bytes exceeds the local safety limit of {limit} bytes",
            hint="Lower the file size or raise fovux.validation.max_file_size_mb in config.toml.",
        )


def ensure_writable_output(
    path: Path,
    *,
    allowed_roots: Iterable[Path] | None = None,
) -> Path:
    """Ensure an output path resolves under one of the allowed roots."""
    resolved_path = resolve_local_path(path)
    roots = list(allowed_roots) if allowed_roots is not None else _default_allowed_roots()
    resolved_roots = [resolve_local_path(root) for root in roots]

    for root in resolved_roots:
        try:
            resolved_path.relative_to(root)
            return resolved_path
        except ValueError:
            continue

    allowed_display = ", ".join(str(root) for root in resolved_roots)
    raise FovuxPathValidationError(
        str(path),
        f"resolved output escapes allowed roots: {allowed_display}",
        hint="Write inside FOVUX_HOME, the current workspace, or pass an explicit allow-root.",
    )


def _default_allowed_roots() -> list[Path]:
    return [get_fovux_home(), Path(os.getcwd()), Path(tempfile.gettempdir())]
