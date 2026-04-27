"""Unit + integration tests for dataset_inspect."""

from __future__ import annotations

from pathlib import Path

import pytest

from fovux.core.errors import FovuxDatasetNotFoundError
from fovux.schemas.dataset import DatasetInspectInput
from fovux.tools.dataset_inspect import _run_inspect

FIXTURES = Path(__file__).parent.parent.parent / "fixtures"


def test_inspect_mini_yolo_counts():
    """Should detect 40 images and 2 classes in mini_yolo fixture."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo")
    out = _run_inspect(inp)
    assert out.format_detected == "yolo"
    assert out.total_images == 40
    assert out.num_classes == 2
    assert out.total_annotations == 40


def test_inspect_mini_yolo_class_names():
    """Class names should be cat and dog."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo")
    out = _run_inspect(inp)
    names = [c.name for c in out.classes]
    assert "cat" in names
    assert "dog" in names


def test_inspect_mini_yolo_splits():
    """Should detect train and val splits."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo")
    out = _run_inspect(inp)
    assert "train" in out.splits_detected
    assert "val" in out.splits_detected
    assert out.splits_detected["train"] == 30
    assert out.splits_detected["val"] == 10


def test_inspect_mini_coco():
    """Should inspect COCO format dataset."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_coco", format="coco")
    out = _run_inspect(inp)
    assert out.format_detected == "coco"
    assert out.total_images == 20
    assert out.num_classes == 2


def test_inspect_nonexistent_path():
    """Should raise FovuxDatasetNotFoundError for missing path."""
    with pytest.raises(FovuxDatasetNotFoundError):
        _run_inspect(DatasetInspectInput(dataset_path=Path("/nonexistent/dataset")))


def test_inspect_sample_paths_included():
    """include_samples=True should return up to 10 sample paths."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo", include_samples=True)
    out = _run_inspect(inp)
    assert len(out.sample_paths) > 0
    assert len(out.sample_paths) <= 10


def test_inspect_gini_balanced():
    """Balanced dataset should have low Gini coefficient."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo")
    out = _run_inspect(inp)
    assert out.class_balance_gini < 0.5


def test_inspect_duration_recorded():
    """Duration should be a positive float."""
    inp = DatasetInspectInput(dataset_path=FIXTURES / "mini_yolo")
    out = _run_inspect(inp)
    assert out.analysis_duration_seconds > 0
