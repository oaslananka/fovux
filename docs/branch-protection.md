# Branch protection

Branch protection is managed via GitHub Rulesets. The configuration is stored in `.github/rulesets/main.json`.

## Apply ruleset

To apply or update the ruleset, run the following commands (requires `repo` admin scope):

```bash
gh api -X POST /repos/oaslananka/fovux/rulesets --input .github/rulesets/main.json
gh api -X POST /repos/oaslananka-lab/fovux/rulesets --input .github/rulesets/main.json
```

## Required status checks

The `required_status_checks` array in `.github/rulesets/main.json` is currently empty. After the CI workflows have run at least once, the human maintainer should add the following check names to the ruleset:

- `python-ci`
- `node-ci`
- `lint-fast`
- `Commitlint`
