# Continue

> Last verified: 2026-05-14 against Continue 0.9.x.

Continue reads project rules from `.continue/config.json` (or
`~/.continue/config.json` for user-wide). It uses a system message field rather
than a markdown file at the repo root.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init
```

Then point Continue at `AGENTS.md` via a system message in
`.continue/config.json`:

```json
{
  "systemMessage": "Project rules live in AGENTS.md at the repo root. Read it before suggesting changes.",
  "models": [
    { "title": "Claude", "provider": "anthropic", "model": "claude-3-5-sonnet" }
  ]
}
```

Continue follows links from `systemMessage` to source files, so it will read
`AGENTS.md` automatically.

## Why no emit target?

Continue's `config.json` is JSON, not markdown. Terso's wedge is "compile one
markdown source into the markdown files other agents already read." Continue
already reads any markdown file in the repo via @-references, so a separate
emit target wouldn't add value.
