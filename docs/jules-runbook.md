# Jules Runbook

The repository is equipped to automatically trigger Jules on labeled issues (e.g. `type:bug`).

To enable this:
1. Ensure the Jules REST API is set up.
2. Add the `JULES_API_KEY` to the `.doppler/secrets.txt` and Doppler dashboard for the `all/main` configuration.
3. Fovux `ci.yml` is already using Jules for failure diagnostics.
