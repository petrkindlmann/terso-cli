# Claude Code

> Last verified: 2026-05-14 against Claude Code 1.x.

Claude Code reads project rules from `CLAUDE.md` at the repo root. `terso emit`
generates that file from your canonical `AGENTS.md`.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init       # if you don't already have AGENTS.md
terso emit       # writes CLAUDE.md
```

Commit `CLAUDE.md`. Claude Code picks it up automatically — no config change.

## CI gate

```yaml
- run: npx terso-cli emit --check --targets claude
```

## MCP server *(beta — Omnus account required)*

Expose project context to in-session searches:

```sh
terso mcp install --client claude
```

Paste the printed snippet into `.mcp.json` (project) or `~/.claude.json` (user),
then restart Claude Code.

## Session observer *(beta)*

```sh
terso install-hook --client claude
```

Wires the Omnus session observer into `~/.claude/settings.json` so summarized
sessions flow into your Omnus knowledge base.
