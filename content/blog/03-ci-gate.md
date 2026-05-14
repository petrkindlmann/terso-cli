---
title: "How to gate AI agent configs in CI with `terso emit --check`"
date: 2026-05-28
slug: ci-gate
tags: [ci, terso, agents-md]
status: draft
---

If two contributors edit `CLAUDE.md` and `.cursorrules` separately, drift is
guaranteed. Reviewers can't catch it — both diffs look reasonable in isolation.

The fix is a CI gate. Here's the smallest possible one:

```yaml
# .github/workflows/agents.yml
name: AGENTS.md
on: [push, pull_request]

jobs:
  emit-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npx terso-cli emit --check
```

A red `emit-check` job means a contributor edited a per-agent file without
updating `AGENTS.md`. The fix is one of:

- Move the edit to `AGENTS.md` and re-run `terso emit` locally.
- Revert the per-agent edit.

## Exit codes

`terso emit --check` returns three distinct exit codes so your CI can branch:

- `0` — clean.
- `1` — drift: some file would change if `terso emit` ran.
- `2` — error: `AGENTS.md` missing, unknown target, write blocked.

Most workflows just need to fail on any non-zero, but if you want to distinguish
drift from real errors (for example, to file a Linear issue on `2` but not `1`),
the granularity is there.

## Using the action instead

If the bash above is too low-level, there's an action that wraps it:

```yaml
- uses: petrkindlmann/agents-md-action@v1
  with:
    require-sections: 'Project rules,Testing'
```

That adds a section linter on top — the action fails the build if `AGENTS.md`
is missing required H2 sections you list. Handy when you want a checklist
encoded in CI rather than in code review.

## Running on a schedule

Drift can creep in even without PRs (rebases, force pushes). Add a nightly:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'
```

Same job, same exit codes, fires whether or not anyone pushed.

## What about pre-commit?

You can:

```sh
# .git/hooks/pre-commit
#!/usr/bin/env bash
npx terso-cli emit --check
```

But pre-commit hooks tend to be local-only and skip-able. CI is the place to
gate drift authoritatively. Use a pre-commit if you want the fast feedback,
but don't substitute it for the CI check.

## The point

Drift is a coordination problem. CI is where teams already coordinate. So that's
where the gate goes.
