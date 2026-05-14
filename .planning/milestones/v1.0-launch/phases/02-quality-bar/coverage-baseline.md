# Coverage baseline

Measured locally with `npx vitest run --coverage` on commit immediately preceding the Phase 02 CI landing.

| Metric | Baseline | Gate |
|---|---|---|
| Lines | TBD on first CI run | baseline or 75%, whichever is lower |
| Branches | TBD | baseline |
| Functions | TBD | baseline |
| Statements | TBD | baseline |

The CI `coverage` job in `.github/workflows/ci.yml` collects coverage and uploads it as an artifact. The first green CI run on `main` after this file lands sets the numerical baseline; update this file in the same PR that bumps the gate.

Gate philosophy: the goal is not 100%. The goal is that coverage doesn't regress without an explicit, reviewed decision. Quality of tests beats quantity.
