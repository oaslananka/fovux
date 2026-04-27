"""HTTP-safe proxy registry for invoking Fovux tools locally."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from fovux.core.errors import FovuxError
from fovux.core.tool_registry import available_tools as registry_available_tools
from fovux.core.tool_registry import resolve_tool


def available_tools() -> list[str]:
    """Return the tool names reachable through the HTTP proxy."""
    return registry_available_tools()


def invoke_tool(name: str, payload: Mapping[str, object]) -> dict[str, Any]:
    """Invoke a local tool by name using a JSON-compatible payload."""
    tool = resolve_tool(name)

    kwargs = {str(key): value for key, value in payload.items()}
    try:
        return tool(**kwargs)
    except FovuxError:
        raise
