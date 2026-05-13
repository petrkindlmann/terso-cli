# Roadmap — Milestone `v1.0-launch`

> The ordered set of phases that take Terso CLI from a working-but-rough 0.3.0 to a polished, trustworthy, widely-discoverable v1.0 that funnels developers into Omnus and seeds long-term virality.

This roadmap implements the goal defined in `GOAL.md`. Every phase below names which closing criterion it satisfies.

---

## Phase ordering at a glance

```
01 Feature completeness ──►  02 Quality bar  ──►  03 Docs & onboarding
                                                              │
                                                              ▼
                          05 Distribution  ◄──  04 GitHub presence
                                  │
                                  ▼
                          06 Viral artifact ──►  07 Content cadence
```

Phases 01–04 are **strictly serial.** You cannot polish docs for incomplete features; you cannot publish a release with no CI; you cannot ask people to contribute to a repo without `CONTRIBUTING.md`.

Phase 05 (Distribution) and Phase 06 (Viral artifact) can **partially overlap.** Distribution is mostly mechanical (Homebrew formula, awesome-list PRs); the viral artifact is a creative bet.

Phase 07 (Content cadence) starts during 05 and continues indefinitely.

This roadmap aligns with Omnus's `v1.0-public-launch`. **The hard sync point is:** Terso CLI v1.0 ships *before* Omnus's public launch, ideally 1–3 weeks earlier, so the wedge is established when the press push lands. See `/Users/petr/projects/omnus/.planning/CROSS-REPO.md`.

---

## Phase 01 — Feature completeness

**Why this is first.** A polished v1.0 cannot have advertised commands that don't work or undocumented gaps. The repo currently lists 9 commands; not all are fully wired.

**What ships.**
- `terso install-hook` command implemented and tested. Spec inherits from `/Users/petr/projects/omnus/docs/11-cli-agent-integration.md`.
- Every command's flags audited against `--help` output; gaps closed.
- `terso emit` fully offline — no network calls, no auth prompt, no leakage of Omnus environment when not signed in.
- `terso doctor` exits 0 on a green machine and produces a categorized, actionable diagnostic on a broken one. The diagnostic includes Node version, npm version, install path, presence of expected target files, and Omnus auth state.
- `terso --version` reports the actual installed version. No hard-coded strings.
- `terso emit --check` is a stable CI primitive with documented exit codes (`0` = no changes, `1` = changes required, `2` = error).
- `terso mcp` exposes the three MCP tools (`terso_get_context`, `terso_search`, `terso_capture`) per spec. Clean error messages when Omnus auth is missing.
- `terso watch` re-emits cleanly without resource leaks.
- `terso sync` writes `.terso/generated/` into project repos and updates `.gitignore` per spec.

**Satisfies in `GOAL.md`:** the entire "Feature completeness" block.

**Dependencies:** none.

**Risk:** scope creep — every gap reveals five more. The phase plan should freeze the feature list early and treat anything beyond it as v1.1.

---

## Phase 02 — Quality bar

**Why this is second.** Polish on a no-CI repo is a stage set. The quality bar is what makes the polish real.

