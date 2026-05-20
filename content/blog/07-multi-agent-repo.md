---
title: "The multi-agent repo is already here"
date: 2026-06-25
slug: multi-agent-repo
tags: [ai-coding, agents-md, coordination]
status: published
references:
  - https://thenewstack.io/ai-coding-tool-stack/
  - https://duet.so/blog/claude-code-vs-cursor-vs-codex
---

Most discourse about AI coding tools is still framed as "which one do
you use?" The repos I look at in May 2026 don't read that way. They
have three agents working in them this week: Cursor Composer inside the
editor, Claude Code subagents handling a refactor, and a Codex
multi-day automation running a migration in the background. None of
them are "the" agent. They're three agents touching the same files,
operating from the same project rules — and sometimes operating from
slightly different versions of those rules, which is the whole problem.

## What changed

A short list of what's different versus a year ago:

- **Claude Code formalized subagents** on Opus 4.7. A primary agent
  can spawn workers that read the same `CLAUDE.md` and the same MCP
  tools.
- **Cursor Composer 2.5** (model release May 18) runs inside Cursor's
  Cloud Agents and the Build-in-Parallel orchestrator that already
  shipped earlier in the year.
- **Codex** runs multi-day automations — jobs that span sessions,
  resuming work hours or days later (across the Codex app + CLI).
- **GitHub Copilot's coding agent and Agent HQ** open PRs and run
  reviews against the same repos human developers do; they read the
  same instruction files the editor surface does.
- **Antigravity 2.0** (May 19) leaned hard into multi-agent: dynamic
  subagents, scheduled background tasks, a Go CLI, a public SDK.

The framing "Cursor, Claude Code, and Codex are merging into one AI
coding stack nobody planned" is right. The accidental convergence is on
*multiple agents per repo, reading the same files*.

## Why that amplifies small inconsistencies

When one agent reads your project rules in one session, drift between
`CLAUDE.md` and `.cursorrules` is a small annoyance. When five agents
read those files across a week — one in your editor, two in the cloud,
one in PR review, one running a multi-day automation — drift is the
delta that makes them disagree on what "done" looks like.

Three failure shapes that show up:

1. **The editor agent and the cloud agent run different tests.** The
   editor's `CLAUDE.md` says `npm test`. The cloud agent's snapshot of
   `.cursorrules` from three commits ago said `pnpm test`. The cloud
   agent's PR fails CI and the editor agent has to "fix" it.
2. **A long-running automation reads stale rules at resume time.**
   Codex's multi-day job pauses, the team fixes a convention in
   `AGENTS.md`, the per-agent file isn't re-emitted, the job resumes
   and produces code that violates the updated rule for the rest of
   its run.
3. **Code review and the coding agent argue with each other.** Copilot
   code review reads `.github/copilot-instructions.md`. The coding
   agent reads `AGENTS.md`. They diverged six weeks ago and now write
   contradictory comments on the same PR.

None of these are dramatic failures. They're the small, recurring
inconsistencies that add 20% friction to multi-agent workflows.

## The coordination layer

There's a layer here that has nothing to do with any specific agent —
it's about keeping the *inputs* the agents read consistent. That's a
different product surface than the agents themselves. The agents
compete; the rules they read shouldn't.

Three properties that matter:

- **One canonical source.** If `AGENTS.md` is the source and the other
  files are compiled output, you can't accidentally update one and
  forget the others. The "forget" stops being possible.
- **A drift gate before the rules go live.** `terso emit --check` in CI
  means a PR can't merge with divergent files. The agents that read
  those files on `main` are all reading the same version.
- **Ownership and invariants.** "Surface A must never import network
  code" or "All tests must run on Node 22" are the kind of rules that
  belong in the repo-root `AGENTS.md` with strong language — the
  agents will respect them if you say it once, in one place, and the
  CI gate keeps that place stable.

## What I tell teams adopting their second agent

A first agent in a repo doesn't surface the coordination problem; the
team adapts to whatever quirks that agent has. The second agent is
where the rules need to be canonical. Concretely:

1. **Treat the agent rules file as part of the spec.** If
   `AGENTS.md` lives in your repo, it's part of your spec, not a
   sidecar. Review changes to it like you review changes to the API.
2. **Compile, don't copy.** Per-agent files (`CLAUDE.md`,
   `.cursorrules`, `.github/copilot-instructions.md`) are compilation
   output. Hand-editing them is a smell.
3. **Gate divergence on PR, not nightly.** Multi-day automations make
   nightly checks awkward because they overlap with running jobs.
   Catch the divergence at the PR boundary.
4. **Assume the file is doing real work.** When something goes wrong
   in a multi-agent workflow, the fix is usually a missing sentence
   in `AGENTS.md`, not a complaint about the agent.

## What this is not

It's not a "the agents are wrong" post. The agents are fine. They
mostly do what they're told. The interesting failure mode in 2026 is
not "the agent made a bad choice" — it's "the agent made a good
choice based on a stale or contradictory spec, and three other agents
made different good choices based on slightly different stale specs."

The coordination layer is plumbing. The interesting agents sit on
top of it and compete for what they do best. Plumbing that holds
under load is what makes the competition above it possible.

If you have one agent in your repo today, you'll have two by autumn.
The cost of getting the rules layer right now is small. The cost of
not getting it right shows up as 20% drag, distributed across every PR.
