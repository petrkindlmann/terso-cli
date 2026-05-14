# Releasing Terso CLI

This document describes how a maintainer ships a new version. Releases are manual today; the workflow is small enough that it doesn't yet pay to automate end-to-end.

## Semver decision tree

| Change | Bump |
|---|---|
| Bug fix, doc-only, internal refactor with no API change | patch (`1.0.0` → `1.0.1`) |
| New flag, new command, new emit target — backward-compatible | minor (`1.0.0` → `1.1.0`) |
| Removed flag, renamed command, output format change, raised Node-LTS floor | major (`1.0.0` → `2.0.0`) |

Anything that breaks `terso emit` output for existing AGENTS.md files is a major. Surface B (Omnus-connected) features stay in beta until v1.1.

## Pre-release checklist

- [ ] `main` is green in CI (test, typecheck, audit, CodeQL).
- [ ] `CHANGELOG.md` has a section for the new version with `Added` / `Changed` / `Fixed` / `Deprecated` as needed.
- [ ] No `[beta v1.1]` notice removed from a command unless that command is moving to GA in this release.
- [ ] `README.md` reflects any new commands or flags.

## Bump and tag

```sh
npm version <patch|minor|major>   # updates package.json, creates git tag
git push --follow-tags origin main
```

The `version` git tag (e.g. `v1.0.0`) drives the GitHub Release.

## GitHub Release

```sh
gh release create v1.0.0 \
  --title "v1.0.0" \
  --notes-file CHANGELOG.md \
  --verify-tag
```

Attach assets if any (signed checksum manifest, prebuilt binaries) — see Phase 05 for the artifact pipeline.

## npm publish

```sh
npm publish --access public
```

`prepublishOnly` runs `npm run build`. Verify `dist/` and `hooks/` are populated in the tarball with:

```sh
npm pack --dry-run
```

## Post-release announcement

Templates in `content/announcements/`. At minimum:

1. Tweet/Bluesky thread with the changelog highlights.
2. LinkedIn post linking the GitHub Release.
3. Update `omnus.dev/blog` with a short release note for minors/majors.

## Hotfix

Branch off the previous release tag, cherry-pick the fix, bump patch, ship from the hotfix branch, fast-forward `main` if the fix applies there.

## Deprecating a flag or command

1. Land the deprecation warning in a minor: log to stderr on every invocation, mention the replacement, link the migration note.
2. Wait at least one minor.
3. Remove the flag in the next major. CHANGELOG entry must include a "Removed" section.
