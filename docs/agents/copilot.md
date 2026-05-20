# GitHub Copilot

> Last verified: 2026-05-20 against Copilot for VS Code and Copilot code review.

Copilot reads project rules from two places:

- **`.github/copilot-instructions.md`** — single-file, repo-wide instructions.
  `terso emit` writes this from your canonical `AGENTS.md`.
- **`.github/instructions/*.instructions.md`** — newer per-path instruction
  system. Each file specifies an `applyTo:` glob in its frontmatter and
  applies only to matching paths. **Terso does not emit here** — these are
  scoped by design.
- Copilot has also supported `AGENTS.md` natively since August 2025, so the
  same `AGENTS.md` you author for the rest of your toolchain feeds Copilot
  directly when no `.github/copilot-instructions.md` is present.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init
terso emit --targets copilot
```

Copilot picks up `.github/copilot-instructions.md` on next request.

## Where each surface reads from

| Copilot surface | Reads |
|---|---|
| In-editor completions / chat (VS Code, JetBrains, etc.) | `.github/copilot-instructions.md`, `.github/instructions/*.instructions.md`, or `AGENTS.md` |
| Copilot code review (PR review) | Same set — instructions inform review comments. |
| Copilot coding agent (opens PRs) | Same set — agent operates from the same instructions a human reviewer would see. |

Same source → all three surfaces. The `terso emit --check` gate keeps the
coding agent, the review bot, and your developers reading the same
instructions.

## CI gate

```yaml
- run: npx terso-cli@1 emit --check --targets copilot
```

## When to use per-path instructions

Use `.github/instructions/*.instructions.md` for guidance that applies only
inside a specific path — e.g., test files, generated code, or a particular
service in a monorepo. Repo-wide truths stay in `AGENTS.md`.
