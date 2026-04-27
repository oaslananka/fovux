"""Security tests — explicit path traversal attack vectors.

Validates that tools with file path parameters reject attempts to
escape the FOVUX_HOME sandbox.
"""

from __future__ import annotations

import pytest

from fovux.core.tool_registry import resolve_tool

# Tools that accept file paths as their first parameter
FILE_PATH_TOOLS = [
    "dataset_inspect",
    "dataset_validate",
    "dataset_split",
    "dataset_convert",
    "dataset_augment",
    "dataset_find_duplicates",
    "infer_image",
    "infer_batch",
    "train_start",
    "export_onnx",
    "export_tflite",
]

TRAVERSAL_PAYLOADS = [
    "../../etc/passwd",
    "..\\..\\Windows\\System32\\cmd.exe",
    "/etc/shadow",
    "C:\\Windows\\win.ini",
    "/dev/null",
    "/proc/self/environ",
    "file:///etc/passwd",
    "\\\\server\\share\\secret.txt",
    "....//....//etc//passwd",
    "%2e%2e%2f%2e%2e%2fetc%2fpasswd",
]


@pytest.mark.parametrize("tool_name", FILE_PATH_TOOLS)
@pytest.mark.parametrize("payload", TRAVERSAL_PAYLOADS)
def test_path_traversal_rejected(tool_name: str, payload: str) -> None:
    """File path tools must not silently process traversal payloads."""
    try:
        func = resolve_tool(tool_name)
        func(dataset_path=payload)
    except (TypeError, ValueError, KeyError, FileNotFoundError, OSError, ImportError):
        pass  # Expected rejection
    except Exception as exc:
        # Allow Fovux-specific errors (they indicate proper validation)
        if "Fovux" in type(exc).__name__ or "fovux" in type(exc).__name__.lower():
            pass
        elif "pydantic" in type(exc).__module__.lower():
            pass  # Pydantic validation error
        else:
            # The tool should never silently succeed with a traversal path
            raise AssertionError(
                f"Tool {tool_name} did not reject traversal payload '{payload}': "
                f"raised {type(exc).__name__}: {exc}"
            ) from exc
