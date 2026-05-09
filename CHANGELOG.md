# Changelog

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
