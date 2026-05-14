# Demo cast

The README references `docs/demo.svg`, an SVG rendering of an asciinema cast.

## Regenerate

```sh
# Record (≤30s)
asciinema rec docs/demo.cast \
  --idle-time-limit 1 \
  --command 'bash docs/demo-script.sh'

# Render to SVG (one-time install: cargo install svg-term-cli)
svg-term --in docs/demo.cast --out docs/demo.svg --window
```

## Script

`docs/demo-script.sh` is the source for the cast — keep it minimal:

```sh
#!/usr/bin/env bash
set -e
cd "$(mktemp -d)"
git init -q
sleep 0.5
echo "# Use pnpm. Write tests." > AGENTS.md
sleep 0.5
terso emit
sleep 1
ls -la CLAUDE.md .cursorrules .github/copilot-instructions.md
```

## Why SVG and not GIF?

SVG renders crisply at any size, is small enough to render inline on GitHub,
and the source `.cast` is text — diffable in PRs. GIFs lose detail at scale
and don't compress well.

> The actual `docs/demo.cast` and `docs/demo.svg` files land alongside the
> README rewrite once a real recording exists. This guide documents the
> regeneration flow so the demo can be refreshed for every major release.
