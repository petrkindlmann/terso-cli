# Claude Code

> Last verified: 2026-05-20 against Claude Code on Opus 4.7.

Claude Code reads project rules from `CLAUDE.md` at the repo root (plus
subdirectory `CLAUDE.md` files, which take precedence within their path).
`terso emit` generates the root file from your canonical `AGENTS.md`.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init       # if you don't already have AGENTS.md
terso emit       # writes CLAUDE.md
```

Commit `CLAUDE.md`. Claude Code picks it up automatically — no config change.
Subdirectory rules stay hand-authored; terso doesn't compile to nested paths
by design.

## Subagents

As of Opus 4.7, Claude Code formalized subagents — short-lived workers that
can read the same project rules. They use the same `CLAUDE.md` Claude Code
reads, so emitting once covers both the primary agent and any spawned
subagents in the same session.

## CI gate

```sh
- run: npx terso-cli@1 emit --check --targets claude
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
sessions flow into your Omnus knowledge base. Idempotent — re-running is a
no-op when the hook is already installed.
