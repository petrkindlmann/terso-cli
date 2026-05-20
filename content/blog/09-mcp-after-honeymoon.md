---
title: "MCP after the honeymoon: designing for the Tasks primitive"
date: 2026-07-09
slug: mcp-after-honeymoon
tags: [mcp, terso, tasks, production]
status: published
note: "Surface B is beta in v1.0 — production-ready in v1.1-omnus-connected. This post sketches the v1.1 direction."
references:
  - https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/
  - https://thenewstack.io/model-context-protocol-roadmap-2026/
---

The five-minute MCP demo is a year-old story. Spin up a server, expose
a tool, agent calls it, response renders inline. That worked. It got
the ecosystem to thousands of public servers in 2025-2026. The next
problem is harder.

MCP's 2026 roadmap names it: production scale (horizontal scaling,
enterprise SSO, audit trails), governance maturation, and **the Tasks
primitive** (currently experimental, tracked as SEP-1686) — a
call-now / fetch-later pattern for work that doesn't finish in one
tool call. The roadmap's own framing is right: stateful sessions fight
load balancers, and "tool call succeeds" stops being a useful success
signal once your agent is doing work that lasts longer than a chat
turn.

This post is about what that changes for an MCP server that wants to
be more than a demo — specifically Terso's Surface B, and what v1.1
needs to look like to survive the move from beta. The Tasks primitive
itself is still moving; the sketch below assumes the shape of SEP-1686
and will need revision as the spec settles.

## What changes when work outlives a prompt

A short tool call has one success condition: it returns the right
thing. A Task has several:

- **Did the work start?** Tool-call returns a Task ID, not a result.
- **Where is it now?** Some endpoint reports progress, status,
  intermediate output.
- **Did it finish?** A separate fetch returns the final result, or an
  error, or a partial result if the work was cancelled.
- **What happens if the client disconnects?** The Task continues. The
  next client (or the same client on resume) needs to find it again.
- **What happens if the server restarts?** State has to survive
  process boundaries — which means it isn't in process memory.
- **Who can fetch the result?** Authorization on Task lookup needs to
  be at least as strong as the authorization on Task creation.

None of those are protocol problems. They're product problems an MCP
server has to answer if its tools do useful work. The protocol
gestures at them with the Tasks primitive; the *server* has to
implement them.

## Three Terso tools, three different shapes

`terso mcp` exposes three tools today:

- `terso_get_context` — synchronous, fast, idempotent. Returns
  `AGENTS.md` and synced files. Stays a regular tool call; no Task
  shape needed.
- `terso_search` — semi-synchronous today, async-eligible. A search
  over a large knowledge base might be fast enough to inline, or
  slow enough to want a Task pattern. The boundary is honesty about
  P99, not P50.
- `terso_capture` — already partially async (offline-queued today).
  This is the obvious Task candidate. "Send this fragment to the
  knowledge base for processing" is exactly the shape of a Task —
  the *acknowledgement* is fast, the *processing* takes seconds.

The lesson: not every MCP tool wants to be a Task. The ones that
*are* Tasks should be honest about it, and the ones that aren't
should stay simple.

## What Surface B v1.1 has to clear

Concrete checklist that v1.1 has to clear before the `[beta v1.1]`
notice comes off:

- **Authentication on Task fetch.** Today's beta uses a single API
  token in `~/.terso/config.json`. v1.1 needs per-Task scoping so a
  long-lived Task can't be enumerated by a shorter-lived token.
- **Retry semantics that the server documents and the client
  respects.** MCP's 2026 roadmap calls out retry/expiry as gaps;
  Surface B has to pick a policy and document it. "Tasks expire 24h
  after creation; retries are idempotent; results are cached for
  the expiry window" is a defensible starter.
- **Audit trail.** Every capture, search, and Task creation gets
  logged with project ID, user ID, and timestamp. Enterprise SSO
  doesn't mean much without it.
- **A `.well-known` document.** MCP's `well-known` metadata format
  (on the 2026 roadmap) lets a registry or crawler learn what a
  server does without connecting. Terso publishes one as soon as the
  format ships.
- **Horizontal scaling without sticky sessions.** Task state lives
  in Postgres (Omnus already runs it), not in the MCP server's
  process memory. Any instance of the server can serve any Task.

## What's not in v1.1

A short anti-list, for honesty:

- **An ecosystem of third-party MCP tools.** That's not Terso's
  job. The 500+ public servers cover most needs. Terso's three
  tools are the ones that benefit from being run *as* Terso (they
  share the same auth, the same project ID, the same offline
  queue).
- **A full background-job runtime.** Tasks are bounded work, not
  arbitrary long-running compute. If you want to run an hour-long
  migration in the agent context, that's Codex's multi-day
  automations or Claude Code's subagents — not Terso's MCP tools.
- **A replacement for the offline queue.** `terso capture` works
  offline, queues locally, and flushes on next `terso sync`. The
  Tasks-over-MCP path is an *addition* for the in-session use case,
  not a replacement.

## Framing for v1.1

The pitch isn't "Terso is an MCP server." It's "Terso is the
in-session interface to your project's knowledge base, and MCP is
the transport." That distinction matters because it controls scope.
The MCP server is plumbing. The product is Omnus + the three tools.
What the v1.1 work has to do is make the plumbing carry production
weight — so the *product* feels reliable.

## What to watch

If you're building an MCP server in 2026 and you haven't already,
the three sources to track:

- [MCP 2026 roadmap](https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
  — the steering committee's priorities for the next year.
- [`modelcontextprotocol/servers`](https://github.com/modelcontextprotocol/servers)
  — the registry where production patterns are visible.
- The first server in your sector that ships SSO + audit trail
  without saying anything about it — that's the floor for what
  enterprise buyers will expect within twelve months.
