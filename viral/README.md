# viral/

Standalone open-source artifacts incubated alongside `terso-cli`.

Per Phase 06 of milestone `v1.0-launch`: at v1.0 ship, **one** of these moves to
its own repo for launch. The rest stay incubators here, or get archived.

## Artifacts

| Artifact | Status | Target home | Why it's here |
|---|---|---|---|
| `agents-md-action/` | **selected (v1.0)** | github.com/petrkindlmann/agents-md-action | GitHub Marketplace action that gates AGENTS.md drift in PRs. |

## Why this directory?

Until each artifact has its own repo, GitHub Release, and asciinema demo, it
lives here in the terso-cli monorepo. This keeps churn low while the artifact
is still being shaped. At launch, the chosen artifact is `git subtree split`
into its own repo with full history, and the in-tree copy stays as a thin
mirror until the next release cycle.
