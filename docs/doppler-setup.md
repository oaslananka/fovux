# Doppler setup

This repository uses Doppler for secret management. GitHub Action secrets are avoided except for the bootstrap `DOPPLER_TOKEN`.

## Initial setup (One-time)

1. **Doppler Dashboard:**
   - Go to Integrations → GitHub.
   - Install the Doppler app on both `oaslananka` and `oaslananka-lab` organizations.
2. **GitHub Repository Secrets:**
   - On `oaslananka/fovux` AND `oaslananka-lab/fovux`, add a single Repository Secret:
     - `DOPPLER_TOKEN`: A read-only service token from Doppler, scoped to the `all/main` config.
3. **Mirror Token (Canonical only):**
   - On `oaslananka/fovux`, add `DOPPLER_GITHUB_SERVICE_TOKEN` as a secret (or rely on Doppler if fetched via CLI). Note: The mirror workflow needs this token to push to the lab repo.

## Required secrets

The repository expects the following secrets to be present in the Doppler `all/main` config:

- `CODECOV_TOKEN`
- `DOPPLER_GITHUB_SERVICE_TOKEN`
- `NPM_TOKEN`
- `OVSX_PAT`
- `PYPI_TOKEN`
- `VSCE_PAT`
- `JULES_API_KEY`

Run `bash scripts/verify_doppler_secrets.sh` locally to check for missing secrets.
