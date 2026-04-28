# Repository autonomy

This repository is designed for high autonomy and strict security boundaries.

## Model

The repository operates on a **Mirror-Isolated CI** model. All sensitive operations (full CI, releases, security scans) are isolated to the `oaslananka-lab` organizational mirror. This prevents secret leakage in the public repository and ensures that heavy workloads do not interfere with the development experience.

## Standards

- **Conventional Commits:** Enforced to ensure automated release notes and semantic versioning.
- **Doppler Contract:** All secrets are managed outside the repository in a central Doppler workspace.
- **Rulesets:** Branch protection is managed as code to ensure consistency across the mirror and canonical repositories.
- **Automated Triage:** Labels and PR metadata are managed by automation to reduce maintainer burden.
