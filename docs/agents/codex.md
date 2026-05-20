# Codex CLI

> Last verified: 2026-05-20 against Codex CLI with multi-day automations.

Codex CLI reads agent instructions from `AGENTS.md` directly — the format
terso uses as its canonical source. No emit needed for Codex itself.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init       # scaffolds AGENTS.md
```

That's it. Codex CLI uses `AGENTS.md` natively.

## Multi-day automations

Codex's 2026 headline feature is jobs that span hours or days, picking
back up across sessions. Those long-running runs read `AGENTS.md` each
time they resume, so keeping it accurate is the difference between
"agent did the right thing for three days" and "agent assumed the wrong
test runner on day two." `terso emit --check` in CI catches the kind of
silent drift that would otherwise compound across resumptions.

## MCP server *(beta — Omnus account required)*

```sh
terso mcp install --client codex
```

Add the printed TOML block to `~/.codex/config.toml` under `[mcp_servers.terso]`.

## Why is this guide short?

Codex CLI agreed with AGENTS.md from day one. The Agentic AI Foundation
(Linux Foundation) now stewards the format, and most major clients —
Copilot, Cursor, Jules, Factory, Amp, Windsurf, Zed — followed.
Terso's value isn't convincing Codex to read `AGENTS.md`; it's getting
every *other* per-agent file in your repo to agree with it.
