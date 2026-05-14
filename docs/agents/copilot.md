# GitHub Copilot

> Last verified: 2026-05-14 against Copilot for VS Code.

Copilot reads project rules from `.github/copilot-instructions.md`. `terso emit`
writes that file from your canonical `AGENTS.md`.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init
terso emit --targets copilot
```

Copilot picks up `.github/copilot-instructions.md` on next request.

## CI gate

```yaml
- run: npx terso-cli emit --check --targets copilot
```

## Tip

If your repo has both Copilot in VS Code and GitHub Copilot in pull request
review, the same file feeds both. Update once, applied everywhere.
