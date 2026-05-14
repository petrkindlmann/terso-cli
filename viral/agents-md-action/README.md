# AGENTS.md check — GitHub Action

[![Marketplace](https://img.shields.io/badge/marketplace-AGENTS.md_check-blue)](https://github.com/marketplace/actions/agents-md-check)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A small GitHub Action that **gates AGENTS.md drift** in CI.

It does two things:

1. **Lint** — verifies `AGENTS.md` exists and contains the H2 sections you
   require (`require-sections` input).
2. **Drift check** — runs `terso emit --check` to fail the build if any
   per-agent file (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`)
   has drifted from the canonical `AGENTS.md`.

## Quick start

```yaml
# .github/workflows/agents-check.yml
name: AGENTS.md
on: [push, pull_request]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - uses: petrkindlmann/agents-md-action@v1
        with:
          require-sections: 'Project rules,Testing'
```

The action installs `terso-cli` from npm under the hood, so no separate setup is needed.

## Inputs

| Input | Default | Description |
|---|---|---|
| `terso-version` | `latest` | Version of `terso-cli` to install (`latest` or a semver range). |
| `targets` | *(auto)* | Comma-separated subset of `claude,cursor,copilot`. Default auto-detects from the repo. |
| `require-sections` | *(none)* | Comma-separated H2 section names that must appear in `AGENTS.md`. Empty disables the lint. |
| `fail-on-missing` | `true` | Fail the check if `AGENTS.md` does not exist. |

## Outputs

The action exits non-zero on any failure; per-error annotations are emitted
inline so the failure appears on the corresponding line in the PR diff.

Exit codes mirror `terso emit --check`:

- `0` — no drift, no missing sections.
- `1` — drift detected or required section missing.
- `2` — error (missing `AGENTS.md` with `fail-on-missing=true`, install
  failure, etc.).

## Why this exists

If your repo uses two or more AI coding agents, the per-agent config files
drift the day a contributor edits one and forgets the others. This action
catches that drift in PR review, before it ships.

It is intentionally tiny — there's no novel logic, just a thin wrapper around
`terso emit --check` plus a section linter. If you want to fork it, the entire
action is in a single `action.yml`.

## Demo

[Asciinema cast TBD] — a 20-second demo of the action firing on a PR that
edits `CLAUDE.md` without touching `AGENTS.md`.

## Releases

Tag releases as `v1.x.y` and also keep a moving `v1` tag pointing at the latest
v1.x.y. Consumers reference `@v1` in their workflows.

## License

MIT. See [LICENSE](LICENSE).
