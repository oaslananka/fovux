"""train_stop — terminate a running training subprocess."""

from __future__ import annotations

import os
import subprocess
import sys
from typing import Any

from fovux.core.errors import FovuxTrainingRunNotFoundError
from fovux.core.paths import FovuxPaths, get_fovux_home
from fovux.core.runs import get_registry
from fovux.core.tooling import tool_event
from fovux.schemas.training import TrainStopInput, TrainStopOutput
from fovux.server import mcp


@mcp.tool()
def train_stop(run_id: str, force: bool = False) -> dict[str, Any]:
    """Stop a running training run by sending a termination signal to its subprocess."""
    inp = TrainStopInput(run_id=run_id, force=force)
    with tool_event("train_stop", run_id=run_id, force=force):
        return _run_train_stop(inp).model_dump(mode="json")


def _run_train_stop(inp: TrainStopInput) -> TrainStopOutput:
    paths = FovuxPaths(get_fovux_home())
    registry = get_registry(paths.runs_db)

    record = registry.get_run(inp.run_id)
    if record is None:
        raise FovuxTrainingRunNotFoundError(inp.run_id)

    status = str(record.status)
    if status != "running":
        return TrainStopOutput(
            run_id=inp.run_id,
            status=status,
            message=f"Run is not running (status={status}). Nothing to stop.",
        )

    pid = int(record.pid) if record.pid is not None else None
    message = "No PID recorded — status updated without signalling."

    if pid is not None:
        message = _kill_pid(pid, force=inp.force)

    registry.update_status(inp.run_id, "stopped")
    return TrainStopOutput(run_id=inp.run_id, status="stopped", message=message)


def _kill_pid(pid: int, *, force: bool) -> str:
    try:
        if sys.platform == "win32":
            flag = "/F" if force else ""
            args = ["taskkill", "/PID", str(pid)]
            if flag:
                args.append(flag)
            subprocess.run(args, capture_output=True, check=False)  # noqa: S603
        else:
            import signal as _signal

            sig = getattr(_signal, "SIGKILL", _signal.SIGTERM) if force else _signal.SIGTERM
            os.kill(pid, sig)
        return f"Signal sent to PID {pid}."
    except (ProcessLookupError, OSError):
        return f"PID {pid} no longer exists."
