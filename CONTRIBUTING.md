# Contributing to terso-cli

Thank you for considering a contribution. This guide covers the loop end-to-end.

## Local setup

```sh
git clone https://github.com/petrkindlmann/terso-cli
cd terso-cli
npm install
npm test        # 126 tests should pass
npm run typecheck
```

## Running the CLI from source

```sh
npm run dev -- emit --dry-run
```

`npm run dev` runs `src/index.ts` via `tsx` — no build step required during
development.

## Build

```sh
npm run build   # tsc, writes to dist/
node bin/terso.js emit --dry-run
```

## Testing

`vitest` is the runner. Tests live in `tests/`, mirroring `src/`.

- `npm test` — single run.
- `npm run test:watch` — watch mode.
- `npx vitest run --coverage` — coverage report (HTML in `coverage/`).

When adding a new command or flag, please also add a test in `tests/commands/`.

## Style

- TypeScript strict. `npm run typecheck` is gated in CI.
- No new runtime dependencies without a strong reason — keep the install tiny.
- Default to no comments. Only add one when the *why* is non-obvious.
- Follow existing patterns rather than introducing new ones. The codebase is
  small enough to read end-to-end in an afternoon.

## Pull requests

1. Branch off `main`.
2. Make a focused change — bug fix, one feature, or one refactor. Bundling
   unrelated changes is the most common cause of review back-and-forth.
3. Update `CHANGELOG.md` under the `(unreleased)` section.
4. Update docs for any user-visible change.
5. Open the PR. CI must be green.

Commit messages: imperative mood, present tense ("Add X", not "Added X").
Reference issues with `Fixes #123` in the body when applicable.

## Surface A vs Surface B

`terso emit` and friends are **Surface A** — offline, ship in v1.0. `terso mcp`,
`sync`, `capture`, `search`, `auth` are **Surface B** — Omnus-connected, ship
production-ready in v1.1. Surface B contributions are welcome but should expect
to live behind the `[beta v1.1]` notice until v1.1 ships.

## Releasing

Maintainers only. See [RELEASE.md](RELEASE.md).

## Security

Don't open public issues for security-sensitive reports — email
`security@omnus.dev` instead. See [SECURITY.md](SECURITY.md).
