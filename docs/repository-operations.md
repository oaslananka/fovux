# Repository Operations

Fovux uses a dual-GitHub layout:

- Canonical source repository: `https://github.com/oaslananka/fovux`
- CI/CD mirror repository: `https://github.com/oaslananka-lab/fovux`

The canonical repository remains the public product home. The organization mirror is where automatic
GitHub Actions CI runs on push and pull request. Azure DevOps and GitLab remain manual validation
paths.

## Remote Layout

Use these remotes locally:

```bash
git remote add github git@github.com:oaslananka/fovux.git
git remote add org git@github.com:oaslananka-lab/fovux.git
```

The existing Azure remote may stay configured as:

```bash
git remote add azure git@ssh.dev.azure.com:v3/oaslananka/open-source/fovux
```

GitLab is optional and should be added by the maintainer when the mirror exists:

```bash
git remote add gitlab <gitlab-ssh-url>
```

## Syncing Source

After a green local validation and commit, push source to both GitHub repositories:

```bash
git push github main
git push org main
```

The helper scripts can also sync the GitHub remotes and optionally include manual mirrors:

```powershell
./scripts/sync-remotes.ps1 -Branch main
./scripts/sync-remotes.ps1 -Branch main -IncludeAzure -IncludeGitLab
```

```bash
./scripts/sync-remotes.sh main
INCLUDE_AZURE=true INCLUDE_GITLAB=true ./scripts/sync-remotes.sh main
```

## CI/CD Ownership

`org-ci.yml` has push and pull request triggers, but jobs are owner-gated:

- `oaslananka-lab/fovux`: push and pull request CI run automatically.
- `oaslananka/fovux`: automatic jobs are skipped; maintainers can still use manual
  `workflow_dispatch` when needed.

This keeps the personal repository as the canonical source while making the organization repository
the normal CI/CD execution point.

Azure DevOps is manual-only. The root `azure-pipelines.yml` has `trigger: none` and `pr: none`.

GitLab is manual-only. The root `.gitlab-ci.yml` only creates pipelines from the GitLab web UI.

## Release Gate

Release publication is manual-gated. The manual GitHub release workflow accepts both
`oaslananka/fovux` and `oaslananka-lab/fovux`, validates version metadata, builds the Python and VSIX
artifacts, and publishes only when:

- `publish=true`
- `approval=APPROVE_RELEASE`
- required Doppler release secrets are available

## Doppler Secrets

Release workflows do not read registry tokens directly from GitHub, Azure, or GitLab secrets.
Instead, the CI system stores only Doppler access metadata:

```text
DOPPLER_TOKEN
DOPPLER_PROJECT
DOPPLER_CONFIG
```

`DOPPLER_PROJECT` defaults to `all` and `DOPPLER_CONFIG` defaults to `main` when omitted. The selected
Doppler config must contain these release secrets:

```text
PYPI_TOKEN
VSCE_PAT
OVSX_PAT
```

The manual GitHub release workflow installs the Doppler CLI only for `publish=true`, validates those
required keys with `scripts/verify_doppler_release_secrets.sh`, and then runs each publish command
inside `doppler run`. Normal CI jobs do not receive registry tokens.
