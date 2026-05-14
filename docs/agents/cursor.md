# Cursor

> Last verified: 2026-05-14 against Cursor 0.40+.

Cursor reads project rules from `.cursorrules` at the repo root (or
`.cursor/rules/` for the newer rules system). `terso emit` writes
`.cursorrules` from your canonical `AGENTS.md`.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init
terso emit --targets cursor
```

Cursor picks up `.cursorrules` on next request — no restart needed.

## CI gate

```yaml
- run: npx terso-cli emit --check --targets cursor
```

## MCP server *(beta — Omnus account required)*

```sh
terso mcp install --client cursor
```

Drop the snippet into `~/.cursor/mcp.json` or `.cursor/mcp.json`, then restart
Cursor.

## Tip

Cursor also supports a per-folder rules system (`.cursor/rules/*.mdc`). Today
terso emits a single `.cursorrules` file. If you need per-folder rules, hand-roll
them in `.cursor/rules/` alongside your canonical `AGENTS.md`.
