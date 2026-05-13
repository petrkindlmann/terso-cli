# Phase 03 — Docs and onboarding

> Rewrite the README. Record a 30-second asciinema. Write per-agent quickstart guides. Make the first 90 seconds of a curious visitor convert to a working `terso emit`.

---

## Purpose

A repo's first impression is its README. After that, the first 90 seconds of a user's terminal experience decide whether they ever return. This phase makes both surfaces convert.

---

## In scope

- README rewrite per the structure in `ROADMAP.md > Phase 03`.
- A demo asciinema, ≤30 seconds, embedded in README.
- Per-agent quickstart guides for: Claude Code, Cursor, Codex, Copilot, Aider, Continue. Each ≤200 words.
- Troubleshooting page covering: npm permissions, Windows paths, missing AGENTS.md, drift between targets, Omnus auth failures.
- A short "Why AGENTS.md?" rationale page that defends the format choice — public-facing, useful for journalists and curious developers.

## Out of scope

- A separate documentation site / VitePress build. Defer to v1.1 if needed.
- Translation / localization.
- Video tutorials (asciinema only at v1.0).
- An "Awesome Terso" curated list. Could happen later, organically.

---

## Acceptance criteria

- [ ] **README rewritten.** Structure:
  1. One-sentence problem statement
  2. One-sentence solution
  3. 30-second asciinema (or animated GIF)
  4. Install one-liner (`npm i -g terso-cli` + `brew install`)
  5. First-command quickstart with visible value
  6. Command reference (tables where they help; no walls of text)
  7. CI gate example (real workflow)
  8. Single-link bridge to Omnus
  9. Links to per-agent guides, contributing, security
- [ ] **Asciinema** lives at `docs/demo.cast` (or in a separate repo if asciinema.org hosting preferred). ≤30 seconds. Shows install → first emit → result. Terminal text only, no audio.
- [ ] **Per-agent guides** under `docs/agents/` for the six named agents. Each ≤200 words. Each includes: where the agent reads config from, copy-pasteable snippet, "last verified" date.
- [ ] **Troubleshooting page** at `docs/troubleshooting.md` covers the five named scenarios with copy-pasteable fixes.
- [ ] **"Why AGENTS.md?" rationale** at `docs/why-agents-md.md`. ~600 words. Argues the format choice for an outsider.
- [ ] **First-time-user test.** Three friends who haven't used Terso are given the README. Measure: time-to-first-emit. Target: ≤90 seconds median.
- [ ] **README renders well on GitHub mobile.** Check on a phone.
- [ ] **All command examples in docs are tested.** A script (or manual checklist) runs each documented command and verifies it works.
- [ ] **CHANGELOG entry** added.

---

## Key tasks

1. **README outline.** ~half day.
2. **README draft.** ~1 day.
3. **README humanizer pass.** Run through `humanizer` skill; replace AI-isms. ~half day.
4. **Asciinema script + recording.** Multiple takes; cut for ≤30s. ~half day.
5. **Per-agent guides.** Six guides × ~1 hour each. ~1 day.
6. **Troubleshooting page.** ~half day.
7. **Why AGENTS.md rationale.** ~half day.
8. **First-time-user testing.** Three friends; observe. ~half day (calendar; effort minimal).
9. **Mobile rendering check.** ~15 min.
10. **CHANGELOG entry.** ~15 min.

Total: ~4 founder-days + 1 day calendar for friends.

---

## Dependencies

- Phase 02 (Quality bar) — README badges depend on real CI.

Downstream: Phase 05 distribution references the README; Phase 07 content reuses pieces.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Per-agent guides go stale as agent config formats change. | High | "Last verified" date on each. A quarterly review reminder. |
| Asciinema is too long or feels slow. | Medium | Multiple takes; aggressive cut. Test on three viewers; if they fidget, cut more. |
| README reads as AI-generated. | High | `humanizer` pass + first-person voice + specific anecdotes. Friends review before publish. |
| First-time-users hit npm permission errors and bounce. | Medium | Troubleshooting page surfaces this; README mentions `npx terso-cli` as an alternative. |
| README becomes too long. | Medium | Hard limit ~600 lines rendered. Push details to linked docs. |

---

## Out-of-band escalations

- The product story in README contradicts Omnus's landing-page positioning → escalate.
- A per-agent guide reveals a security gap (e.g., a hook config that leaks tokens) → halt, fix, escalate.

---

## References

- `humanizer` skill
- `superpowers:human-writing` skill
- Examples of strong CLI READMEs: ripgrep, fd, fzf, charmbracelet/glow

---

## Last revised

2026-05-13 — Initial SPEC.
