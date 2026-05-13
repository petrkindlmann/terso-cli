# Milestone Goal — `v1.0-launch` (Surface A only)

> Ship a polished, trustworthy, broadly discoverable Terso CLI v1.0 — **offline-only surface** — that drives Omnus signups, becomes the obvious tool for the AGENTS.md format, and plants the seeds of long-term virality in the AI-coding-tools community.

This is the **specific, falsifiable definition of done** for this milestone. Every phase SPEC in `phases/` exists to satisfy at least one bullet here.

> **Codex Round 1 Review Applied (2026-05-13):** the milestone is scoped to **Surface A only** (offline `terso emit` + `emit --check` + docs + CI + GitHub Action). Surface B (`mcp`, `sync`, `capture`, `search` against production Omnus) ships in a separate follow-on milestone `v1.1-omnus-connected` so the OSS wedge is not blocked on Omnus's multi-tenant work. Acceptance criteria below that reference Surface B are marked as **[v1.1]** and excluded from milestone closure.

---

## The goal state in one paragraph

> A developer working in their terminal hears about Terso CLI from a tweet, a newsletter, or a colleague. They run `brew install terso-cli` or `npm i -g terso-cli`. The README explains the problem they have — "I maintain the same project rules in four files" — and the install-to-first-emit takes under 90 seconds. They check the result into git, share the project, and a teammate mirrors the install. They notice the CLI has an Omnus-flavored "what's this `terso mcp` thing" doorway. They sign up for Omnus's free tier. The CLI has a CI green badge, a 30-second demo asciinema, real CONTRIBUTING and SECURITY docs, and a clearly defined release cadence. Six weeks later, they're contributing a PR. The repo has crossed a thousand stars. Cursor's docs and Claude Code's awesome list both link to it. One well-placed open-source crumb (a GitHub Action, an AGENTS.md spec validator, or an open-sourced engine) is the talk of dev-tools Twitter for a week.

---

## Closing criteria (must all be true)

### Feature completeness

- [ ] **Every advertised command works** on a clean macOS/Linux/Windows install. Tested via a setup-from-zero script.
- [ ] **`terso emit` works fully offline** — no network calls, no Omnus dependency, no auth prompt.
- [ ] **`terso install-hook`** (referenced in `omnus/docs/11-cli-agent-integration.md`) is implemented and tested.
- [ ] **`terso doctor` exits 0 on a healthy install** and produces an actionable diagnostic on a broken one.
- [ ] **`--version` reports the actual installed version**, not a hard-coded string.
- [ ] **`emit --check`** is a stable CI primitive: same input → same exit code across machines and OSes.
- [ ] **[v1.1]** MCP server (`terso mcp`) exposes the three tools specified in `docs/11-cli-agent-integration.md`. Works against an authenticated Omnus account and reports a clean error when auth is missing. *Deferred from milestone closure; tracked in v1.1-omnus-connected.*

### Quality bar

- [ ] **GitHub Actions CI** runs `test`, `lint`, and `typecheck` on every push and PR. README has a green badge.
- [ ] **Test coverage ≥75% lines** on `src/` excluding generated and pure type-only files.
- [ ] **Zero high-severity `npm audit` issues** in the published artifact.
- [ ] **Semantic versioning is enforced** by a release process (manual is OK for v1.0; the process is documented).
- [ ] **A breaking change requires** a CHANGELOG entry, a deprecation in the prior minor, and a migration note.
- [ ] **CodeQL or equivalent SAST** runs on the repo at least weekly.

### Trust artifacts

- [ ] `SECURITY.md` published with a contact and disclosure policy.
- [ ] `CODE_OF_CONDUCT.md` published (Contributor Covenant or equivalent).
- [ ] `CONTRIBUTING.md` published with build/test instructions and PR expectations.
- [ ] Issue templates exist for bug / feature / question.
- [ ] PR template exists with a checklist.
- [ ] `FUNDING.yml` configured (or explicitly omitted with rationale in a comment).
- [ ] GitHub Discussions enabled.
- [ ] Branch protection on `main` (PR required, CI green required, signed commits encouraged).

### Discoverability

