---
title: "What I learned shipping a CLI for AI coding agents"
date: 2026-06-11
slug: shipping-a-cli
tags: [terso, oss, retrospective]
status: draft
---

`terso-cli` is small. Eleven commands, two surfaces (offline `emit` and an
Omnus-connected family), about 2,000 lines of TypeScript. Shipping it to v1.0
took longer than the line count would suggest.

A few things I'd tell myself at the start.

## 1. The wedge has to work in 90 seconds

The README went through four rewrites. The version that converted was the one
where someone unfamiliar with the project could go from "what is this?" to
"my first `terso emit` succeeded" in under 90 seconds. Anything in between —
backstory, architecture diagram, why I built it — fell out of the README and
into the blog.

The 90-second budget forces ruthless prioritization of the install command,
the first command that produces visible value, and a copy-pasteable CI gate.
Everything else is a link.

## 2. Offline-first commands cannot import network code

`terso emit` works without an account, without a network call, and without
Omnus. To keep that true under refactor pressure, the CI workflow grep-gates
any network import (`OmnusApiClient`, `fetch`, `node:http`) in the `emit`
code path. The first time someone unknowingly imports `api-client.ts` into a
shared helper that `emit` also uses, the build fails. Cheap, structural,
prevents drift.

## 3. Beta surfaces need an explicit label and a runtime notice

`terso mcp`, `sync`, `capture`, `search` are Surface B. They ship behind a
`[beta v1.1]` label in `--help` and print a one-line stderr notice on first
invocation. The notice is suppressable for CI (`TERSO_SUPPRESS_BETA_NOTICE=1`).

That decision came from a Codex review that pointed out: binding v1.0 to
Omnus's production multi-tenant work created a cross-repo blocker. Decoupling
let the OSS wedge ship on its own timeline.

## 4. CI matrix matters more than I expected

Three OSes × two Node versions = six combinations. Most bugs landed on
Windows-Node-20. Path handling, line endings, missing tools. Without the
matrix, those would've been v1.0-rc.3 bug reports from users. With it,
they're pre-release fixes.

## 5. Distribution lives outside the source tree

The Homebrew formula and Scoop manifest live in `distribution/`, not in the
main package. At release time, the formula's `sha256` and the manifest's
`hash` get updated against the published npm tarball. Keeping the drafts in
the same repo as the code means they don't drift across versions; cutting
them over to their canonical homes (a tap repo, a bucket repo) at release
time keeps the OSS pipeline simple.

## 6. The viral artifact is its own product

Phase 06 of the launch milestone was "ship one viral artifact." The picked
candidate — a GitHub Action that gates `AGENTS.md` drift in PRs — has its
own README, its own LICENSE, its own SECURITY.md, its own test workflow. It
will eventually get its own repo. Treating it as a standalone artifact from
day one makes that split painless.

## 7. Templates exist so I can ship faster, not so the repo looks corporate

`SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`, issue
templates, PR template — they exist because the next contributor needs them,
not because GitHub's "Community Standards" page rewards them. Each one is
short and matches the voice of the project.

## What's next

Surface B graduates from beta in v1.1, when Omnus's multi-tenant work lands.
Until then, the OSS wedge does its job: one source of truth for AI agent
instructions, in every project.

If you find a bug or want a feature: [GitHub Issues](https://github.com/petrkindlmann/terso-cli/issues).
