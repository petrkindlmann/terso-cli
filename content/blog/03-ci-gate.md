---
title: "How to gate AI agent configs in CI with `terso emit --check`"
date: 2026-05-28
slug: ci-gate
tags: [ci, terso, agents-md]
status: draft
---

If two contributors edit `CLAUDE.md` and `.cursorrules` separately,
divergence is guaranteed. Reviewers don't catch it — both diffs look
reasonable on their own. By the time anyone notices, the per-agent files
each say something slightly different about how the repo wants to be
worked on.

The fix is a CI gate. Here's the smallest one that does the job:

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
      - run: npx terso-cli@1 emit --check
```

The `@1` matters: it pins your CI to the v1 line so a future major
release doesn't change exit-code semantics under you. Bump it when
you're ready to.

A red `emit-check` job means a contributor edited a per-agent file
without updating `AGENTS.md`. The fix is one of:

- Move the edit to `AGENTS.md` and re-run `terso emit` locally, or
- Revert the per-agent edit and re-emit.

## Why this matters in 2026

A lot more than humans read those files now. GitHub Copilot's code-review
mode and coding agent both consume the same repo-instruction files when
they review a PR or open one. Cursor's background agents and Claude
Code's subagents likewise pick up whichever of `CLAUDE.md` /
`.cursorrules` / Copilot instructions is in front of them. If those
files have diverged, your machine reviewers and your human reviewers
are working from different specs.

## Exit codes

`terso emit --check` returns three distinct codes so CI can branch:

- `0` — clean.
- `1` — divergence: some file would change if `terso emit` ran.
- `2` — error: `AGENTS.md` missing, unknown target, write blocked.

Most workflows just need "fail on non-zero." But if you want to file a
Linear issue on `2` (real broken state) while letting `1` block the PR
(normal review conversation), the granularity is there.

## Using the action instead

If the raw bash is too low-level, there's an action that wraps it:

```yaml
- uses: petrkindlmann/agents-md-action@v1
  with:
    require-sections: 'Project rules,Testing'
```

That adds a section linter on top — the action fails the build if
`AGENTS.md` is missing required H2 sections. Useful when you want a
checklist encoded in CI rather than in code review.

## Do I need a nightly run?

Usually no. The PR gate is enough for most teams.

Add a scheduled check only if your default branch changes outside the
PR path — for example, if you allow direct pushes to `main`, or if a
release process rewrites files post-merge:

```yaml
on:
  schedule:
    - cron: '0 6 * * *'
```

## What about pre-commit?

You can:

```sh
# .git/hooks/pre-commit
#!/usr/bin/env bash
npx terso-cli emit --check
```

But pre-commit hooks tend to be local-only and skip-able. CI is the
place to gate divergence authoritatively. Use pre-commit for fast
feedback, not as a substitute.

## Coordination problem, coordination tool

Divergence between four files looks like a tooling problem but acts
like a coordination problem. CI is where teams already coordinate, so
that's where the check belongs — one job, three exit codes, the same
answer for humans and the agents now reviewing alongside them.
