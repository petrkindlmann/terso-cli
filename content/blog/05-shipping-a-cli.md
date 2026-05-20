---
title: "The hard parts of terso-cli v1.0 were packaging and boundaries"
date: 2026-06-11
slug: shipping-terso-cli-v1
tags: [terso, oss, retrospective]
status: draft
---

`terso-cli` is small. Eleven commands, two surfaces (offline `emit` and
an Omnus-connected family), about 2,000 lines of TypeScript. Shipping
to v1.0 took longer than the line count would suggest — and almost none
of the time went into the actual compile logic. It went into packaging,
boundaries, and trust signals.

A few things I'd tell myself at the start.

## 1. The wedge has to work in 90 seconds

The README went through four rewrites. The version that converted was
the one where someone unfamiliar with the project could go from "what
is this?" to "my first `terso emit` succeeded" in under 90 seconds.
Backstory, architecture diagram, motivation — all of it fell out of the
README and into the blog.

The 90-second budget forces a hard cut: keep the install command,
the first command that produces visible value, and a copy-pasteable
CI gate. Everything else is a link.

## 2. Offline-first commands cannot import network code

`terso emit` works without an account, without a network call, and
without Omnus. To keep that true as the rest of the code evolves, the
CI workflow grep-gates any network import (`OmnusApiClient`, `fetch`,
`node:http`, `node:net`) in the `emit` code path. The first time
someone unknowingly imports `api-client.ts` into a shared helper that
`emit` also uses, the build fails. Cheap, structural, doesn't drift.

## 3. Beta surfaces need an explicit label and a runtime notice

`terso mcp`, `sync`, `capture`, `search` are Surface B. They ship
behind a `[beta v1.1]` label in `--help` and print a one-line stderr
notice on first invocation. The notice is suppressable for CI
(`TERSO_SUPPRESS_BETA_NOTICE=1`).

That decision came from a Codex review that pointed out: binding v1.0
to Omnus's production multi-tenant work created a cross-repo blocker.
Decoupling let the OSS wedge ship on its own timeline without holding
up the SaaS side, or vice versa.

## 4. The 2026 CLI trust bar is higher than it used to be

A v1.0 CLI in 2026 ships with — at minimum — a CI matrix on
Linux/macOS/Windows, `npm publish --provenance`, `npm audit` gating in
CI, a checksum manifest on every GitHub Release, signed-checksum
Homebrew formula and Scoop manifest, CodeQL, and Dependabot. None of
these are revolutionary. Together they're the floor; a CLI that shows
up without them reads, fairly or not, as unfinished.

The npm provenance attestation is the one I'd flag specifically.
Supply-chain attacks on dev-tool packages have made it the difference
between "I'd install this on a work machine" and "I'd wait." It's two
lines in a release workflow.

## 5. CI matrix matters more than I expected

Three OSes × two Node versions = six combinations. Most bugs landed on
Windows-Node-20: path handling, line endings, ora glyph fallback to
ASCII, missing tools. Without the matrix those would have been
v1.0-rc.3 bug reports from users. With it, they're pre-release fixes.

The lesson is general: any test assertion that hardcodes `/` as a path
separator or `✔ ⚠ ✖` as terminal glyphs assumes a runner you don't
control. Catch it before publish, or your users do.

## 6. Distribution lives outside the source tree

The Homebrew formula and Scoop manifest live in `distribution/`, not
in the published npm package. At release time, the formula's `sha256`
and the manifest's `hash` get updated against the published tarball.
Keeping the drafts in the same repo as the code means they don't
drift across versions; cutting them over to their canonical homes (a
tap repo, a bucket repo) at release time keeps the OSS pipeline
simple.

## 7. The companion artifact deserves its own product surface

The GitHub Action that gates `AGENTS.md` drift in PRs (`agents-md-action`)
has its own README, its own LICENSE, its own SECURITY.md, its own test
workflow. It will live in its own repo at launch. Treating it as
standalone from day one keeps the CLI repo small and makes the
eventual split boring.

## 8. Templates exist so I can ship faster, not so the repo looks corporate

`SECURITY.md`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SUPPORT.md`,
issue templates, PR template — they exist because the next contributor
needs them, not because GitHub's "Community Standards" page rewards
them. Each one is short and matches the voice of the project.

## What's next

Surface B graduates from beta in v1.1, when Omnus's multi-tenant work
lands. Until then, `terso emit` does its job: one canonical
`AGENTS.md`, compiled into every per-agent config file your repo still
needs, gated in CI so it stays that way.

If you find a bug or want a feature:
[GitHub Issues](https://github.com/petrkindlmann/terso-cli/issues).
