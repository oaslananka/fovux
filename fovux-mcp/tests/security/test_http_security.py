"""Security-focused checks for the local HTTP transport."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from fovux.http.app import create_app


@pytest.mark.security
def test_http_routes_reject_missing_bearer_token() -> None:
    """Authenticated Studio routes should reject unauthenticated callers."""
    with TestClient(create_app()) as client:
        response = client.get("/runs")

    assert response.status_code == 401


@pytest.mark.security
def test_http_routes_reject_stale_bearer_token() -> None:
    """A replayed or stale token should not authorize run access."""
    with TestClient(create_app()) as client:
        response = client.get("/runs", headers={"Authorization": "Bearer stale-token"})

    assert response.status_code == 401
