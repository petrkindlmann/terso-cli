# Terso CLI — Project Definition

> The open-source companion to Omnus. The developer-facing wedge that gives AI coding agents a single source of truth for project rules — and the runtime that delivers Omnus knowledge into every repo.

This is the GSD project definition for Terso CLI. It defines what the project is, what success looks like, and how this CLI fits into the larger Omnus product.

---

## What this project is

Terso CLI is a Node.js command-line tool published to npm as `terso-cli`. It has two distinct surfaces, addressed by separate command families:

### Surface A: Offline. `terso emit`

Compile a single canonical `AGENTS.md` into every per-agent configuration file a repo uses:

```
AGENTS.md → CLAUDE.md
         → .cursorrules
         → .github/copilot-instructions.md
         → .codex/instructions.md (etc.)
```

This works without an account, without a network call, and without Omnus. It is **pure local file compilation**. This is the wedge — the thing users install before they understand what Omnus is.

### Surface B: Connected. `terso mcp`, `terso sync`, `terso capture`, `terso search`

When a user signs into Omnus, the CLI becomes the bridge between Omnus's Postgres knowledge store and the local `.terso/generated/` folder in each project repo. It also exposes an MCP server so any agent client (Claude Code, Cursor, Codex) can search project knowledge in-session.

This is the funnel. `terso emit` makes a user love the tool. Surfaces B convert love into a paid subscription.

The canonical spec for Surfaces B lives at `/Users/petr/projects/omnus/docs/11-cli-agent-integration.md`. Treat that doc as authoritative for CLI shape, command surface, and redaction flow. This `.planning/` directory plans the *engineering and distribution work* against that spec.

---

## Who this is for

- **Primary:** developers using AI coding agents who maintain the same project rules in 3+ files and are sick of it.
- **Secondary:** teams that want a CI gate ensuring AI-agent config files stay in sync.
- **Aspirational:** the AGENTS.md format becomes a community standard, and Terso CLI is the dominant tool around it.

---

## Goal state (definition of done for this milestone)

> **Revised after Codex review (2026-05-13):** the milestone is now scoped to **Surface A only** (offline `terso emit` + `emit --check` + docs + CI + GitHub Action). Surface B (`terso mcp`, `terso sync`, `terso capture`, `terso search` against production Omnus) is deferred to a follow-on milestone `v1.1-omnus-connected`. This decouples the OSS wedge from Omnus's multi-tenant work and lets the CLI ship and gather adoption while the SaaS finishes its own pre-launch work.

The current milestone `v1.0-launch` ships **a polished, trustworthy, broadly discoverable v1.0 of Terso CLI's offline surface** that drives Omnus signups (via README CTA) and seeds long-term virality in the AI-coding-tools community.

See `milestones/v1.0-launch/GOAL.md` for the precise definition. Summary:

- **Feature complete:** every advertised command works on a clean machine, on Linux/macOS/Windows, in CI, and offline-first commands have no Omnus dependency.
- **Trustworthy:** CI green, security policy published, semantic versioning honored, breaking changes flagged with deprecation windows, audit-clean dependency tree.
- **Discoverable:** listed on Homebrew, Chocolatey, awesome-* lists, mentioned in agent-tool docs (Cursor, Claude Code, Aider, Continue, Codex), GitHub repo polished.
- **Educational:** README converts a curious visitor to a first `terso emit` in under 90 seconds.
- **Drives funnel:** measurable signup conversion from CLI installs to Omnus free-tier accounts.
- **Seeds virality:** one well-chosen open-source artifact (a GitHub Action, a spec proposal, or an open-sourced engine) that becomes a shareable thing developers tweet about.

---

## Non-goals (this milestone)

- **No GUI wrapper.** Terso is a CLI. If a GUI is a future bet, it's a separate product.
- **No paid features in the CLI itself.** Paywalled features live behind Omnus auth. The CLI is free forever.
- **No support for non-AGENTS.md formats as the canonical input.** AGENTS.md is the canonical source. Other formats may be emitted; they're never read as the truth.
- **No supporting every agent client.** Pick a top-5 list (Claude Code, Cursor, Codex, Copilot, Aider, Continue), do them well. Others land in v1.x as community contributions.
- **No telemetry of any kind unless the user explicitly opts in.** This is non-negotiable.

