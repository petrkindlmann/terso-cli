# Aider

> Last verified: 2026-05-14 against Aider 0.7x.

Aider does not have a built-in project-rules file the way Claude Code and
Cursor do. The community pattern is to point Aider at `AGENTS.md` as a
conventional context file.

## Setup

```sh
npm install -g terso-cli
cd your-project
terso init       # scaffolds AGENTS.md
```

Then run Aider with the file in its context:

```sh
aider --read AGENTS.md
```

Or add it to your `~/.aider.conf.yml`:

```yaml
read:
  - AGENTS.md
```

## Why no emit target?

Aider reads any file you put in its context. There's no per-agent format to
compile *to* — you point it at the canonical source. If Aider adopts a
dedicated rules file in the future, terso will add an emit target for it.
