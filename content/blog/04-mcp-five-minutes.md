---
title: "Three Terso tools over MCP — and the beta caveat"
date: 2026-06-04
slug: terso-mcp-three-tools
tags: [mcp, terso, claude-code, cursor]
status: published
note: "Surface B (mcp) is in beta as of v1.0 — production-ready in v1.1."
references:
  - https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
  - https://github.com/modelcontextprotocol/servers
---

Model Context Protocol felt experimental a year ago. By spring 2026 it
isn't: over 500 public servers, official SDKs in TypeScript, Python,
C#, Java, and Swift, first-party support from Anthropic, OpenAI, and
Google DeepMind. MCP v1.27 shipped this quarter; the 2026 roadmap is
about production-scale concerns (horizontal scaling, enterprise SSO,
audit trails, Task lifecycle) rather than the protocol itself.

The hard part isn't the protocol anymore. It's having something useful
to expose, and making the install one command.

That's what `terso mcp` is.

## What it exposes

Three tools, each one a thin wrapper around something agents have
wanted access to since they could call tools:

- `terso_get_context` — returns the current project's `AGENTS.md` plus
  any synced files in `.terso/generated/`. Works fully offline. Surface A.
- `terso_search` — searches your Omnus knowledge base from inside an
  agent session. Surface B, beta.
- `terso_capture` — sends a fragment from the session to Omnus.
  Surface B, beta.

Only `terso_get_context` is production-ready today. The other two work
against the Omnus development instance and graduate from beta in v1.1.

## Wire it up

Each client has its own config shape. `terso mcp install --client <name>`
prints the right one. Pick yours:

### Claude Code

```sh
terso mcp install --client claude
```

Paste the snippet into `.mcp.json` (project) or `~/.claude.json`
(user-wide). Restart Claude Code.

### Cursor

```sh
terso mcp install --client cursor
```

Snippet goes in `~/.cursor/mcp.json` or `.cursor/mcp.json`. Restart.

### Codex CLI

```sh
terso mcp install --client codex
```

Codex CLI uses TOML — the snippet is a `[mcp_servers.terso]` block for
`~/.codex/config.toml`.

## What's actually happening under the hood

`terso mcp` runs an MCP server over stdio. The agent client spawns it
on demand, talks JSON-RPC, and gets back tool definitions plus
tool-call results. The server identifies itself with the same version
string as `terso --version`, so you can tell at a glance which version
is wired up.

When the agent calls `terso_get_context`, the server reads `AGENTS.md`
and the files under `.terso/generated/` (synced from Omnus), and
returns them inline. The agent puts them in its working context for
the rest of the session.

## A note on trust

Local MCP servers run as you, with your filesystem and network access.
That's intentional — it's what makes them useful — but it changes the
threat model versus a sandboxed extension. Two practical defaults:

- Pin the version in your client's MCP config (`"args": ["mcp"]` with a
  globally-installed pinned `terso-cli@1` rather than `npx`-on-each-call).
- Don't put long-lived secrets in the same shell that runs the server.
  `terso` reads its Omnus token from `~/.terso/config.json` or the
  `TERSO_API_TOKEN` env var; either is fine, but make the choice
  consciously rather than by accident.

Prompt-injection risk on tool output applies here as much as anywhere
else: anything `terso_search` returns is untrusted text that ends up
in the model's context. Treat the returned snippets the way you'd
treat a third-party web page, not the way you'd treat your own commit
log.

## The beta line

In v1.0, `terso mcp` prints a `[beta v1.1]` notice on first invocation:

```
[beta] Surface B (Omnus-connected) is in beta. Production-ready in v1.1-omnus-connected.
```

Set `TERSO_SUPPRESS_BETA_NOTICE=1` to quiet it in scripted environments.
The notice goes away in v1.1, alongside the multi-tenant Omnus work.

## What you get from five minutes of setup

Adding a custom MCP server used to mean writing one. With `terso mcp`,
you type one command, paste a snippet, restart your client — and the
session has access to your repo's canonical `AGENTS.md` plus, if you've
signed into Omnus, search and capture against shared knowledge. No
protocol code, no per-client integration.

The protocol is solved. The plumbing now is, too.

> For where this is going next — what an MCP server needs to clear
> before it stops being a demo — see
> [*MCP after the honeymoon: designing for the Tasks primitive*](/blog/mcp-after-honeymoon/).
