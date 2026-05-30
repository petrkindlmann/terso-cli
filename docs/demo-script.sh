#!/usr/bin/env bash
# Source for docs/demo.cast — see docs/demo.md to regenerate the SVG.
# Tells the CI-gate story: emit → drift caught → re-emit → gate passes.
set -e
cd "$(mktemp -d)"
git init -q
sleep 0.6

printf '# Use pnpm. Money is integer cents, never float. Write tests.\n' > AGENTS.md
sleep 0.6

terso emit
sleep 1.2

# A teammate hand-edits a generated file; AGENTS.md is the source of truth.
printf '\n- extra rule\n' >> .cursorrules
sleep 0.6

# CI gate catches the divergence and fails.
terso emit --check || true
sleep 1.2

# Re-sync from the single source, gate passes.
terso emit && terso emit --check
sleep 1
