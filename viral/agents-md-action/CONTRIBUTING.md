# Contributing

This action is a single `action.yml` with two bash steps. Most contributions
are one of:

- Adjust an existing step's behavior.
- Add a new input.
- Fix a bug in the section linter.

## Local test

GitHub Actions doesn't run locally, but `act` covers most of it:

```sh
act -j check -W .github/workflows/test.yml
```

For ad-hoc checks of the bash logic, copy the script body into a local shell
and `export` the relevant inputs.

## PR expectations

- The action stays a single composite action. No Node action conversion
  without a strong reason — the install cost matters.
- Inputs follow GitHub Actions conventions: kebab-case names, default values
  documented in `action.yml` and the README.
- Releases are tagged `v1.x.y` and `v1` is moved to track latest.
