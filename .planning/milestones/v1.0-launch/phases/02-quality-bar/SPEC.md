# Phase 02 — Quality bar

> CI, coverage, audit cleanliness, semver discipline, security disclosures. The infrastructure that makes "polished v1.0" structurally true, not just visually.

---

## Purpose

A repo without CI is a repo whose claims of quality can't be verified. This phase makes the quality bar machine-checked, not just author-asserted. Every claim in the README about Terso CLI being maintained becomes evidenced by green badges and reproducible workflows.

---

## In scope

- GitHub Actions CI workflow: `test`, `lint`, `typecheck` on every push and PR.
- CI matrix: `ubuntu-latest`, `macos-latest`, `windows-latest` × Node 20 LTS + Node 22.
- Coverage configured via `vitest --coverage`. Baseline measured; gate set at baseline + 5pp or 75%, whichever is lower.
- README badges: CI status, npm version, license.
- `npm audit` runs in CI; high-severity fails the build.
- CodeQL workflow enabled.
- `RELEASE.md` documents the release process (semver decision tree, CHANGELOG update, tag, GitHub Release, `npm publish`, announce).
- Branch protection on `main`: PR required, CI green required.
- Dependabot or Renovate enabled with a sane schedule (weekly, grouped patch updates).
- `package.json` keywords reviewed for npm SEO.

## Out of scope

- Code refactors to improve coverage artificially.
- Mutation testing.
- E2E browser testing (this is a CLI).
- Performance benchmarks (overkill for v1.0).

---

## Acceptance criteria

- [ ] **CI workflow exists** at `.github/workflows/ci.yml` and runs on `push` + `pull_request`. Includes `test`, `lint`, `typecheck`.
- [ ] **Matrix passes.** All combinations of OS × Node version pass. Windows-specific quirks (path handling, line endings) addressed.
- [ ] **Coverage configured and gated.** `vitest --coverage` runs in CI. Gate fails PR if coverage drops below baseline. Baseline documented in `phases/02-quality-bar/coverage-baseline.md`.
- [ ] **README badges added.** CI status, npm version, license. All resolve to a green or accurate state.
- [ ] **`npm audit` CI gate.** A workflow step runs `npm audit --audit-level=high`. Failing audit fails the build. If a known exception exists, document it in `phases/02-quality-bar/audit-exceptions.md`.
- [ ] **CodeQL workflow** added at `.github/workflows/codeql.yml`. Runs weekly + on push. No high-severity findings open.
- [ ] **`RELEASE.md`** committed with the documented process. Includes: pre-release checklist, version-bump command, CHANGELOG editing, tagging, GitHub Release creation, `npm publish`, post-release announcement template.
- [ ] **Branch protection on `main`.** Verified via GitHub settings (screenshot or `gh api` output in `phases/02-quality-bar/branch-protection.md`).
- [ ] **Dependabot or Renovate enabled.** Config file committed. Weekly schedule. Patches grouped.
- [ ] **`package.json` keywords** reviewed and ordered for npm discoverability. Description updated.
- [ ] **CHANGELOG entry** added.

---

## Key tasks

1. **Write `ci.yml`.** ~half day.
2. **Address platform-specific failures.** Likely Windows path handling. ~1 day.
3. **Measure coverage baseline; configure gate.** ~half day.
4. **Set up CodeQL.** ~half day.
5. **Write `RELEASE.md`.** ~half day.
6. **Branch protection rules.** ~15 min.
7. **Dependabot config.** ~15 min.
8. **`package.json` keyword tune.** ~half day.
9. **README badge integration.** ~half day.
10. **`npm audit` gate.** ~half day.
11. **CHANGELOG entry.** ~15 min.

Total: ~4 founder-days. Buffer to 6.

---

## Dependencies

- Phase 01 (feature completeness) — CI on incomplete commands is wasted effort.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Windows tests fail in mysterious ways. | High | Allocate a full day; use GitHub Actions' Windows runner locally via Vagrant or accept iteration. |
| Coverage gate creates pressure to write meaningless tests. | Medium | The gate is baseline + 5pp, not 100%. Quality > coverage number. |
| CodeQL surfaces a finding that requires a real fix. | Medium | Fix high-severity findings; defer/document medium/low. |
| `npm audit` flag goes red on a third-party dep with no patch. | Medium | Document the exception; consider replacing the dep. |
| Dependabot PRs overwhelm the founder. | Medium | Group patches; auto-merge for patches; manual review for minors/majors. |

---

## Out-of-band escalations

- A high-severity `npm audit` finding has no fix → escalate, decide between replacing the dep, vendoring a patch, or accepting risk with documentation.
- A test fails intermittently and resists debugging → escalate; consider quarantine + ticket.

---

## References

- `vitest` coverage docs
- GitHub Actions matrix syntax docs
- GitHub CodeQL setup docs
- Semver spec
- Conventional Commits (optional, not required)

---

## Last revised

2026-05-13 — Initial SPEC.
