# Phase 06 — Viral artifact

> Ship one open-source artifact, separate from the CLI itself, that gives developers a shareable thing to talk about. Default candidate: an AGENTS.md GitHub Action.

---

## Purpose

The CLI alone is useful but not shareable. A standalone artifact — a GitHub Action, a spec proposal, an open-sourced engine — gives the AI-dev community a focused thing to test, install, star, and talk about. This is the lottery ticket. The phase is time-boxed: 3 weeks max.

---

## In scope

- A decision document picking ONE of three candidates.
- A standalone repo for the chosen artifact with its own README, asciinema, CI, SECURITY, CHANGELOG, semver.
- A launch post on `omnus.dev/blog` (the post itself is in Omnus's Phase 05 SPEC).
- A coordinated announcement in the same launch window as Terso CLI v1.0.

## Out of scope

- Building all three candidates.
- Multiple viral artifacts in v1.0 (one focused bet > three weak ones).
- A paid version of the artifact.

---

## Acceptance criteria

- [ ] **Decision document** at `phases/06-viral-artifact/DECISION.md` is committed in week 1 of this phase. Selects exactly one candidate with rationale. Candidates:
  - **A. AGENTS.md GitHub Action.** A reusable workflow that runs in any repo's CI to: validate AGENTS.md syntax + required sections, check drift between AGENTS.md and per-agent files (CLAUDE.md, .cursorrules, etc.), comment on PRs if drift exists. Distributed via the GitHub Marketplace.
    - Pros: every adoption surfaces a Terso CLI badge in CI logs. Fast feedback loop. The Action name shows in every adopting repo.
    - Cons: bound to GitHub.
  - **B. Public AGENTS.md spec proposal.** A repo `agents-md/spec` (or `petrkindlmann/agents-md-spec`) with the proposed format, examples for top 10 tools, a discussion board, an "adopters" list. Positions Terso CLI as reference implementation.
    - Pros: long-term mindshare. Could become the format.
    - Cons: slow burn. Requires community-building effort.
  - **C. Open-source dedup / fingerprint engine.** Extract a piece of Omnus's processing (dedup or fingerprint) into a standalone `@omnus/fingerprint` npm package.
    - Pros: signals technical depth. Useful for many builders.
    - Cons: doesn't directly grow CLI usage. Maintenance overhead.
  - **Default if undecided: A.** The feedback loop is fastest; the badge surfaces broadly.
- [ ] **Standalone repo created** for the chosen artifact. Either in `petrkindlmann/<artifact>` or in a new org. README, asciinema, CI, SECURITY.md, CHANGELOG, semver release strategy.
- [ ] **Artifact does what it claims.** For Action A: dogfood on `terso-cli` and `omnus` repos first. For Proposal B: at least 5 real example AGENTS.md files in `examples/`. For Engine C: at least one alternative builder uses it.
- [ ] **Artifact has its own demo asciinema or GIF.** Short, focused.
- [ ] **At least one adopter beyond founder.** A friend, a small open-source repo, a project using `terso emit`. Documented in the artifact's README.
- [ ] **Launch post is drafted.** ~1,200 words on `omnus.dev/blog`. Published in the Terso CLI launch window but with its own thread.
- [ ] **Coordinated announcement.** Tweet thread, LinkedIn post, ProductHunt sub-product or "Show HN" link to the artifact repo on a different day than Terso CLI's launch.
- [ ] **CHANGELOG entry** added to the artifact repo and the Terso CLI repo.

---

## Key tasks

1. **Decision.** Week 1, half day max. ~half day.
2. **Build (Action A scenario).** Workflow, validation script, drift detector, PR-comment template, CI. ~5 days.
3. **Build (Proposal B scenario).** Spec doc, examples for top 10 tools, discussion board setup. ~7 days.
4. **Build (Engine C scenario).** Extract module, tests, public API design. ~10 days.
5. **Dogfood.** Use the artifact on real repos. ~1 day.
6. **Get one external adopter.** Personal ask. ~half day.
7. **Asciinema for the artifact.** ~half day.
8. **Launch post drafting.** ~1 day.
9. **Coordinated announcement.** ~half day.
10. **CHANGELOG entries.** ~15 min.

For default (A): ~7 founder-days. Buffer to 10.

---

## Dependencies

- Phase 01 (feature completeness) — the CLI must be sound for the artifact to be credible.
- Phase 03 (docs) — the artifact's README references CLI docs.

Downstream:
- Phase 07 — content cadence references the artifact.
- Omnus's Phase 05 — references the artifact in the launch post.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| The artifact takes longer than 3 weeks and slips Terso CLI's launch. | High | Hard descope: at week 3, ship a simpler version or move to v1.1. |
| The artifact is technically interesting but socially flat (no virality). | High | Most artifacts don't go viral. Plan emotionally. Distribution work in Phase 05 + content in Phase 07 still benefit from a real artifact existing. |
| The artifact's maintenance becomes a tax. | Medium | Keep scope narrow. Auto-merge dependabot. Founder time-budget 30 min/week for the artifact post-launch. |
| Option B (spec proposal) requires community-building that solo founder can't sustain. | High | Lean toward A unless founder has unusual energy for community work. |

---

## Out-of-band escalations

- A respected voice offers to co-author the artifact → accept; relationships matter more than IP control.
- The artifact's name overlaps with an existing tool → rename early.
- A competing tool ships a similar artifact during the build → revisit positioning, possibly shift to a different candidate.

---

## References

- GitHub Marketplace publishing docs (for Action A)
- Examples of GitHub Actions that drove projects' visibility: `actions/checkout`, `peter-evans/create-pull-request`, `dependabot/*`
- Examples of strong format proposals: `editorconfig`, `dotenv-vault/dotenv-x`
- Examples of well-extracted OSS engines: `marked`, `unified`, `remark`

---

## Last revised

2026-05-13 — Initial SPEC.
