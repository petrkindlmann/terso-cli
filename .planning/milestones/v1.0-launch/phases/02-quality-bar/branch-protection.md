# Branch protection — `main`

Applied via GitHub web UI by a repo admin. Verifiable with:

```sh
gh api repos/petrkindlmann/terso-cli/branches/main/protection
```

## Required settings

- Require a pull request before merging.
- Require status checks to pass before merging.
  - `test (node 20 / ubuntu-latest)`
  - `test (node 22 / ubuntu-latest)`
  - `test (node 20 / macos-latest)`
  - `test (node 22 / macos-latest)`
  - `test (node 20 / windows-latest)`
  - `test (node 22 / windows-latest)`
  - `coverage`
  - `audit`
  - `offline-emit-gate`
- Require branches to be up to date before merging.
- Require conversation resolution before merging.
- Restrict who can push to matching branches: maintainers only.
- Do not allow bypassing the above settings.

## Encouraged (not required)

- Require signed commits.

## Out-of-band

- Disabling branch protection for an emergency hotfix should be logged in `.planning/incidents/` with a brief postmortem.
