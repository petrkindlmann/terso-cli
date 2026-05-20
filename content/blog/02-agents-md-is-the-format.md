---
title: "AGENTS.md isn't a proposal anymore — it's the shared file"
date: 2026-05-21
slug: agents-md-shared-file
tags: [agents-md, ai-coding, specification]
status: draft
references:
  - https://agents.md/
  - https://github.com/agentsmd/agents.md
  - https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/
  - https://developers.openai.com/codex/guides/agents-md
---

Eighteen months ago, every AI coding agent read a different file. Today
most of them read the same one — and the ones that don't, point at it
as a fallback. The argument worth having shifted: not "which file?"
but "how do we keep all the *other* files in sync with `AGENTS.md` for
the clients and contexts that still need them?"

## Where adoption actually is (May 2026)

- More than **60,000 repositories** ship an `AGENTS.md`, per the registry
  the Agentic AI Foundation maintains.
- Native support landed in OpenAI Codex, GitHub Copilot (August 2025),
  Cursor, Google Jules/Gemini, Factory, Amp, Windsurf, and Zed.
- The format is now stewarded by the **Agentic AI Foundation under the
  Linux Foundation**, after OpenAI contributed the spec.
- The v1.1 proposal (issue #135 in the `agentsmd/agents.md` repo) focuses
  on layering, discovery, and progressive disclosure — the gaps people
  hit at scale, not new features.

That changes the framing of what a tool around `AGENTS.md` is for. It's
no longer "let's standardize." It's "let's make the standard cheap to
adopt where the legacy files still live."

## The "agents agree on `AGENTS.md`" table, post-standardization

| Client | Reads `AGENTS.md` natively? | Other files it still reads |
|---|---|---|
| OpenAI Codex | Yes, primary input. | — |
| GitHub Copilot | Yes (since Aug 2025). | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md` |
| Cursor | Yes. | `.cursorrules`, `.cursor/rules/*.mdc` (per-folder) |
| Claude Code | Imports it; reads `CLAUDE.md` natively. | `CLAUDE.md`, subdirectory `CLAUDE.md` files |
| Google Jules / Gemini | Yes. | — |
| Aider | Whatever you `--read`. | Any markdown you point it at. |
| Continue | A `systemMessage` in JSON config. | — |

The right-hand column is the work. Some are legacy files contributors
edited for years. Some are new per-folder systems that don't replace
`AGENTS.md` — they coexist with it. Either way, "the agent already
reads `AGENTS.md`" doesn't make those files go away.

## What an `AGENTS.md` should contain

The GitHub Copilot team analyzed 2,500 high-signal `AGENTS.md` files and
distilled them into a pattern. It maps to the categories I keep coming
back to:

1. **Project scope** — what the codebase does, in two sentences.
2. **Architecture pointers** — where logic lives, which directories to
   ignore.
3. **Conventions** — testing patterns, commit style, branching rules.
4. **Tools** — `pnpm` vs `npm`, formatter, linter, test runner.
5. **Don'ts** — things the agent should never do (skip tests, edit
   generated files, send telemetry).

Public leaderboards report that repos with a curated `AGENTS.md`
average **35–55% fewer agent-generated bugs** versus repos without one.
The number to take with salt — sampling is uneven — but the direction
is consistent across measurements.

## The compile model

`AGENTS.md` is the source. Per-agent files are compilation output:

```
AGENTS.md  →  CLAUDE.md
           →  .cursorrules
           →  .github/copilot-instructions.md
```

`terso emit` does the compile. Each emitted file starts with a marker
comment so re-emission is safe; the canonical `AGENTS.md` is the only
file a human edits.

If your repo only uses Codex CLI, you can stop reading — `AGENTS.md`
alone is enough. If anything *else* on the list still ships in your
contributors' workflows (most teams), the per-agent files are the work
`terso` removes.

## Per-folder rules don't replace `AGENTS.md`

Cursor's `.cursor/rules/*.mdc` and Copilot's
`.github/instructions/*.instructions.md` add a second axis: rules that
apply only inside certain paths. `AGENTS.md` covers repo-wide truths;
folder rules cover context-specific ones. They compose. `terso` doesn't
try to emit folder rules; they're authored where they apply, not
centralized. The longer version of that argument is in
[*the next config boundary is the folder, not the repo*](/blog/folder-config-boundary/).

## What you can do today

1. Move your `CLAUDE.md` / `.cursorrules` / Copilot instructions into
   `AGENTS.md`. Deduplicate as you go.
2. Run `terso emit` to regenerate the per-agent files from that one
   source.
3. Gate it in CI with `terso emit --check`.
4. Commit, and go back to whatever you were doing.

The "standard" question is settled. The maintenance tax is the part
that's still yours — and it shouldn't be.

[1]: https://github.com/petrkindlmann/terso-cli/blob/main/AGENTS.md
