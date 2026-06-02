# Codex Independent Survey Review

**Verdict:** The survey is directionally right that `terso-cli` is a polished free OSS funnel/portfolio asset rather than a standalone revenue product, and it correctly assumes zero proven users, revenue, pricing, or analytics. It is not fully import-ready because Section 21 still uses legacy blended MRR fields for out-of-repo Omnus subscription revenue, lacks migration-008 split fields, marks the independent review as missing, and contains a few stale repo-evidence claims around test count, coverage gating, and release/publish proof.

## Findings

- **HIGH - Section 21 is missing migration-008 revenue split fields and models out-of-repo funnel revenue as this repo's MRR.** The payload uses only `solo_12mo_mrr_low/high`, `projected_12_month_mrr`, and `base_12_month_mrr_estimate` (`docs/PROJECT_SURVEY.md:681`, `docs/PROJECT_SURVEY.md:684`). The narrative says the CLI generates "$0 directly" and that paid revenue is attributable to the out-of-repo Omnus product (`docs/PROJECT_SURVEY.md:347`, `docs/PROJECT_SURVEY.md:368`), while the current dashboard schema separates durable recurring MRR, lumpy monthly cash, one-time service cash, and passive cash (`/Users/petr/projects/my-projects/docs/IMPORT_FORMAT.md:102`, `/Users/petr/projects/my-projects/docs/IMPORT_FORMAT.md:133`). Recommendation: add migration-008 fields; set direct CLI `recurring_mrr_low/high` to 0 unless the dashboard intentionally tracks Omnus-attributed subscription upside; keep manual pilot/setup money out of recurring MRR and put it in `one_time_service_cash` or `monthly_cash_*` only if modeled.

- **MEDIUM - "Published/deployed" is mostly repo assertion, not independently proven by repo artifacts.** The survey states "Published to npm at `0.3.0`" and uses `proof_level: "Deployed"` (`docs/PROJECT_SURVEY.md:25`, `docs/PROJECT_SURVEY.md:659`). Repo evidence supports a package configured for npm (`package.json:1`, `package.json:31`), README install guidance/badge (`README.md:3`, `README.md:18`), and a tag-triggered publish workflow (`.github/workflows/release.yml:3`, `.github/workflows/release.yml:38`). But actual npm registry publication, install counts, GitHub stars, and weekly downloads are not contained in the repo, and `distribution/README.md` marks Homebrew/Scoop as draft (`distribution/README.md:11`). Recommendation: keep "Deployed" only if repo self-assertion is enough for this dashboard; otherwise phrase as "package-ready / repo claims npm publication; no repo proof of downloads or live registry state."

- **MEDIUM - Test and coverage claims are stale/over-specific.** The survey repeatedly says 154 tests and a >=75% coverage gate (`docs/PROJECT_SURVEY.md:63`, `docs/PROJECT_SURVEY.md:158`, `docs/PROJECT_SURVEY.md:528`). I ran `TERSO_SUPPRESS_BETA_NOTICE=1 npm test`, and the current suite reports 11 files / 138 tests passed; `npm run typecheck` also passed. `vitest.config.ts` configures coverage reporters but no threshold (`vitest.config.ts:8`), and CI uploads coverage without enforcing a percent gate (`.github/workflows/ci.yml:59`). Recommendation: update counts to the current command output and change "coverage gate" to "coverage report/artifact" unless a threshold is added.

- **MEDIUM - Docs imply broader agent target support than the compiler emits.** The survey flags this correctly: README links quickstarts for Codex, Aider, and Continue (`README.md:98`), but `AGENT_TARGETS` only emits Claude, Cursor, and Copilot (`src/lib/agent-targets.ts:4`, `src/lib/agent-targets.ts:16`). Recommendation: keep it as a concrete missing piece and avoid counting the extra quickstart docs as implemented emit targets.

- **LOW - Section 21 should mark the independent review as present after this file exists.** The payload still says `independent_review_status: "missing"` even though it points to this review path (`docs/PROJECT_SURVEY.md:656`). Recommendation: change it to `"present"` before import.

- **LOW - `next_7_day_action` is two actions, not one.** The payload says to tag/publish v1.0 and then post Show HN (`docs/PROJECT_SURVEY.md:668`). Recommendation: make it one dashboard action, such as "Tag and publish `terso-cli v1.0.0` to npm."

## Section 21 Payload Checks

| Check | Result | Notes |
|---|---|---|
| JSON parses | PASS | Parsed as a single JSON object with 53 keys. |
| No trailing prose | PASS | The JSON fence is the final non-empty content (`docs/PROJECT_SURVEY.md:707`). |
| Migration 008 revenue split | CAVEAT | Split fields are absent, and legacy MRR fields describe Omnus-attributed subscription upside rather than direct CLI revenue. |
| Gate awareness | PASS | `single_repo_focus_score` is 5.9 and `decision_band` is `portfolio-asset`; current gates should not silently demote it further. |
| Internal consistency | CAVEAT | Narrative correctly says "$0 direct CLI revenue," but the payload still imports a funnel-attributed MRR band without split-field caveats; test/coverage facts are stale. |
| Enum validity | PASS | `decision_band`, `cash_potential`, `focus_category`, `pricing_status`, and confidence values use allowed values. |
| Proven users/revenue | PASS | `users_proven=false`, `revenue_proven=false`, `analytics_present=false`, and `proven_mrr=0` are appropriate (`docs/PROJECT_SURVEY.md:683`, `docs/PROJECT_SURVEY.md:688`). |
| Review metadata | CAVEAT | `independent_review_status` should be updated from `missing` to `present` now that this file exists. |
| next_7_day_action | CAVEAT | It combines publishing and a launch post; dashboard expects one action. |

## Requested Checklist

1. **Claims grounded in repo evidence?** Mostly; no users/revenue/traction overclaim, but npm publication/downloads are not independently proven by repo evidence and test/coverage counts need updating.
2. **Repo facts vs market inference separated?** Yes; the survey labels market pricing and buyer claims as analyst/market inference.
3. **No user/revenue/traction assumed?** Yes; `users_proven=false`, `revenue_proven=false`, `analytics_present=false`, and `proven_mrr=0` are correct.
4. **Scores fair, not optimistic?** Yes; `portfolio-asset` is gate-consistent and not overly punitive for a nearly finished free CLI.
5. **Missing pieces flagged?** Yes; extra emit targets, live funnel evidence, Omnus dependency, analytics/download proof, and paid-layer validation are identified, with the target-support gap especially repo-grounded.

## Verification Notes

- Parsed Section 21 JSON locally; no parse errors and no trailing prose.
- Ran `npm run typecheck`; passed.
- Ran `TERSO_SUPPRESS_BETA_NOTICE=1 npm test`; passed with 11 files / 138 tests.
- Ran `npm pack --dry-run --json`; package dry-run succeeded and listed 92 tarball entries.
