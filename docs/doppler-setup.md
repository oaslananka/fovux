# Doppler Setup

This repository uses Doppler for secret management.

## One-time human steps:
1. Navigate to Doppler dashboard → Integrations → GitHub → install app on `oaslananka` and `oaslananka-lab`.
2. Configure two GitHub Sync configs per repo (canonical and org) for the Fovux project.
3. Add `DOPPLER_TOKEN` (read-only service token, scoped to `all/main`) as the single GitHub secret on both repositories.

This ensures the repository workflows can securely fetch all necessary tokens via Doppler without persisting them in GitHub Secrets.
