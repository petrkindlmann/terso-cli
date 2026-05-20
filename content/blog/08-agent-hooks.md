---
title: "Agent hooks are the new shell profile"
date: 2026-07-02
slug: agent-hooks
tags: [hooks, claude-code, install-hook, observability]
status: published
note: "install-hook is Surface A; the Omnus session observer it installs is beta (v1.1 GA)."
---

A `.bashrc` or `.zshrc` is a place where decades of shells let you
attach behavior to the lifecycle of a session: things that happen at
start, before commands, after commands, on exit. That model worked
because the surfaces — start, prompt, command, exit — were small,
predictable, and inspectable.

Agent runtimes are growing the same surfaces. Claude Code's hook
system, Cursor's session events, Codex's run lifecycle, and
Antigravity 2.0's JSON-shaped hooks (May 19, 2026) — they're all
converging on the same shape: "tell me when a session starts, when
a tool runs, when work changes the repo, when the session ends, and
let me run something."

That isn't a convenience anymore. It's a shared platform that
agents from three different vendors expose.

## What static instructions can't do

`AGENTS.md` is read by the agent at session start (or, in the
long-running case, at resume). It tells the agent *what to do*. It
can't tell the agent's environment *when something happens*.

Examples of things that don't fit in a markdown rules file:

- "When this session ends, ship a summary to our knowledge base."
- "Before this agent runs a tool that writes to the filesystem, log
  which tool."
- "When work is paused for review, snapshot the working tree."
- "If the session edits files outside `/services/billing/`, page
  the on-call."

Each one is observation, side effect, or guardrail. Static rules
can't carry those. Hooks can.

## What `terso install-hook` actually wires

The first hook Terso ships is small on purpose:

```sh
terso install-hook --client claude
```

That writes a `SessionEnd` handler into your Claude Code settings —
`~/.claude/settings.json` by default — pointing at the bundled
`omnus-session-observer.sh`. When a Claude Code session ends, the
observer reads the transcript and forwards a summary to your Omnus
knowledge base.

The pieces are deliberately separate:

- **`install-hook`** is Surface A. Offline. No Omnus account needed
  to install it; the wiring is a JSON edit.
- **`omnus-session-observer.sh`** is the observer itself. It runs at
  session end, in the background so it never blocks your session exit.
- **Omnus** is the destination. It's where the summaries land, and
  it's the only piece that needs auth.

Each piece is inspectable. The hook is text. The observer is a
54-line bash script. The forwarding is plain HTTP.

## Trust model

Hooks change the threat model versus pure rules files. A markdown
file is read by an agent that's already running; a hook is code that
runs in your environment, triggered by an editor you didn't write.
The distinction matters.

Two practical defaults:

1. **Keep the surfaces small.** A hook should do one observable thing,
   not five. Terso's observer summarizes a transcript and sends a POST.
   It doesn't fetch anything new, doesn't modify the repo, doesn't
   stash secrets.
2. **Keep the runtime hook separate from the rules-compilation step.**
   Surface A (compiling rules files) and the runtime hook are different
   products with different invariants. Mixing them — having the rules
   file trigger network behavior — is the smell.

## Long-running agents make the surfaces matter more

Claude Code's subagents and Codex's multi-day automations turned
agent runs into things with shape: phases, pauses, resumptions. A
single-prompt chat doesn't need lifecycle hooks; an hour-long
parallel-tool job does.

Three places hooks earn their weight:

- **Capture at the right moment.** A short interaction's summary is
  the whole transcript. A multi-hour session's summary is the
  decisions made and the files touched. The latter needs an
  `at-end-of-phase` event, not a `dump-the-transcript` blob.
- **Guardrails that don't bloat rules.** A "before any tool that
  writes outside `/docs/`" hook can enforce a constraint that would
  take three paragraphs of `AGENTS.md` to communicate clearly.
- **Recovery from crashes.** If the agent's process dies mid-job, the
  hook can be where the recovery state is, not the agent's memory.

## What's coming

Hook standards across agents are not converged yet. Claude Code's
schema is JSON in `settings.json`; Cursor's is event-driven via the
extension API; Codex publishes events on its CLI run lifecycle. The
shapes are similar — start, tool-pre, tool-post, end — but they're
not interchangeable.

Expect that to converge alongside MCP's 2026 roadmap items
(`.well-known` metadata, the Tasks primitive). When agent runtimes
expose a standard lifecycle alongside a standard transport, hooks
stop being editor-specific and become portable. Today's hooks are
useful but vendor-specific; portable hooks are the obvious next step.

## Try it

```sh
npm install -g terso-cli
terso install-hook --client claude --dry-run
```

`--dry-run` prints what would change without writing. Read the
diff before installing. That's the entire trust model: small surface,
explicit installation, inspectable behavior. Future hooks land
behind the same pattern.
