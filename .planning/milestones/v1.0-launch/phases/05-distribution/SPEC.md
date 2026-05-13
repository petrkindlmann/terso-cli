# Phase 05 — Distribution

> Homebrew, Scoop (or Chocolatey), Docker, GitHub Releases. Awesome-list inclusions. Outreach to agent-tool docs maintainers. `terso.dev/install` short URL.

---

## Purpose

npm-only distribution leaves most installers cold. Polished CLIs are installable from the channel a user already trusts. This phase puts Terso CLI where users are already looking and seeds discoverability.

---

## In scope

- Homebrew tap and formula.
- Scoop manifest (or Chocolatey package — pick one for Windows; default Scoop given AI-dev audience).
- Optional: Docker image at `ghcr.io/petrkindlmann/terso-cli`.
- GitHub Releases for every minor/patch with signed checksum manifest.
- PRs to ≥3 awesome-* lists.
- Outreach PRs to the docs / "recommended tools" sections of: Cursor, Claude Code, Aider, Continue.
- npm metadata tuning: keywords, description, repository, homepage, README rendering check.
- `terso.dev/install` redirect serving the platform-correct install command via user-agent detection (cheap Cloudflare Worker or Vercel Edge function).

## Out of scope

- A WinGet manifest (later if demand surfaces).
- Linux package managers beyond Homebrew (apt/yum/dnf — bear-trap of maintenance for marginal users).
- Standalone binary distributions via `pkg` / `bun build --compile` (later, not blocking v1.0).
- An installer GUI / installer app.

---

## Acceptance criteria

- [ ] **Homebrew tap exists** at `github.com/petrkindlmann/homebrew-terso` (or in the main org). Formula installs on macOS Intel + Apple Silicon. README on the tap repo documents `brew tap petrkindlmann/terso && brew install terso-cli`.
- [ ] **Formula auto-bump** workflow: when a new GitHub Release is published, a workflow opens a PR on the tap with the new version + SHA. Merge by founder (or auto-merge after CI green).
- [ ] **Scoop manifest** at a `scoop-bucket` repo or via a community bucket PR. `scoop install terso-cli` works.
- [ ] **GitHub Release** for the v1.0 tag includes: signed checksum manifest, release notes (from CHANGELOG), source archive. Optional: prebuilt binaries.
- [ ] **Awesome-list PRs** filed:
  - `sindresorhus/awesome-nodejs` (CLI section)
  - One of: `awesome-claude-code`, `awesome-cursor`, `awesome-mcp`
  - One of: `awesome-ai-tools`, `awesome-developer-tools`, an agent-specific list
  - Track in `phases/05-distribution/awesome-lists.md`: list URL, PR URL, status, merge date.
- [ ] **Agent-tool docs PRs.** Outreach to:
  - Cursor docs (`docs.cursor.com` or repo): propose addition to "Recommended tools"
  - Claude Code docs (Anthropic): if open to PRs, propose; else open Discussion
  - Aider docs (`aider.chat` repo): propose addition to integrations or recommendations
  - Continue docs: same
  - Track in `phases/05-distribution/agent-docs.md` with status per maintainer.
- [ ] **npm metadata tuned.** Keywords ordered by relevance; description sharp; repository URL canonical; homepage set.
- [ ] **`terso.dev/install` works.** A curl from macOS gets `brew tap ... && brew install ...`; from Windows gets `scoop install ...`; otherwise `npm i -g terso-cli`. Tested across 3 user agents.
- [ ] **README install section** shows all four install paths (npm, Homebrew, Scoop, `terso.dev/install`).
- [ ] **CHANGELOG entry** added.

---

## Key tasks

1. **Homebrew formula.** Author, test on Intel + Apple Silicon. ~1 day.
2. **Auto-bump workflow.** GitHub Action that opens a PR on the tap on every release. ~half day.
3. **Scoop manifest.** ~half day.
4. **Docker image (optional).** ~half day.
5. **GitHub Release assets.** Checksums, release notes. ~half day.
6. **Awesome-list PRs.** Three PRs with quality blurbs. ~half day.
7. **Agent-tool docs outreach.** Four targeted PRs/discussions. ~1 day.
8. **npm metadata tune.** ~30 min.
9. **`terso.dev/install` redirect.** Cloudflare Worker. ~half day.
10. **README install section.** ~30 min.
11. **CHANGELOG entry.** ~15 min.

Total: ~4 founder-days. Buffer to 6.

---

## Dependencies

- Phase 04 (GitHub presence) — distribution channels link to a serious-looking repo.

Downstream:
- Phase 06 (Viral artifact) — distribution channels publish the artifact too.
- Phase 07 (Content cadence) — content references install paths.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Homebrew maintenance overhead. | Medium | Auto-bump workflow. Don't hand-edit. |
| Awesome-list PRs sit in review for months. | High | Pick lists with active maintainers; track but don't block on these. |
| Agent-tool docs PRs are rejected (corporate gatekeeping). | High | Don't depend on them. Discussion / community-pin is fine if PR is rejected. |
| Scoop is the wrong Windows channel for this audience. | Medium | If install metrics show Windows lagging, ship Chocolatey in v1.1. |
| `terso.dev` domain not owned by Omnus. | Unknown | Check ownership; secure now if not owned. Fallback: `omnus.dev/install`. |

---

## Out-of-band escalations

- A trademark issue surfaces around "terso" → escalate, get legal advice.
- A Homebrew core inclusion path is offered → consider; it raises the bar but also locks the formula.

---

## References

- Homebrew formula style guide
- Scoop manifest format docs
- npm SEO guidance (npmjs.com docs)
- Examples: ripgrep, fd, fzf — all distributed across many channels

---

## Last revised

2026-05-13 — Initial SPEC.
