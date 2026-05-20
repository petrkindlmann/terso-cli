---
title: "What agent configs should compile to in 2026"
date: 2026-07-16
slug: what-configs-compile-to
tags: [agents-md, reference, comparison]
status: draft
references:
  - https://agents.md/
  - https://developers.openai.com/codex/guides/agents-md
  - https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
---

If you're picking which per-agent files to emit from `AGENTS.md`, this
is the rubric for May 2026: **emit to legacy single-file targets,
leave per-folder systems alone, and treat native `AGENTS.md` support
as the absence of an emit target rather than a different one.**

The rest of this post explains why, with the current-agent table and
the per-target decisions Terso ships with as defaults.

## The four shapes of agent config in 2026

Every popular agent today reads one of four shapes:

1. **Native `AGENTS.md`** — the agent looks at the root file directly.
   No emit target needed.
2. **Root-level single file** — the agent reads one specific file at a
   specific path (`CLAUDE.md`, `.cursorrules`,
   `.github/copilot-instructions.md`). Emit target candidate.
3. **Per-path glob rules** — the agent reads a directory of small
   files, each scoped to a glob. **Not** an emit target — these are
   authored where they apply.
4. **Embedded in client config** — the agent reads instructions from a
   field inside its config JSON/TOML (`systemMessage`, `mcp_servers`,
   etc.). Not really compilable; refer the user at `AGENTS.md` from
   inside the config.

## Today's agents, mapped to shapes

| Agent | Native AGENTS.md? | Root single file | Per-path rules | Embedded |
|---|---|---|---|---|
| OpenAI Codex CLI | ✅ primary | — | — | — |
| GitHub Copilot | ✅ (since Aug 2025) | `.github/copilot-instructions.md` | `.github/instructions/*.instructions.md` | — |
| Cursor | ✅ | `.cursorrules` | `.cursor/rules/*.mdc` | — |
| Claude Code | imports | `CLAUDE.md` (root + subdirs) | subdirectory `CLAUDE.md` files | — |
| Google Jules / Gemini | ✅ | — | — | — |
| Factory / Amp / Windsurf | ✅ | — | — | — |
| Zed | ✅ | — | — | — |
| Aider | reads via `--read` | any markdown file you point at | — | — |
| Continue | — | — | — | `systemMessage` in `.continue/config.json` |

(RooCode shut down its agent product on May 15, 2026 and is no longer
on the list. The table will keep shifting; the rubric below is the
durable part.)

Two observations from the table:

- **Most new agents only support native `AGENTS.md`.** Factory, Amp,
  Windsurf, Zed, Jules — for these, there's nothing to emit. Your
  `AGENTS.md` is the input.
- **The agents with the largest installed base support the legacy
  root-level file too.** Copilot, Cursor, Claude Code. That's where the
  emit work pays off — installed bases that already have hand-edited
  files.

## The compile rubric

For each agent your team uses, ask three questions:

1. **Does it read `AGENTS.md` natively?** If yes and there's no legacy
   file in your repo, you're done. Don't add an emit target.
2. **Does the repo already have the agent's legacy single-file
   instructions?** If yes, emit to it. The contributors who edit that
   file expect it to be there; ripping it out before native support is
   universal is a regression.
3. **Does the agent have per-path rules you want to use?** Author them
   in place. Don't compile.

Applied to terso-cli's defaults:

| Target | Emit by default | Reason |
|---|---|---|
| `CLAUDE.md` | ✅ | Claude Code has Opus 4.7 subagents; legacy single-file is widely deployed. |
| `.cursorrules` | ✅ | Cursor reads it; many repos rely on it for Composer + Cloud Agents. |
| `.github/copilot-instructions.md` | ✅ | Copilot code review + coding agent consume it. |
| `.cursor/rules/*.mdc` | ❌ | Authored in place. |
| `.github/instructions/*.instructions.md` | ❌ | Authored in place. |
| Subdirectory `CLAUDE.md` | ❌ | Authored in place. |
| Continue `config.json` | ❌ | Reference `AGENTS.md` from inside the config; don't generate JSON. |
| Aider | ❌ | Use `--read AGENTS.md` in your `.aider.conf.yml`. |

## What gets lost when you hand-maintain instead

Three concrete failure modes the "compile" model removes:

1. **The reviewer can't tell which file is canonical.** When `CLAUDE.md`,
   `.cursorrules`, and `.github/copilot-instructions.md` all have hand
   edits, code review can't trust any of them. With one source and a
   marker comment, the canonical file is unambiguous.
2. **PRs that change rules don't fail on inconsistency.** A contributor
   edits `.cursorrules`, doesn't touch the others. CI doesn't catch
   it. Three months later, the team realizes Cursor and Claude Code
   have been working from different specs. `emit --check` would have
   flagged the PR.
3. **Adding a new agent costs nothing.** When `AGENTS.md` is the
   source, supporting a new client is either "the client reads
   `AGENTS.md` natively, done" or "the client reads a legacy file,
   add an emit target." Either way, you don't rewrite content; you
   add a renderer.

## What about per-folder rules?

They compose with `AGENTS.md`. Repo-wide truths stay in the root file
and get compiled; folder-scoped guidance lives in `.cursor/rules/`,
`.github/instructions/`, or subdirectory `CLAUDE.md` files and is
authored where it applies. Compile what's central; keep local rules
local.

(For the longer argument, see
[*the next config boundary is the folder, not the repo*](/blog/folder-config-boundary/).)

## A short forward bet

The Agentic AI Foundation's `AGENTS.md` v1.1 proposal is converging on
formal layering + discovery semantics. When that lands, the
compile-vs-author boundary may move — for example, a future spec
revision might bless a "canonical scoped rules" file format that
*would* compile. Until then, the rubric above is the right one:
**legacy single files compile, per-folder rules don't, native
`AGENTS.md` support means no emit target at all.**

This will age — the table will, especially. Re-verify before
acting on it; the rubric beneath the table is the durable part.
