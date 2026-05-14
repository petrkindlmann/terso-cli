# Public roadmap — Terso CLI

This file mirrors `.planning/PROJECT.md` and `.planning/milestones/` into a
human-readable, public form. Source of truth is the milestone GOAL.md files;
this is the rendered view.

Track in-flight work via [GitHub Milestones](https://github.com/petrkindlmann/terso-cli/milestones).

## Now: v1.0-launch — Surface A (ship target: 2026-Q3)

Offline CLI: `terso emit`, `terso init`, `terso doctor`, `terso install-hook`.
Stable exit codes for `emit --check`. CI matrix. Trust artifacts. Distribution
via npm and Homebrew. One viral artifact (AGENTS.md GitHub Action). Five blog
posts. Founder cadence on X/LinkedIn during the 8-week launch window.

See [`.planning/milestones/v1.0-launch/GOAL.md`](../../GOAL.md).

## Next: v1.1-omnus-connected — Surface B (ship target: 2026-Q4)

`terso mcp`, `terso sync`, `terso capture`, `terso search` graduate from beta.
Production-ready against the multi-tenant Omnus instance. The friction-light
`terso auth` flow (magic link / OAuth, not manual token paste) lands here.

This milestone is gated on Omnus's multi-tenant work. See
`/Users/petr/projects/omnus/.planning/CROSS-REPO.md`.

## Later: v1.2+

Candidates (not committed):

- Per-folder rule emission (Cursor `.cursor/rules/*.mdc`, Claude Code's
  emerging subdirectory rules system).
- Additional emit targets: Aider, Continue, Cline, Sourcegraph Cody.
- Spec proposal for AGENTS.md format (the "Option B" from Phase 06 of v1.0).
- Pre-built binaries via `bun build --compile` for users without Node.
- Optional, opt-in telemetry — only if there's clear value to users and a
  community signal that it would be welcome. (Default position stays no.)

Anything on this list is on the table for v1.2 or v1.3. Nothing is committed
until it's a milestone with a GOAL.md.

## How to influence it

- Open an [issue](https://github.com/petrkindlmann/terso-cli/issues) describing
  the use case you have.
- Open a [discussion](https://github.com/petrkindlmann/terso-cli/discussions)
  for shape-of-the-thing conversations.
- Send a PR. Small ones land fastest.
