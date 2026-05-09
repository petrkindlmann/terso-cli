# terso

One source of truth for AI agent instructions, in every project.

`terso emit` compiles a single `AGENTS.md` into the config files each AI coding
agent expects — `CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` —
so you maintain one file instead of three.

```
AGENTS.md  →  CLAUDE.md
            →  .cursorrules
            →  .github/copilot-instructions.md
```

## Install

```sh
npm install -g terso-cli
```

## Quick start

```sh
# In your project root
terso emit
```

If `AGENTS.md` doesn't exist yet, run `terso init` first to scaffold a template.

## How it works

1. You write project rules once in `AGENTS.md`.
2. `terso emit` writes them out to whichever per-agent files your repo uses.
3. Each emitted file starts with a marker comment so re-running `emit` is safe
   and won't clobber files you maintain by hand.

By default, `emit` only writes to targets that look active in your repo
(detected via presence of `.cursor/`, `CLAUDE.md`, `.github/`, etc.). On a
fresh repo with no hints, it writes all three so you can pick what to keep.

## Commands

### `terso emit`

Compile `AGENTS.md` into per-agent configs at the project root.

| Flag | Behavior |
|---|---|
| `--targets <list>` | Comma-separated subset: `claude`, `cursor`, `copilot` |
| `--check` | Exit non-zero if any file would change. Use in CI. |
| `--dry-run` | Show what would change without writing |
| `--force` | Overwrite files even if not marked as terso-generated |
| `--watch` | Re-emit on every save of `AGENTS.md` |

### CI gate example

```yaml
# .github/workflows/agents.yml
- run: npx terso-cli emit --check
```

This fails the build if anyone hand-edits `CLAUDE.md` or `.cursorrules`
without updating the canonical `AGENTS.md`.

### `terso mcp`

Run an MCP server that exposes project context to any agent client. Three tools:

- `terso_get_context` — returns `AGENTS.md` + any synced files in `.terso/generated/`. Works offline.
- `terso_search` — search project knowledge in [Omnus](https://omnus.dev). Requires auth.
- `terso_capture` — send a knowledge fragment to Omnus. Requires auth.

Print install snippets for popular clients:

```sh
terso mcp install --client claude
terso mcp install --client cursor
terso mcp install --client codex
```

Example for Claude Code (drop into `.mcp.json` or `~/.claude.json`):

```json
{
  "mcpServers": {
    "terso": { "command": "terso", "args": ["mcp"] }
  }
}
```

### Other commands

`terso` also includes commands for syncing project knowledge with the [Omnus](https://omnus.dev)
service (`init`, `auth`, `sync`, `watch`, `capture`, `search`, `compile`,
`status`, `doctor`). The `emit` command works without Omnus — it's pure local
file compilation.

## Why

Most teams using AI coding agents end up maintaining the same project rules
in 3–4 places: `.cursorrules` for Cursor, `CLAUDE.md` for Claude Code,
`.github/copilot-instructions.md` for Copilot, often `AGENTS.md` too. They
drift. People update one and forget the others. Reviewers can't tell which
file is canonical.

`terso emit` makes one of them canonical — `AGENTS.md`, the format with the
broadest cross-tool acceptance — and treats the rest as compilation output.

## License

MIT