- [ ] **README rewritten** for an outsider's first 90 seconds: problem → solution → demo → install → first command. Includes screenshots / asciinema and a clear CTA to Omnus.
- [ ] **Demo asciinema (≤30s)** linked from README, embedded in the website, used in launch content.
- [ ] **Per-agent quickstart guides** exist for Claude Code, Cursor, Codex, Copilot, Aider, and Continue. Each ≤200 words, with a copy-pasteable snippet.
- [ ] **Distributed via at least 3 channels:** npm (existing), Homebrew tap, and one of Chocolatey/Scoop/Docker. A GitHub Release with assets accompanies every minor.
- [ ] **Listed on:** at least 3 of `awesome-cli`, `awesome-ai`, `awesome-claude-code`, `awesome-cursor`, `awesome-mcp`. Pending PRs count if not yet merged.
- [ ] **At least one mention** in Cursor / Claude Code / Aider / Continue docs or community spaces. Doesn't have to be official; a Discord pin or a recommended-tools section counts.

### Funnel to Omnus

- [ ] **The README has a clear, non-spammy bridge** to Omnus: "Connect to Omnus for hosted knowledge memory" with a single link.
- [ ] **[v1.1]** `terso auth` flow is friction-light — magic link or OAuth-style; no manual token-paste unless that's the only option. *Deferred to v1.1-omnus-connected.*
- [ ] **Conversion event tracked** with consent, ideally via Omnus signup attribution (referrer / install-source param), so the CLI→Omnus funnel is measurable. Acceptable: a simple `?source=terso-cli` param on the signup CTA. *Implementable in Surface A; this is just the URL parameter.*

### Viral seed

- [ ] **One viral artifact shipped** publicly. Candidates: an AGENTS.md GitHub Action (lint + format check + drift detection), a public AGENTS.md spec proposal repo, or an open-source extraction of the fingerprint/dedup engine.
- [ ] **The artifact has its own README and asciinema** and is independently install-able / runnable, not buried in Terso CLI.

### Content & community

- [ ] **At least 5 blog posts** about Terso CLI exist on `omnus.dev/blog` and/or syndicated to dev.to / Hashnode. First five candidates listed in the SPEC for Phase 7.
- [ ] **Founder cadence committed:** at least 3 posts per week on X or LinkedIn during the 8 weeks around launch. In-thread responsiveness within 24 hours during that window.
- [ ] **Issue response SLA:** any non-spam issue gets an acknowledging reply within 72 hours. Documented in `SUPPORT.md`.

---

## Trailing indicators (measured 12 weeks post-launch)

- GitHub stars: 1,000
- npm weekly downloads: 3,000
- Weekly `emit --check` CI runs: 750
- Issues opened by non-maintainers: 50
- PRs merged from external contributors: 5
- Mentions in major agent-tool docs/READMEs: 3+
- Awesome-list inclusions: 4+
- CLI install → Omnus free signup conversion: 8%

---

## What this milestone does *not* claim

- It does not claim that AGENTS.md is the universal format. It seeds the case for it.
- It does not claim CLI revenue. The CLI is free forever (per non-goal).
- It does not claim coverage of every agent client. Top-5 well > top-30 poorly.
- It does not claim a perfect repo. It claims a repo that an experienced OSS maintainer would respect.
- **It does not claim** that `terso mcp` / `sync` / `capture` / `search` are production-ready against the public Omnus instance. Those are Surface B, deferred to v1.1-omnus-connected. v1.0 ships Surface A only.
- **It does not claim** "viral" outcomes. The prior "talk of dev-tools Twitter for a week" framing was not falsifiable and has been removed; replaced with countable proxies (GitHub stars, npm downloads, awesome-list inclusions, named-voice acknowledgments).

---

## Codex strategic review applied

Round 1 of cross-AI review (Codex, via codex-rescue agent, 2026-05-13) made these changes to this document:

- Scoped the milestone to Surface A only. Surface B criteria marked **[v1.1]** and deferred.
- Removed unfalsifiable phrases ("talk of dev-tools Twitter"). Trailing-indicator counts retained as honest measurement.
- Clarified the Omnus signup-attribution requirement is Surface A scope (just a URL parameter).

---

## Last revised

2026-05-13 — Initial creation.
