# Changelog

## 1.0.0-rc.1 — 2026-05-14 (unreleased)

### Quality

- GitHub Actions CI: test + typecheck on Node 20 and 22 across Ubuntu, macOS, and Windows.
- Coverage job (`vitest --coverage`) uploads an artifact on every push to main.
- `npm audit --audit-level=high --omit=dev` gates merges.
- Offline-emit import gate: CI fails if anything in the `emit` path imports network code.
- CodeQL workflow runs on push and weekly.
- Dependabot configured for weekly grouped npm + actions updates.
- `RELEASE.md` documents the release process and semver decision tree.

### Added

- **`terso install-hook`** — install the Omnus session-observer hook into Claude Code's
  `settings.json`. Flags: `--client claude` (only supported client today), `--scope user|project`,
  `--uninstall`, `--dry-run`. Idempotent — re-running is a no-op when the hook is already wired.
- **Surface B beta notice** — `mcp`, `sync`, `capture`, `search`, `auth` now print a one-line
  stderr notice ("Surface B (Omnus-connected) is in beta…") on first invocation per process.
  Suppressable with `TERSO_SUPPRESS_BETA_NOTICE=1`. `--help` for each prefixed with `[beta v1.1]`.

### Changed

- **`terso emit --check` exit codes are now stable.** `0` = no changes, `1` = changes required,
  `2` = error (missing AGENTS.md, unknown target, blocked write). Documented in `--help`. The
  pre-1.0 behavior collapsed errors and drift into `1`.
- **`terso --version` is now sourced from `package.json` at runtime.** Previously hard-coded.

## 0.3.0 — 2026-05-10

### Added

- **`terso emit`** — compile a single `AGENTS.md` into the per-agent config files each
  AI coding agent expects (`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md`).
  - Auto-detects which agents are active via presence hints (`.cursor/`, `CLAUDE.md`,
    `.github/`). Falls back to all three on a fresh repo.
  - Flags: `--targets <list>`, `--check` (CI gate), `--dry-run`, `--watch`, `--force`.
  - Marker-based safety: refuses to overwrite files you maintain by hand without `--force`.
- **`terso mcp`** — Model Context Protocol server over stdio. Exposes project context
  to any agent client (Claude Code, Cursor, Codex, Cline) without per-client integrations.
  - Tools: `terso_get_context` (offline), `terso_search` (Omnus), `terso_capture` (Omnus).
  - `terso mcp install --client claude|cursor|codex` prints copy-paste install snippets.
- **`terso init`** now scaffolds a starter `AGENTS.md` at the project root if one
  doesn't exist, and points users at `terso emit` as the first next step.

### Changed

- README rewritten to lead with the AGENTS.md compiler wedge.
- User-Agent header now tracks the package version automatically (was pinned to 0.1.0).
- Default API URL upgraded to `https://omnus.dev` (was already in code; tests updated).

### Fixed

- Pre-existing doctor and config test failures from the ora spinner migration and
  the `localhost:3000` → `omnus.dev` URL change. Full suite now passes (121/121).
