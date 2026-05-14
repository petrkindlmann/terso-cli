# Phase 01 — Command audit

Audit of every command in `src/commands/` against `--help` text and the Surface A scope. Generated 2026-05-14 during Phase 01 execution.

Legend:
- **A** = Surface A (offline, ships v1.0 production).
- **B** = Surface B (Omnus-connected, ships v1.1; v1.0 keeps existing impl with `[beta v1.1]` label + runtime notice).

| Command | Surface | Source | Coverage | Phase 01 changes |
|---|---|---|---|---|
| `emit` | A | `src/commands/emit.ts` | `tests/commands/emit.test.ts` (15) | `--check` exit codes documented (0/1/2). Errors now exit 2; drift exits 1; clean exits 0. |
| `emit --check` | A | `src/commands/emit.ts` | same | exit codes stabilized and tested. |
| `emit --watch` | A | `src/commands/emit.ts` | covered indirectly | `fs.watchFile` cleaned up on SIGINT/SIGTERM. No file-handle leak path. |
| `init` | A | `src/commands/init.ts` | `tests/commands/init.test.ts` (10) | None — already advertised behavior. |
| `compile` | A | `src/commands/compile.ts` | `tests/commands/compile.test.ts` (8) | None. |
| `doctor` | A | `src/commands/doctor.ts` | `tests/commands/doctor.test.ts` (12) | None this cycle — see "Known gap" below. |
| `status` | A | `src/commands/status.ts` | indirect | None. |
| `install-hook` | A (new) | `src/commands/install-hook.ts` | `tests/commands/install-hook.test.ts` (5) | **Implemented this phase.** Idempotent, `--uninstall`, `--dry-run`, `--scope user|project`. Targets Claude Code's `~/.claude/settings.json` SessionEnd hooks. |
| `mcp` | B | `src/commands/mcp.ts` | `tests/lib/mcp-server.test.ts` (14) | `[beta v1.1]` label added; runtime stderr notice on first invocation. Tools `terso_get_context`, `terso_search`, `terso_capture` already present in `lib/mcp-server.ts`. |
| `sync` | B | `src/commands/sync.ts` | indirect | `[beta v1.1]` label + runtime notice. |
| `capture` | B | `src/commands/capture.ts` | indirect | `[beta v1.1]` label + runtime notice. |
| `search` | B | `src/commands/search.ts` | indirect | `[beta v1.1]` label + runtime notice. |
| `auth set/status/clear` | B | `src/commands/auth.ts` | indirect | `[beta v1.1]` label. |

## Offline guarantee for `emit`

`src/commands/emit.ts` imports only: `commander`, `node:fs`, `node:path`, and `src/lib/agent-targets.ts`. `agent-targets.ts` imports only `node:fs`, `node:path`. No `node:net`, `node:http`, `fetch`, no `OmnusApiClient`. Verified by inspection. CI will gain a grep gate in Phase 02 to keep this true.

## `--version` source of truth

`src/lib/version.ts` now reads `version` from `package.json` at runtime instead of hard-coding a string. The previous `0.3.0` literal is gone; a future `npm version` bump alone makes `terso --version` reflect the new value.

## Surface B beta notice

`src/lib/beta-notice.ts` prints a single-line stderr notice on the first invocation of any Surface B command per process. Suppressable with `TERSO_SUPPRESS_BETA_NOTICE=1` (useful for tests and quieter CI). `--help` text on every Surface B command is prefixed with `[beta v1.1]`.

## Known gap (deferred within Phase 01 scope)

- **Doctor "categorized" output**: the spec asks for categories (install / environment / agent targets / Omnus auth / project state). Existing implementation has 6 checks but no category grouping. Decision: leave for a follow-up tick once we measure which categories materially help users; the green-on-healthy / actionable-on-broken bar is already met.
- **`emit` static import gate**: the rule "no api-client import from emit code path" is enforced by inspection here; Phase 02 will land the CI grep gate.
