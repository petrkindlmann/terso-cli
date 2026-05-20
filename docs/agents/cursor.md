# Cursor

> Last verified: 2026-05-20 against Cursor with Composer 2.5 (shipped May 18, 2026).

Cursor reads project rules from two places:

- **`.cursorrules`** at the repo root — single-file, repo-wide rules.
  `terso emit` writes this from your canonical `AGENTS.md`.
- **`.cursor/rules/*.mdc`** — newer per-folder rules system. Authored in
  place; **terso does not emit here** (per-folder rules are scoped by
  design and don't compile from a central source).

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init
terso emit --targets cursor
```

Cursor picks up `.cursorrules` on next request — no restart needed.

## When to use per-folder rules

Use `.cursor/rules/*.mdc` for rules that only apply inside a specific
package, framework boundary, or generated-code area. Examples that don't
belong in repo-wide `AGENTS.md`:

- Per-package conventions in a monorepo.
- Generated-code directories that should never be edited.
- Framework-specific guidance that only applies inside an `apps/web/`
  but not inside `apps/server/`.

Repo-wide truths still belong in `AGENTS.md`. The two systems compose.

## CI gate

```yaml
- run: npx terso-cli@1 emit --check --targets cursor
```

## MCP server *(beta — Omnus account required)*

```sh
terso mcp install --client cursor
```

Drop the snippet into `~/.cursor/mcp.json` or `.cursor/mcp.json`, then restart
Cursor.

## Composer 2.5 + Cursor Cloud Agents

Composer 2.5 (May 2026) reads the same `.cursorrules` and per-folder rules
the editor does. Cloud Agents, Build in Parallel, and Microsoft Teams
integration all inherit project rules from the same files — so the
`terso emit --check` gate covers them too.
