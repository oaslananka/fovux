# Jules Runbook

Fovux has workflow hooks that can start Jules sessions for labeled issues, failed CI, and Dependabot review. The `JULES_API_KEY` value lives in Doppler project `all`, config `main`.

## Automatic Hooks

- `.github/workflows/jules-auto-trigger.yml` starts a session when an issue receives `type:bug`, `type:docs`, `type:refactor`, or `good first issue`.
- `.github/workflows/jules-ci-failure.yml` starts a session when the `CI` or `Org CI/CD` workflow fails on `main`.
- `.github/workflows/jules-dependabot-review.yml` starts a session for newly opened Dependabot pull requests.

## Scheduled Tasks

Create these scheduled tasks in the Jules UI for `oaslananka/fovux`:

| Cadence | Prompt |
| --- | --- |
| Daily 03:00 | Run the full test suite. If anything fails, fix it and open a PR titled `nightly-fix: <date>`. |
| Daily 04:00 | Run mypy strict for `fovux-mcp` and `pnpm --dir fovux-studio typecheck`. Fix any new errors and open a PR. |
| Weekly Mon 02:00 | Run `bandit` and `pip-audit` for Python and `pnpm --dir fovux-studio audit --prod` for Node. Fix any HIGH or CRITICAL findings and open a PR. |
| Weekly Wed 02:00 | Verify public Python functions have docstrings and public TypeScript APIs have JSDoc. Fix gaps and open a PR. |
| Monthly 1st 02:00 | Audit all dependencies for major version updates. Open a single PR per dependency that lists migration impact and a draft upgrade. |
