# Phase 01 — Feature completeness

> Close every gap between advertised behavior and actual behavior. Implement `terso install-hook`. Make `terso doctor` truly diagnostic. Ensure every command does what its `--help` claims.

---

## Purpose

A v1.0 release that advertises 11 commands cannot have any of them half-working. This phase is the unglamorous polish that closes the gap between aspiration and reality. It also implements the one named missing command (`install-hook`) referenced in Omnus's `docs/11-cli-agent-integration.md`.

---

## In scope

- Audit every command in `src/commands/` against `--help` text and against the spec in `/Users/petr/projects/omnus/docs/11-cli-agent-integration.md`.
- Implement `terso install-hook` per spec.
- Ensure `terso emit` is **strictly offline-capable**: no network calls, no auth prompts, no Omnus environment dependence.
- Ensure `terso --version` reports the actual installed version (no hard-coded strings; read from `package.json`).
- Make `terso doctor` produce a categorized, actionable report. Categories: install, environment, agent targets, Omnus auth, project state.
- Stabilize `terso emit --check` exit codes: `0` no changes, `1` changes required, `2` error. Document these in `--help`.
- Confirm `terso mcp` exposes the three tools spec'd: `terso_get_context`, `terso_search`, `terso_capture`. Each handles missing-auth cleanly.
- Confirm `terso watch` re-emits cleanly without file-handle leaks.
- Confirm `terso sync` writes `.terso/generated/` and updates `.gitignore` per spec.

## Out of scope

- New commands beyond `install-hook`.
- Refactoring the existing command architecture.
- Migrating to a different CLI framework (Commander stays).
- Adding telemetry of any kind.

---

## Acceptance criteria

- [ ] **Command-by-command audit** committed at `phases/01-feature-completeness/AUDIT.md`. For each of 11 commands: advertised behavior, actual behavior, gap (if any), test coverage.
- [ ] **`terso install-hook` implemented** with at least: install into Claude Code's hook system per spec, idempotent re-runs, uninstall flag, dry-run flag. Unit tests cover happy + idempotent + uninstall.
- [ ] **`terso emit` strictly offline.** A test runs in a sandbox with `network: false` and asserts success. No `fetch`, `axios`, or HTTP imports anywhere in the emit code path.
- [ ] **`terso --version`** matches `package.json`'s `version` field exactly. Source-of-truth: `package.json`.
- [ ] **`terso doctor` exits 0 on a healthy install** and provides ≥5 categorized check lines. On a deliberately-broken install (e.g., missing `AGENTS.md`), exits non-zero and points at the fix.
- [ ] **`terso emit --check` exit codes documented and tested.** Three exit codes; each one's trigger condition has a test.
- [ ] **`terso mcp` three tools functional.** Integration test against a mock Omnus API confirms each tool returns sensible output and handles 401/403/500 gracefully.
- [ ] **`terso watch`** runs for 10 minutes with no file-handle accumulation (measured via `lsof` or equivalent).
- [ ] **`terso sync`** writes the expected files into a test project and adds the right `.gitignore` line. Idempotent.
- [ ] **No regressions:** the existing 10 test files all still pass. Coverage delta is ≥0 in this phase.
- [ ] **CHANGELOG entry** added under `[1.0.0-rc.1]` or appropriate pre-release block.

---

## Key tasks

1. **Run the audit.** Walk each command, document gaps. ~1 day.
2. **`install-hook` design.** Sketch the API; read Claude Code's hook docs; confirm with Omnus's `docs/11-cli-agent-integration.md`. ~half day.
3. **`install-hook` implementation.** ~1 day.
4. **`install-hook` tests.** ~half day.
5. **Offline guarantee for `emit`.** Static check (banned import) + runtime test. ~half day.
6. **`--version` source-of-truth fix.** Trivial. ~30 min.
7. **`doctor` rewrite.** Categorized checks, actionable output. ~1 day.
8. **`emit --check` exit-code audit.** Document, test. ~half day.
9. **`mcp` integration test.** Mock API, test each tool. ~1 day.
10. **`watch` leak check.** ~half day.
11. **`sync` test pass.** ~half day.
12. **CHANGELOG.** ~15 min.

Total: ~6 founder-days. Buffer to 8.

---

## Dependencies

None upstream.

Downstream: every subsequent Terso CLI phase assumes this baseline.

---

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Audit reveals more gaps than expected and scope balloons. | High | Freeze the v1.0 scope after the audit. Anything beyond goes to v1.1. |
| `install-hook` spec is under-specified in `docs/11`. | Medium | Clarify with Omnus's plan; document the interpretation as an ADR. |
| `emit` accidentally imports `api-client.ts` and breaks offline guarantee. | Medium | Static check in CI (ESLint rule banning the import from emit code). |
| Doctor checks become noisy and unhelpful. | Medium | Each check has a "should I show this if green?" decision. Default: hide green checks unless `--verbose`. |

---

## Out-of-band escalations

- A command's spec in Omnus's `docs/11` disagrees with the existing implementation → escalate, decide canonical.
- `install-hook` touches user system in a way that requires sudo → reject, find an alternative.

---

## References

- `/Users/petr/projects/omnus/docs/11-cli-agent-integration.md`
- `/Users/petr/projects/terso-cli/src/commands/`
- `/Users/petr/projects/terso-cli/hooks/process-session.ts` (existing hook infrastructure)
- Commander.js docs

---

## Last revised

2026-05-13 — Initial SPEC.
