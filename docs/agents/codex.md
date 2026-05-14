# Codex CLI

> Last verified: 2026-05-14 against Codex CLI 0.x.

Codex CLI reads agent instructions from `AGENTS.md` directly — the format
terso uses as its canonical source. No emit needed for Codex itself.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init       # scaffolds AGENTS.md
```

That's it. Codex CLI uses `AGENTS.md` natively.

## MCP server *(beta — Omnus account required)*

```sh
terso mcp install --client codex
```

Add the printed TOML block to `~/.codex/config.toml` under `[mcp_servers.terso]`.

## Why is this guide short?

Codex CLI agreed with AGENTS.md from day one — that's the format `terso`
chose to be canonical. The whole point of terso is to make every *other* agent
behave like Codex CLI already does.
