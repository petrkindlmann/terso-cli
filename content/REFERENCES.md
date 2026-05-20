# External references used in launch content

Tracked here so future editors can verify facts before re-shipping. Frontmatter `references:` on each post points at the primary sources for that post's claims.

## Ecosystem state (May 2026)

| Claim | Source |
|---|---|
| AGENTS.md adopted by 60,000+ open-source projects | https://agents.md/ ; https://github.com/agentsmd/agents.md |
| Stewarded by the Agentic AI Foundation (Linux Foundation); OpenAI contributed the spec | https://www.cdomagazine.tech/aiml/agentic-ai-foundation-launched-to-advance-open-standards |
| Native AGENTS.md support in OpenAI Codex, GitHub Copilot (Aug 2025), Cursor, Jules/Gemini, Factory, Amp, Windsurf, Zed | https://developers.openai.com/codex/guides/agents-md ; https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/ |
| RooCode shut down its agent product on May 15, 2026 — drop from live-client tables | https://docs.roocode.com/ |
| AGENTS.md v1.1 proposal — layering, discovery, progressive disclosure | https://github.com/agentsmd/agents.md/issues/135 |
| 35–55% fewer agent-generated bugs in repos with curated AGENTS.md | Community leaderboards aggregated in https://agents.md/ and https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/ |

## MCP state (May 2026)

| Claim | Source |
|---|---|
| 500+ public MCP servers; SDKs in TS/Py/C#/Java/Swift; backed by Anthropic, OpenAI, Google DeepMind | https://github.com/modelcontextprotocol/servers ; https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ |
| 2026 roadmap: production scaling, enterprise readiness, governance, agent lifecycle | https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ ; https://thenewstack.io/model-context-protocol-roadmap-2026/ |
| MCP v1.27 release | https://www.contextstudios.ai/blog/mcp-ecosystem-in-2026-what-the-v127-release-actually-tells-us |

## Agent clients (May 2026)

| Claim | Source |
|---|---|
| Claude Code runs on Opus 4.7; 5-hour limits doubled on May 6 (Pro/Max/Team/Enterprise) | https://duet.so/blog/claude-code-vs-cursor-vs-codex ; https://thenewstack.io/ai-coding-tool-stack/ |
| Cursor Composer 2.5 shipped May 18 ($0.50/M in, $2.50/M out) | https://duet.so/blog/claude-code-vs-cursor-vs-codex |
| Codex CLI: multi-day automations | https://duet.so/blog/claude-code-vs-cursor-vs-codex |
| Antigravity 2.0 shipped May 19 — dynamic subagents, Antigravity CLI in Go, public SDK | https://lushbinary.com/blog/ai-coding-agents-comparison-cursor-windsurf-claude-copilot-kiro-2026/ |

## Per-folder rule systems (May 2026)

| Claim | Source |
|---|---|
| Cursor per-folder rules at `.cursor/rules/*.mdc`, glob-scoped via `globs:` frontmatter | https://docs.cursor.com/en/context |
| Copilot per-path instructions at `.github/instructions/*.instructions.md`, scoped via `applyTo:` frontmatter | https://docs.github.com/en/copilot/reference/custom-instructions-support |
| Antigravity 2.0 ships JSON-shaped hooks (May 19, 2026) | https://antigravity.google/blog/introducing-google-antigravity-2-0 |
| Claude Code hooks specification | https://docs.anthropic.com/en/docs/claude-code/hooks |
| MCP Tasks primitive — currently experimental, SEP-1686 | https://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/ |

## How to refresh

- When updating a blog post, re-run the equivalent web search for May 2026 → today and replace stale numbers/dates.
- If a source moves or 404s, replace the link with an archive.org capture rather than deleting the citation.
- Numbers change fast — re-verify any quantitative claim ("60,000+ repos", "35-55% fewer bugs") before re-publishing.
