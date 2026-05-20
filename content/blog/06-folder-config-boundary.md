---
title: "The next config boundary is the folder, not the repo"
date: 2026-06-18
slug: folder-config-boundary
tags: [agents-md, cursor, copilot, monorepo]
status: draft
references:
  - https://cursor.com/docs (.cursor/rules/*.mdc)
  - https://docs.github.com/en/copilot ( .github/instructions/*.instructions.md)
  - https://github.com/agentsmd/agents.md/issues/135
---

Repo-root agent instructions used to be the new thing. In May 2026
they're routine. `AGENTS.md` at the root is widely read — Codex
natively, Copilot since August 2025, Cursor, Jules, and most newer
clients — and Claude Code imports it on top of its own `CLAUDE.md`.
The question that's still open is one level down: what do you tell an
agent editing inside `apps/billing/` that you don't want to tell the
agent editing inside `apps/marketing/`?

Two answers shipped this year:

- **Cursor**: `.cursor/rules/*.mdc` — Markdown-with-frontmatter files
  scoped to globs.
- **Copilot**: `.github/instructions/*.instructions.md` — same idea, same
  shape, different path. Each file declares an `applyTo:` glob.

Both are explicitly *not* a replacement for the repo-root file. They
compose with it. The agent sees the repo-wide rules, plus whichever
folder-scoped rules apply to the path it's currently touching.

## Why the repo-level model breaks down

Three places it fails first:

1. **Monorepos with mixed stacks.** "Use pnpm" is true at the repo root
   and false inside a Python service. "Run tests with `vitest`" is true
   in the TypeScript packages and irrelevant in the Go binary.
2. **Generated-code directories.** `AGENTS.md` says "don't edit generated
   files." A folder-scoped rule inside the generated tree says "never
   edit anything here, hand humans back the source."
3. **Risk boundaries.** The auth service has a different code-review bar
   than the docs site. Telling the agent that fact at the repo root
   makes the repo-root file longer; scoping it to `services/auth/`
   makes it correct.

Each one is the same pattern: a rule that's true *here* and not *there*.
The repo-root file is a wrong-by-default place to put it.

Both Cursor and Copilot already handle nested precedence: a
`.cursor/rules/*.mdc` inside `services/auth/` overrides a same-name
rule at the repo root, and Copilot uses the nearest `AGENTS.md` or
`*.instructions.md` to the path being touched. The agents already
think in terms of folder scope. The question is whether your repo's
authoring conventions do.

## How the new scoping primitives compare

| | Cursor | Copilot |
|---|---|---|
| Path | `.cursor/rules/*.mdc` | `.github/instructions/*.instructions.md` |
| Format | Markdown body + frontmatter | Same |
| Scope key | `globs:` (in frontmatter) | `applyTo:` (in frontmatter) |
| Activation | Cursor matches the file against the buffer/path being edited | Copilot matches against the path the suggestion applies to |
| Composability with `AGENTS.md` | Additive — repo-wide rules still apply | Additive — same |

The two systems are siblings: similar in spirit, different paths and
different glob syntax. Claude Code's nested `CLAUDE.md` is a third
sibling — same logical model, plain filesystem scoping.

## What this means for tools that compile config files

`terso emit` deliberately doesn't emit into the folder-scoped paths. The
reason is in the model: per-folder rules are *authored in place*, not
compiled from a central source. Compiling them would invert the
ownership — the team that owns `services/auth/` would need to edit a
central `AGENTS.md` to change their service's local guidance, even
though no one outside `services/auth/` cares.

What `terso` does instead:

- Keep repo-root rules in `AGENTS.md`. Compile to `CLAUDE.md`,
  `.cursorrules`, `.github/copilot-instructions.md`. Gate drift in CI.
- Leave `.cursor/rules/`, `.github/instructions/`, and subdirectory
  `CLAUDE.md` files alone. The teams who own those paths own their
  rules.

The CI gate is still useful — but it's a gate on the *root* contract,
not the scoped ones. Folder rules can drift inside their folder, and
that's fine: they're scoped to the people who care.

## A migration shape that works

If your repo has accumulated a 400-line `AGENTS.md`, much of it is
probably folder-scoped guidance hiding in a repo-wide file. The split
that works:

1. **Stays in `AGENTS.md`**: project scope, top-level architecture,
   testing conventions that apply everywhere, "don'ts" that span the
   whole repo, tool choices.
2. **Moves to `.cursor/rules/<area>.mdc` + `.github/instructions/<area>.instructions.md`**:
   per-service guidance, per-language conventions, generated-code
   warnings.
3. **Moves to subdirectory `CLAUDE.md`** (if you use Claude Code):
   the same guidance, in the directory it applies to.

Re-emit. Commit. The PR diff is the right teaching moment to point at
in the next standup.

## The forward bet

The Agentic AI Foundation's v1.1 proposal (issue #135) focuses on
**discovery, layering, and progressive disclosure** — exactly the
problems folder-scoped rules raise. Expect a converged answer for how
`AGENTS.md` and per-folder rules layer formally, with predictable
inheritance and override semantics, in the next twelve months.

Until then: keep the root file slim, push the local rules into the
folders, and let the agent's path resolve the rest. Repo-wide and
folder-wide rules are two different products, not two configurations
of the same one.
