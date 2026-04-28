"""Generate a minimal SPDX 2.3 tag-value SBOM for the active Python environment."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from importlib import metadata
from pathlib import Path
from uuid import uuid4


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", default="fovux-mcp-python-environment")
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    if args.output.suffix == ".json":
        _write_json_sbom(args.name, args.output)
        return 0

    _write_tag_value_sbom(args.name, args.output)
    return 0


def _write_json_sbom(name: str, output: Path) -> None:
    created = datetime.now(UTC).strftime("%Y-%m-%dT%H:%M:%SZ")
    document = {
        "spdxVersion": "SPDX-2.3",
        "dataLicense": "CC0-1.0",
        "SPDXID": "SPDXRef-DOCUMENT",
        "name": name,
        "documentNamespace": f"https://github.com/oaslananka/fovux/spdx/{uuid4()}",
        "creationInfo": {
            "created": created,
            "creators": ["Tool: fovux-build-spdx-sbom.py"],
        },
        "packages": [_package_json(dist) for dist in _distributions()],
    }
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(
        json.dumps(document, indent=2, sort_keys=True) + "\n", encoding="utf-8"
    )


def _write_tag_value_sbom(name: str, output: Path) -> None:
    lines = [
        "SPDXVersion: SPDX-2.3",
        "DataLicense: CC0-1.0",
        "SPDXID: SPDXRef-DOCUMENT",
        f"DocumentName: {name}",
        f"DocumentNamespace: https://github.com/oaslananka/fovux/spdx/{uuid4()}",
        "Creator: Tool: fovux-build-spdx-sbom.py",
        f"Created: {datetime.now(UTC).strftime('%Y-%m-%dT%H:%M:%SZ')}",
        "",
    ]

    for dist in _distributions():
        name = dist.metadata["Name"]
        version = dist.version
        license_value = _license_for(dist)
        package_id = "SPDXRef-Package-" + _sanitize(f"{name}-{version}")
        lines.extend(
            [
                f"PackageName: {name}",
                f"SPDXID: {package_id}",
                f"PackageVersion: {version}",
                "PackageDownloadLocation: NOASSERTION",
                "FilesAnalyzed: false",
                "PackageLicenseConcluded: NOASSERTION",
                f"PackageLicenseDeclared: {license_value}",
                "PackageCopyrightText: NOASSERTION",
                "",
            ]
        )

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines), encoding="utf-8")


def _package_json(dist: metadata.Distribution) -> dict[str, object]:
    name = dist.metadata["Name"]
    version = dist.version
    package_id = "SPDXRef-Package-" + _sanitize(f"{name}-{version}")
    return {
        "SPDXID": package_id,
        "name": name,
        "versionInfo": version,
        "downloadLocation": "NOASSERTION",
        "filesAnalyzed": False,
        "licenseConcluded": "NOASSERTION",
        "licenseDeclared": _license_for(dist),
        "copyrightText": "NOASSERTION",
    }


def _distributions() -> list[metadata.Distribution]:
    return sorted(
        metadata.distributions(), key=lambda item: item.metadata["Name"].lower()
    )


def _license_for(dist: metadata.Distribution) -> str:
    license_value = dist.metadata.get("License")
    if license_value and len(license_value) < 80:
        return _sanitize_license(license_value)
    classifiers = dist.metadata.get_all("Classifier") or []
    for classifier in classifiers:
        if classifier.startswith("License ::"):
            return "NOASSERTION"
    return "NOASSERTION"


def _sanitize(value: str) -> str:
    return "".join(char if char.isalnum() else "-" for char in value)


def _sanitize_license(value: str) -> str:
    allowed = set("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-.+")
    sanitized = "".join(char for char in value.strip() if char in allowed)
    return sanitized or "NOASSERTION"


if __name__ == "__main__":
    raise SystemExit(main())
