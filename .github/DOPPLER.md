# Doppler Secret Management

Fovux uses Doppler as the source of truth for CI and release secrets.

## Expected Secrets

The committed inventory lives in `.doppler/secrets.txt`. It contains secret names only:

- `DOPPLER_GITHUB_SERVICE_TOKEN`
- `JULES_API_KEY`
- `OVSX_PAT`
- `PYPI_TOKEN`
- `VSCE_PAT`

`DOPPLER_TOKEN` is the single GitHub-managed bootstrap secret. It is a read-only service token scoped to Doppler project `all`, config `main`.

## Add a New Secret

1. Add the value in Doppler project `all`, config `main`.
2. Add the secret name to `.doppler/secrets.txt` if CI or release jobs need it.
3. Wrap consuming workflow commands with:

   ```bash
   doppler run --project all --config main -- <command>
   ```

4. Verify with:

   ```bash
   bash scripts/verify_doppler_secrets.sh
   ```

Dashboard: https://dashboard.doppler.com/
