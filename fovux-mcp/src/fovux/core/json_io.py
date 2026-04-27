"""Small JSON filesystem helpers shared by tool entry points."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any


def write_json_atomically(path: Path, payload: dict[str, Any]) -> None:
    """Write JSON through a sibling temp file and atomic replace."""
    temp_path = path.with_suffix(f"{path.suffix}.tmp")
    temp_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    temp_path.replace(path)
