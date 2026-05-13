# Phase 04 — GitHub presence

> SECURITY, CODE_OF_CONDUCT, CONTRIBUTING, SUPPORT, issue templates, PR template, Discussions, branch protection, topics. The trust artifacts that signal a serious OSS project.

---

## Purpose

A user evaluating an OSS dependency does pattern-matching on the repo. Missing trust artifacts read as "this could go stale." This phase produces the artifacts that pattern-match as "maintained" — without being corporate or ceremonial.

---

## In scope

- `SECURITY.md` with disclosure contact and policy.
- `CODE_OF_CONDUCT.md` (Contributor Covenant 2.1).
- `CONTRIBUTING.md` with setup, build, test, PR expectations.
- `SUPPORT.md` mirroring the in-app `/support` content.
- Issue templates: bug, feature, question.
- PR template with a small checklist.
- `FUNDING.yml` (or explicit omission with rationale).
- GitHub Discussions enabled with categories.
- Repository topics curated.
- Repository "About" section curated.
- Pinned issues for v1.0 milestone tracking.

## Out of scope

- Corporate-style governance documents (steering committee, RFC process).
- Multiple maintainer levels.
- A separate community Discord (defer; if/when needed).
- Sponsorship tiers beyond GitHub Sponsors defaults.

---

## Acceptance criteria

- [ ] **`SECURITY.md`** exists at repo root. Contains contact (`security@omnus.dev`), supported versions table, vulnerability disclosure timeline.
- [ ] **`CODE_OF_CONDUCT.md`** is Contributor Covenant 2.1 verbatim, with the contact filled in.
- [ ] **`CONTRIBUTING.md`** covers: how to set up dev environment, how to run tests, how to add a command, the PR checklist, expected response time. Tone is friendly and direct, not corporate.
- [ ] **`SUPPORT.md`** explains how to get help: GitHub Discussions for questions, GitHub Issues for bugs/features, email for security/private matters.
- [ ] **Issue templates** at `.github/ISSUE_TEMPLATE/`: `bug_report.md`, `feature_request.md`, `question.md`. Each has required fields and a friendly opening.
- [ ] **PR template** at `.github/PULL_REQUEST_TEMPLATE.md` with a small checklist (tests added, docs updated, CHANGELOG entry).
- [ ] **`FUNDING.yml`** at `.github/FUNDING.yml` — either configured for GitHub Sponsors or explicitly omitted with a one-line code comment.
- [ ] **GitHub Discussions enabled** with categories: Q&A, Ideas, Show & Tell, Announcements.
- [ ] **Repository topics** set on GitHub: `cli`, `agents-md`, `claude-code`, `cursor`, `copilot`, `mcp`, `ai-tools`, `developer-tools`, `aider`, `continue`.
- [ ] **Repository "About"** populated: short description, link to `omnus.dev`, topics visible.
- [ ] **Pinned issue** for v1.0 milestone tracking. References the milestone link.
- [ ] **No "Last updated 3 years ago"** vibe: every prominent artifact (LICENSE, README, last commit) shows recent activity.
- [ ] **CHANGELOG entry** added.

---

## Key tasks

1. **`SECURITY.md`.** ~30 min.
2. **`CODE_OF_CONDUCT.md`.** ~15 min.
3. **`CONTRIBUTING.md`.** ~1 hour.
4. **`SUPPORT.md`.** ~30 min.
5. **Issue templates.** ~30 min.
6. **PR template.** ~15 min.
7. **`FUNDING.yml`.** ~15 min.
8. **Enable Discussions, configure categories.** ~15 min.
9. **Repository topics and About.** ~15 min.
10. **Pinned issue.** ~15 min.
11. **CHANGELOG entry.** ~15 min.

Total: ~half a founder-day.

---

## Dependencies

- Phase 01 — there must be a baseline to point at.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Templates feel corporate / generic. | High | Tone match: small, friendly, direct. Read each one aloud before committing. |
| Discussions sit empty and look dead. | Medium | Seed with 2–3 founder-posted Q&As. |
| `SECURITY.md` contact gets spam. | Medium | Use a unique alias (`security@`) and route to founder; spam-filter aggressively. |
| Topic list mis-aimed for SEO. | Low | Cross-check against what similar repos use (ripgrep, fd, etc.). |

---

## Out-of-band escalations

- A submitted security report is real → handle per `SECURITY.md`, escalate, ship a patch.
- A user violates the Code of Conduct → handle per CoC enforcement guide, escalate as needed.

---

## References

- Contributor Covenant 2.1
- GitHub's "community profile" guide
- Examples of strong OSS hygiene: ripgrep, fd, fzf, charmbracelet/*, vercel/*

---

## Last revised

2026-05-13 — Initial SPEC.
