# Phase 07 — Content cadence

> Five launch-window blog posts about Terso CLI. A committed founder cadence on X and LinkedIn. A monthly changelog email. Public roadmap on GitHub.

---

## Purpose

Mindshare needs maintenance. One launch post fades in a week. A sustained cadence compounds. This phase makes the cadence concrete: pre-written content, a calendar, and a founder discipline.

---

## In scope

- Five blog posts about Terso CLI on `omnus.dev/blog`.
- A committed founder cadence on X and LinkedIn for the 8-week launch window.
- A monthly changelog email (opt-in) for users who installed via the website.
- A public roadmap on GitHub for v1.1 and v1.2.

## Out of scope

- Daily content (3/week is sustainable for a solo founder; daily isn't).
- YouTube channel.
- Podcasts (one-off guesting is fine; hosting isn't).
- Newsletter beyond monthly changelog.

---

## Acceptance criteria

- [ ] **Five blog posts written and scheduled** on `omnus.dev/blog`. Working titles (sharpen during phase plan):
  1. "I was maintaining the same project rules in four files." (the founder-story origin post)
  2. "AGENTS.md is the format AI coding agents actually agree on." (positioning post)
  3. "How to gate AI-agent configs in CI with `terso emit --check`." (tutorial post)
  4. "MCP servers don't have to be complicated: `terso mcp` in 5 minutes." (tutorial post)
  5. "What I learned shipping a CLI for AI coding agents." (reflection post)
  - Each ≥1,200 words. Each with at least 2 original visuals.
  - Schedule: launch day, +2 days, +7 days, +14 days, +28 days.
- [ ] **Content calendar** at `content/calendar.md` lists 8 weeks of dated posts: 3 X posts/week, 1–2 LinkedIn posts/week, 1 long-form per week.
- [ ] **First 4 weeks of X content pre-written.** Drafts in `content/x-drafts.md`. Reduces improvisation pressure.
- [ ] **Founder responsiveness committed.** In-thread responses within 24 hours during the 8-week launch window. Hard rule: no longer than 24h.
- [ ] **Monthly changelog email.** Opt-in checkbox on Omnus signup. First email sent at week 4 post-launch. Template at `content/changelog-email-template.md`.
- [ ] **Public roadmap on GitHub.** A v1.1 milestone with 5–10 issues. A v1.2 milestone with 3–5 issues. Roadmap visible from the README.
- [ ] **Engagement-not-broadcast rule respected.** A weekly checkpoint: at least 5 substantive replies to others' content per week. Not just self-promotion.
- [ ] **CHANGELOG entry** in Terso CLI repo for any v1.x patches shipped during this phase.

---

## Key tasks

1. **Post 1 draft** (founder story; reuses themes from Omnus's launch post 1). ~1 day.
2. **Post 2 draft** (AGENTS.md positioning). ~1 day.
3. **Post 3 draft** (CI tutorial). ~1.5 days — has working code.
4. **Post 4 draft** (MCP tutorial). ~1 day.
5. **Post 5 draft** (reflection — write in week 4 of the launch window from actual learnings). ~1 day.
6. **Humanizer pass on all 5.** ~half day.
7. **Original visuals.** ~1 day.
8. **Content calendar.** ~half day.
9. **First 4 weeks of X drafts.** ~1 day.
10. **Monthly changelog email setup.** Resend transactional template + cron. ~half day.
11. **Public GitHub roadmap milestones + issues.** ~half day.
12. **Weekly engagement checkpoint review.** ~ongoing, ~30 min/week.
13. **CHANGELOG entry.** ~15 min.

Total: ~7 founder-days for content + ongoing ~30 min/week post-launch.

---

## Dependencies

- Phase 05 (Distribution) — install paths referenced in posts.
- Phase 06 (Viral artifact) — at least one post references the artifact.
- Omnus's Phase 05 (Launch content) — share themes; cross-link.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Cadence dies in week 3 of execution. | High | Pre-write the first 4 weeks during this phase. Post-launch only needs improvisation. |
| Posts feel AI-generated. | High | `humanizer` skill + first-person voice + specific anecdotes. Friends review at least one. |
| Engagement-not-broadcast rule slips. | High | Weekly checkpoint enforced as part of `phases/08` (Credibility compounding) in Omnus's roadmap. |
| Tutorial posts break as CLI evolves. | Medium | Each tutorial post has a "last verified" date. Refresh on minor releases. |
| Monthly changelog email gets unsubscribes. | Low | Make it short, valuable, and clearly themed. Honor unsubs immediately. |

---

## Out-of-band escalations

- A blog post draft contradicts product positioning → escalate.
- A community member's vocal feedback suggests a positioning change → log to Omnus's customer-responses, escalate to a positioning review.

---

## References

- `humanizer` skill
- Examples of strong founder content cadences: levelsio (daily), shl, paulg, naval
- Examples of strong dev-tool blogs: Linear's Read, Vercel's blog, Cursor's blog, Resend's blog

---

## Last revised

2026-05-13 — Initial SPEC.
