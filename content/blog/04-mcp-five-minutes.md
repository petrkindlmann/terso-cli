---
title: "MCP servers don't have to be complicated: `terso mcp` in 5 minutes"
date: 2026-06-04
slug: mcp-five-minutes
tags: [mcp, terso, claude-code, cursor]
status: draft
note: "Surface B (mcp) is in beta as of v1.0 — production-ready in v1.1."
---

Model Context Protocol (MCP) is the way to give a coding agent access to your
project's knowledge without a per-client integration. The hard part isn't the
protocol — it's having something useful to expose.

`terso mcp` exposes three tools, each one a thin wrapper around something
agents have always wanted access to:

- `terso_get_context` — returns the current project's `AGENTS.md` plus any
  synced knowledge files in `.terso/generated/`. Works offline.
- `terso_search` — searches your Omnus knowledge base from inside an agent
  session.
- `terso_capture` — sends a fragment to Omnus from inside the session.

## Wire it up in Claude Code

```sh
terso mcp install --client claude
```

That prints a snippet. Paste it into `.mcp.json` (project) or `~/.claude.json`
(user), restart Claude Code, and the three tools are available next session.

## Wire it up in Cursor

```sh
terso mcp install --client cursor
```

Drop the snippet into `~/.cursor/mcp.json` and restart.

## Wire it up in Codex CLI

```sh
terso mcp install --client codex
```

Codex CLI uses TOML — the snippet is in TOML form too.

## What's actually happening

`terso mcp` runs an MCP server over stdio. The agent client spawns it on
demand, talks JSON-RPC, and gets back tool definitions plus tool-call
results. The server identifies itself with the same version string as
`terso --version`, so you can tell at a glance which version is wired up.

When the agent calls `terso_get_context`, the server reads `AGENTS.md` and the
files under `.terso/generated/` (synced from Omnus), and returns them inline.
The agent puts them in its working context for the rest of the conversation.

## Beta caveat

In v1.0, `terso mcp` prints a `[beta v1.1]` notice on first invocation. Surface
B (the Omnus-connected commands) is production-ready in v1.1. The
`terso_get_context` tool is fully offline-capable and works today; the search
and capture tools assume you're signed into Omnus.

Set `TERSO_SUPPRESS_BETA_NOTICE=1` to quiet the notice in scripted environments.

## Why this matters

Adding a custom MCP server used to mean writing one. With `terso mcp`, you
type one command, paste a snippet, and your AI assistant gets a useful set
of tools — without writing protocol code.
