# Branch Protection

This repository uses a `.github/rulesets/main.json` branch protection ruleset to ensure safety.

To apply branch protection rules, run the following:
```bash
gh api -X POST /repos/oaslananka/fovux/rulesets --input .github/rulesets/main.json
gh api -X POST /repos/oaslananka-lab/fovux/rulesets --input .github/rulesets/main.json
```

Status checks must be configured via the GitHub UI based on the actual checks running.
