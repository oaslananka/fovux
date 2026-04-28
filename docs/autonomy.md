# Autonomy

This repository implements a fully autonomous infrastructure pattern.

- It is mirrored to an org account for heavy CI tasks and secure secret injection.
- Developer pushes, merges, and reviews occur in the canonical repo.
- Actions workflows delegate to `Taskfile.yml` to maintain strict CI-local parity.
- Secrets are centrally managed in Doppler.
- Routine maintenance (like code scanning, releases, issue triaging, branch cleanup) runs automatically or via streamlined dispatch.