---

## Current state baseline

(As of `package.json v0.3.0` and last commit `163f993 Fix pre-existing doctor and config test failures`.)

- **Published:** to npm as `terso-cli`. Installable globally.
- **Commands implemented:** `emit`, `init`, `doctor`, `watch`, `status`, `sync`, `capture`, `search`, `compile`, `mcp`, `auth`.
- **Tests:** 10 test files (6 lib + 4 commands) under `vitest`. No CI workflow committed.
- **Hooks subproject:** `/hooks` directory contains `omnus-session-observer.sh` and `process-session.ts` — a Claude Code session observer that ships separately.
- **Distribution:** npm only. No Homebrew, no Chocolatey, no Docker.
- **Trust artifacts:** none. No SECURITY.md, no CODE_OF_CONDUCT, no issue templates, no CONTRIBUTING.
- **Docs:** README only. No per-agent quickstart guides. No demo video. No asciinema. No GitHub Pages or hosted docs site.
- **Branding/positioning:** `omnus-cli` in keywords. Repo: `github.com/petrkindlmann/terso-cli`. Tied to Omnus by branding (good) but the public "why" story is under-told.
- **Missing for v1.0:** `terso install-hook` command (referenced in 11-cli-agent-integration), full coverage of Surface B flags, CI workflow, semver discipline, vulnerability disclosure, audit log.
- **Missing for viral seed:** there is no open-source artifact yet beyond the CLI itself.

---

## Success metrics

| Metric | Target by milestone end | Target 12 weeks after launch |
|---|---|---|
| GitHub stars | 250 | 1,000 |
| npm weekly downloads | 500 | 3,000 |
| Active CI users (`emit --check` runs/week) | 100 | 750 |
| Issues opened by non-maintainers | 10 | 50 |
| PRs merged from contributors | 1 | 5 |
| Mentions in agent-tool docs/READMEs (Cursor, Claude Code, etc.) | 1 | 3 |
| Listed in awesome-* lists | 1 | 4 |
| Signup conversion: CLI install → Omnus free signup | — measure baseline | 8% |

The CLI install → Omnus signup conversion is the most important number. Everything else is leading.

---

## Conventions

- **Phase IDs are stable.** Same rule as Omnus.
- **Phases ship in numeric order by default.** Dependencies declared per SPEC.
- **Atomic commits per phase.**
- **Public artifacts are committed to git, not generated.** A docs site, asciinema files, screenshots, press kit — these live in the repo and are versioned.

---

## How this `.planning/` directory relates to other docs

| Doc / location | Role | Relationship to `.planning/` |
|---|---|---|
| `README.md` (repo root) | Public landing | Touched as part of Phase 3 (Docs & Onboarding). |
| `CHANGELOG.md` | Version history | Updated by each phase that ships a release. |
| `package.json` keywords/description | npm discoverability | Tuned in Phase 5 (Distribution). |
| `/Users/petr/projects/omnus/docs/11-cli-agent-integration.md` | Canonical CLI spec | Source of truth for Surface B. SPECs reference it. |
| `/Users/petr/projects/omnus/.planning/CROSS-REPO.md` | Cross-repo coordination | Hard sync points between Omnus and Terso CLI shipping. |
| `.planning/` (this dir) | Agent-executable milestone plans | The `/goal` consumption layer. |

---

## Out-of-band escalations

1. A phase wants to break backward compatibility on `terso emit` — escalate, weigh against installed-base damage.
2. A phase wants to introduce telemetry — escalate, this is a brand-defining choice.
3. A phase wants to add a paid feature to the CLI itself — escalate, contradicts non-goal.
4. A phase wants to rename the binary or package — escalate.

---

## Last revised

2026-05-13 — Initial creation. Authoritative for milestone `v1.0-launch`.
