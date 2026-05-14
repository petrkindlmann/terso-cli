---
title: "AGENTS.md is the format AI coding agents actually agree on"
date: 2026-05-21
slug: agents-md-format
tags: [agents-md, ai-coding, specification]
status: draft
---

Every AI coding agent reads a different file:

| Agent | File it reads |
|---|---|
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursorrules` (or `.cursor/rules/*.mdc`) |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Codex CLI | `AGENTS.md` |
| Aider | Whatever you `--read` |
| Continue | A `systemMessage` in JSON config |

The first three are markdown files at the repo root. They differ in path, but
not in shape — each is a project-level instruction file for an AI assistant.
The content overlaps almost completely.

`AGENTS.md` is the format that emerged when teams started consolidating. It
has no governing body, no spec, no committee. It's a Schelling point: the
filename people picked when they wanted *one* canonical source.

## What AGENTS.md should contain

The convention I see most often:

1. **Project scope** — what this codebase does, two sentences.
2. **Architecture** — high-level packages, where logic lives, what to ignore.
3. **Conventions** — testing patterns, commit style, branching rules.
4. **Tools** — `pnpm` vs `npm`, formatter, linter, test runner.
5. **Don'ts** — things the agent should never do (skip tests, edit
   generated files, send telemetry, etc.).

If you want to go deeper, [the canonical AGENTS.md in our own repo][1] is a
representative example.

## Why a standalone spec hasn't (yet) happened

Standards by committee take years. The community has been doing the
practical thing — converging on a filename and an approximate structure —
without paperwork. Terso CLI's bet is that `terso emit` makes the format
*sticky* by reducing the cost of adopting it.

If you maintain one of those per-agent files, your incremental cost is high:
you have to edit several files in sync. If `AGENTS.md` is the source and
everything else is compiled output, the format wins by default.

## What about per-folder rules?

Cursor's newer `.cursor/rules/*.mdc` system supports folder-scoped rules.
That's outside the AGENTS.md convention today. Terso doesn't try to compete
with it — use both. AGENTS.md for repo-wide truths; folder rules for
context-specific ones.

## What you can do today

1. Move your `CLAUDE.md` contents to `AGENTS.md`.
2. Run `terso emit` to regenerate `CLAUDE.md` (and `.cursorrules`, and
   `copilot-instructions.md`) from that single source.
3. Gate it in CI with `terso emit --check`.
4. Commit. Move on.

[1]: https://github.com/petrkindlmann/terso-cli/blob/main/AGENTS.md