**What ships.**
- GitHub Actions workflow runs on every push and PR: `test`, `lint`, `typecheck`, against Node 20 LTS and Node 22.
- CI matrix across `ubuntu-latest`, `macos-latest`, `windows-latest`.
- Coverage configured (vitest's `--coverage`); current coverage measured; gate set at the measured level + 5 percentage points or 75%, whichever is lower; gate enforced in CI.
- README CI badge added.
- `npm audit` runs in CI; high-severity issues fail the build.
- CodeQL workflow enabled.
- Release process documented in `RELEASE.md`: semver decision tree, CHANGELOG update, tag, GitHub Release with assets, `npm publish`, post-release announcement template.
- Branch protection on `main`: PR required, CI green required.
- Dependabot or Renovate enabled for weekly dependency updates.

**Satisfies in `GOAL.md`:** the "Quality bar" block.

**Dependencies:** Phase 01 (you can't build CI for half-implemented commands).

**Risk:** CI runs become flaky and the team starts ignoring red badges. Plan should triage flakes immediately, never normalize a yellow build.

---

## Phase 03 — Docs and onboarding

**Why this is third.** A user's first 90 seconds determine retention. v1.0 needs every doc surface to convert.

**What ships.**
- README rewritten with this structure:
  1. One-sentence problem statement.
  2. One-sentence solution.
  3. A 30-second asciinema demo (or animated GIF).
  4. Install one-liner (`npm i -g terso-cli` and `brew install terso-cli`).
  5. First-command quickstart that produces visible value.
  6. Sectioned reference of every command (no walls of text; tables where they help).
  7. CI gate example (the existing one expanded with a real workflow).
  8. A clear bridge to Omnus ("Want hosted memory? [Sign up.]") — single link, no marketing dump.
  9. Links to per-agent guides, contributing, and security.
- Demo asciinema: under 30 seconds, narrated by terminal text only (no audio), hosted in the repo at `docs/demo.cast` and embedded.
- Per-agent quickstart guides at `docs/agents/`:
  - `claude-code.md`
  - `cursor.md`
  - `codex.md`
  - `copilot.md`
  - `aider.md`
  - `continue.md`
  Each ≤200 words, with a copy-pasteable snippet for the agent's specific config location.
- Troubleshooting page at `docs/troubleshooting.md` covering: npm permission errors, Windows path issues, missing `AGENTS.md`, drift between emit targets, Omnus auth failures.
- Hosted docs decision: either GitHub Pages with VitePress or skip and rely on README + GitHub-rendered Markdown. Pick by effort/value; v1.0 doesn't require a site.

**Satisfies in `GOAL.md`:** "README rewritten", "Demo asciinema", "Per-agent quickstart guides".

**Dependencies:** Phase 02 (so README badges are real).

**Risk:** the per-agent guides go stale within months as agents change config formats. Plan should add a "last verified" date on each.

---

## Phase 04 — GitHub presence

**Why this is fourth.** A serious OSS repo is recognizable. Missing trust artifacts feel like the repo isn't maintained.

**What ships.**
- `SECURITY.md` with disclosure policy and `security@omnus.dev` contact.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- `CONTRIBUTING.md` with: setup, build, test, dev loop, PR expectations, commit-message convention, sign-off policy.
- `SUPPORT.md` with how to get help and the issue-response SLA.
- Issue templates: bug, feature, question. Each with required fields.
- PR template with a checklist (tests, docs, CHANGELOG).
- `FUNDING.yml` — either set up GitHub Sponsors or explicitly omit with a rationale.
- GitHub Discussions enabled with categories: Q&A, Ideas, Show & Tell, Announcements.
- Repository topics set (`cli`, `agents-md`, `claude-code`, `cursor`, `copilot`, `mcp`, `ai-tools`, `developer-tools`).
- "About" section on the GitHub repo: short description, link to `omnus.dev`.
- Pinned issues: one for v1.0 milestone, one for the AGENTS.md format proposal (if Phase 06 picks that path).

**Satisfies in `GOAL.md`:** every bullet in "Trust artifacts".

**Dependencies:** Phase 01.

**Risk:** templates feel corporate. Tone matches a small open-source project, not a Fortune 500.

---

## Phase 05 — Distribution

**Why this is fifth.** Be where users already look. npm-only is insufficient.

**What ships.**
- Homebrew tap: a repo `petrkindlmann/homebrew-terso` (or in the main org) with a working formula. `brew install terso-cli` works on macOS Intel and Apple Silicon.
- Chocolatey package OR Scoop manifest for Windows (pick one based on AI-developer overlap; default to Scoop for AI-tooling audience).
- Docker image at `ghcr.io/petrkindlmann/terso-cli` (optional but cheap). Useful for CI containers.
- GitHub Release with assets for every minor: signed checksum manifest, prebuilt binaries (if feasible via `pkg` or `bun build --compile`).
- Awesome-list PRs:
  - `sindresorhus/awesome-nodejs` (under CLI)
  - `agarrharr/awesome-cli-apps` (or current equivalent)
  - one or more of: `awesome-claude-code`, `awesome-cursor`, `awesome-mcp`, `awesome-ai-coding-tools`.
  - Track in `phases/05-distribution/awesome-lists.md` with PR status.
- Outreach to docs maintainers for Cursor, Claude Code, Aider, Continue:
  - "Recommended tools" sections — propose Terso CLI as a maintained, tested tool.
  - Don't ask for endorsement; offer to write the PR.
- Discoverability tuning on the npm page: keywords ordered for SEO, repository URL canonical, README rendered cleanly.
- A short URL for installs: `terso.dev/install` redirects to the platform-specific install command, detected by user agent.

**Satisfies in `GOAL.md`:** "Distributed via at least 3 channels", "Listed on…", "At least one mention".

**Dependencies:** Phase 04 (so packages link to a repo that looks alive).

**Risk:** Homebrew formula maintenance becomes a tax. Plan should automate the version bump via a release-driven workflow.

---

## Phase 06 — Viral artifact

**Why this is sixth.** The CLI alone doesn't go viral. A focused, shareable, standalone artifact does.

**What ships.**
- A single, named decision: which artifact. Three candidates, pick one:
  - **A. AGENTS.md GitHub Action.** Lints AGENTS.md, validates required sections, checks drift between AGENTS.md and per-agent files. Installed in a CI workflow. Distributed via the Marketplace. Standalone repo.
  - **B. Public AGENTS.md spec proposal.** A repo `agents-md/spec` with the proposed format, examples for top 10 tools, a discussion board, and a list of adopters. Positions Terso CLI as the reference implementation. Slow burn, longer payoff.
  - **C. Open-source dedup / fingerprint engine.** Extract a piece of Omnus's processing into a standalone npm package. Useful for any builder doing semantic dedup. Doesn't directly grow CLI usage but signals depth.
  - Default recommendation: **A**, because the feedback loop is fastest, the badge-in-CI shows in repos, and the artifact's name shows up in every CI log.
- The artifact ships in its own repo with: README, asciinema, install instructions, CONTRIBUTING, SECURITY, CI, semver releases.
- The artifact has a launch post on `omnus.dev/blog`.
- The artifact is announced in the same launch window as the Terso CLI v1.0 launch, but with separate tweet/post threads — two artifacts, two launches.

**Satisfies in `GOAL.md`:** "One viral artifact shipped".

**Dependencies:** Phase 01 (so the underlying CLI is sound), Phase 03 (so the docs that the artifact references are real).

**Risk:** the artifact takes longer than expected and slips the launch window. Plan should treat this as time-boxed — 3 weeks max, scope down if needed.

---

## Phase 07 — Content cadence

**Why this is seventh.** Mindshare needs maintenance. One launch post fades in a week. A weekly cadence compounds.

**What ships.**
- First five blog posts (titles are placeholders, sharpen during phase plan):
  1. "I was maintaining the same project rules in four files." (the wedge story)
  2. "AGENTS.md is the format AI coding agents actually agree on."
  3. "How to gate AI agent configs in CI with `terso emit --check`."
  4. "MCP servers don't have to be complicated: `terso mcp` in 5 minutes."
  5. "What I learned shipping a CLI for AI coding agents."
- Content calendar checked into the repo at `content/calendar.md`. 8 weeks of titles dated.
- Founder cadence on X and LinkedIn: 3 posts/week, mix of (a) tip thread, (b) "I just shipped" mini-post, (c) reply-to-others (engagement, not just broadcast). In-thread responsiveness within 24 hours during the 8-week launch window.
- Public roadmap on GitHub for v1.1 and v1.2, so users see momentum.
- A monthly changelog email (opt-in) for users who installed via the website. Lives in Omnus's signup flow but the content is largely about the CLI.

**Satisfies in `GOAL.md`:** "At least 5 blog posts about Terso CLI exist", "Founder cadence committed", "Issue response SLA".

**Dependencies:** Phase 03 (so docs are real and link-able), Phase 05 (so distribution channels exist for content to reach).

**Risk:** the cadence dies in week 3. Plan should treat the first 8 weeks as non-negotiable, with the content drafted in advance (not improvised weekly).

---

## Cross-cutting constraints

- **No telemetry without explicit opt-in.** This is brand-defining.
- **Every release** ships with an updated `CHANGELOG.md`, a GitHub Release, and a Twitter/LinkedIn announcement.
- **Backward compatibility on `terso emit`** is sacred. Breaking the canonical input format (AGENTS.md) is an out-of-band decision.

---

## Hard sync points with Omnus

(See `/Users/petr/projects/omnus/.planning/CROSS-REPO.md` for the canonical reference.)

| Sync point | This roadmap | Omnus roadmap |
|---|---|---|
| `terso mcp` works against production Omnus | Phase 01 | Phase 01 (multi-tenant) |
| CLI v1.0 ships ≥1 week before Omnus public launch | Phase 05 + release | Phase 07 |
| Content cadence aligned for cross-promotion | Phase 07 | Phase 05 + 06 + 08 |
| Viral artifact (if A) referenced from Omnus blog | Phase 06 | Phase 05 |

---

## Out-of-scope (this milestone)

- GUI wrapper, paid features in the CLI, support for non-AGENTS.md as canonical input, supporting every agent client, telemetry. See `PROJECT.md > Non-goals`.

---

## Last revised

2026-05-13 — Initial creation. Codex strategic review pending.
