"""train_resume — resume a stopped or failed training run."""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any, cast

from fovux.core.errors import FovuxTrainingRunNotFoundError
from fovux.core.json_io import write_json_atomically
from fovux.core.paths import FovuxPaths, get_fovux_home
from fovux.core.runs import get_registry
from fovux.core.tooling import tool_event
from fovux.schemas.training import TrainResumeInput, TrainResumeOutput
from fovux.server import mcp


@mcp.tool()
def train_resume(run_id: str, epochs: int | None = None) -> dict[str, Any]:
    """Resume a stopped or failed training run from its last checkpoint."""
    inp = TrainResumeInput(run_id=run_id, epochs=epochs)
    with tool_event("train_resume", run_id=run_id, epochs=epochs):
        return _run_train_resume(inp).model_dump(mode="json")


def _run_train_resume(inp: TrainResumeInput) -> TrainResumeOutput:
    paths = FovuxPaths(get_fovux_home())
    registry = get_registry(paths.runs_db)

    record = registry.get_run(inp.run_id)
    if record is None:
        raise FovuxTrainingRunNotFoundError(inp.run_id)

    run_dir = Path(record.run_path)
    params_path = run_dir / "params.json"
    params = (
        cast(dict[str, Any], json.loads(params_path.read_text())) if params_path.exists() else {}
    )

    last_pt = run_dir / "weights" / "last.pt"
    if not last_pt.exists():
        last_pt = run_dir / "last.pt"

    params["resume_checkpoint"] = str(last_pt) if last_pt.exists() else None
    if inp.epochs is not None:
        params["epochs"] = inp.epochs

    write_json_atomically(params_path, params)

    with (
        (run_dir / "stdout.log").open("a", encoding="utf-8") as stdout_fh,
        (run_dir / "stderr.log").open("a", encoding="utf-8") as stderr_fh,
    ):
        proc = subprocess.Popen(  # noqa: S603 - fixed local module execution only
            [sys.executable, "-m", "fovux.core.train_worker", str(run_dir)],
            stdout=stdout_fh,
            stderr=stderr_fh,
            close_fds=True,
            env={**os.environ, "FOVUX_RUN_DIR": str(run_dir)},
        )
    (run_dir / "pid.txt").write_text(str(proc.pid), encoding="utf-8")

    registry.update_status(inp.run_id, "running", pid=proc.pid)

    return TrainResumeOutput(
        run_id=inp.run_id,
        status="running",
        pid=proc.pid,
        run_path=run_dir,
    )
