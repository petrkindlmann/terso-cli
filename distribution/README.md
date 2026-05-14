# distribution/

Where channel-specific manifests live before they're cut over to their
canonical homes (Homebrew tap, Scoop bucket, etc.). Treat the files here as
**source-of-truth drafts**, not the live manifests.

## Channels

| Channel | File | Canonical home at release | Status |
|---|---|---|---|
| npm | `package.json` (repo root) | npm registry | live |
| Homebrew | `distribution/homebrew/terso-cli.rb` | `petrkindlmann/homebrew-terso` (TBD) | draft |
| Scoop | `distribution/scoop/terso-cli.json` | `petrkindlmann/scoop-terso` (TBD) | draft |
| GitHub Release | none yet | `gh release` assets | per-release |

## Release workflow

When a v1.x.y is cut:

1. `npm publish` runs first — that's the source URL for both Homebrew and Scoop.
2. Compute SHA-256 of the published tarball:

   ```sh
   curl -sL https://registry.npmjs.org/terso-cli/-/terso-cli-${VERSION}.tgz | shasum -a 256
   ```

3. Update `version`, `url`, and `sha256` / `hash` in this directory.
4. Open PRs on the tap and bucket repos using these files as the canonical
   source.

Docker / Chocolatey are stretch goals — drop them first if release prep is
running long. See Phase 05 SPEC and ROADMAP.
