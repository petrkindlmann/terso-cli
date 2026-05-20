# Content calendar — Terso CLI launch window

Eight weeks around the v1.0 launch. Adjust dates once the launch date is set;
slugs and themes are stable.

## Weekly cadence

- **Tuesday** — long post (blog).
- **Thursday** — short post (LinkedIn / X thread). One tip or one observation.
- **Friday** — engagement post (reply-to-others, not broadcast).

## Plan

| Week | Tuesday (blog) | Thursday (tip) | Friday (engagement) |
|---|---|---|---|
| Week 1 (launch) | 01 — four files | "`terso emit --check` in 1 line of YAML" | reply: any AGENTS.md thread |
| Week 2 | 02 — AGENTS.md is the shared file | "5 conventions that belong in AGENTS.md" | reply: AGENTS.md governance thread |
| Week 3 | 03 — CI gate | "Exit codes are an API" | reply: MCP discussion |
| Week 4 | 04 — three Terso tools over MCP | "Trust model for local MCP servers" | reply: per-agent-config thread |
| Week 5 | 05 — packaging and boundaries | "Why we shipped Surface A first" | reply: OSS launch thread |
| Week 6 | 06 — folder config boundary | "Cursor `.cursor/rules` vs Copilot `.github/instructions/`" | reply: monorepo agent thread |
| Week 7 | 07 — multi-agent repo | "When the editor agent and the cloud agent disagree" | reply: multi-agent workflow thread |
| Week 8 | 08 — agent hooks | "Agent hooks are the new shell profile" | reply: Antigravity hooks thread |
| Week 9 | 09 — MCP after honeymoon | "MCP Tasks (SEP-1686) explained" | reply: MCP roadmap thread |
| Week 10 | 10 — what configs compile to | "Compile vs author for per-folder rules" | reply: spec evolution thread |

## Drafted posts

Launch window (weeks 1–5):

- `content/blog/01-four-files.md`
- `content/blog/02-agents-md-is-the-format.md`
- `content/blog/03-ci-gate.md`
- `content/blog/04-mcp-five-minutes.md`
- `content/blog/05-shipping-a-cli.md`

Post-launch deepening (weeks 6–10):

- `content/blog/06-folder-config-boundary.md`
- `content/blog/07-multi-agent-repo.md`
- `content/blog/08-agent-hooks.md`
- `content/blog/09-mcp-after-honeymoon.md`
- `content/blog/10-what-configs-compile-to.md`

Posts 4–10 are drafted-not-shipped at milestone close; they ship across
the 10-week launch window per the ROADMAP decision after Codex review.
Each post carries a `references:` block in frontmatter pointing at
sources from `content/REFERENCES.md`.

## Publishing destinations

- **Canonical home: `terso.dev/blog/<slug>/`** — served by
  [`petrkindlmann/terso-site`](https://github.com/petrkindlmann/terso-site),
  a Next.js app deployed via Cloudflare Workers + OpenNext. Drafts in
  this repo at `content/blog/*.md` are the *source*; publishing means
  porting them into `terso-site` (MDX under its `app/blog/` route or
  similar) and running its deploy.
- **Syndication primary: `dev.to`** with `canonical_url: https://terso.dev/blog/<slug>/`.
- **Syndication secondary: `Hashnode`** with same canonical pointer.
- **Optional reposts on omnus.dev/blog** when the topic ties directly to
  the Omnus product (post 04 MCP install, post 09 MCP after honeymoon).
  Carry canonical pointer back to terso.dev.

## Cross-promotion checklist (per post)

- [ ] In `content/blog/<file>.md`: flip `status: draft` → `status: published`
      and align `date:` with the real publish date.
- [ ] Sync the post into `petrkindlmann/terso-site` (copy MDX, update its
      content index).
- [ ] In `terso-site`: `npm run build && npx opennextjs-cloudflare build && npx wrangler deploy`.
- [ ] Verify the post renders at `https://terso.dev/blog/<slug>/`.
- [ ] Cross-post to dev.to with `canonical_url: https://terso.dev/blog/<slug>/`.
- [ ] Cross-post to Hashnode with same canonical pointer.
- [ ] X thread with the post's core idea + link.
- [ ] LinkedIn post with a different framing for that audience.
- [ ] Drop into one relevant Discord (`#claude-code`, `#cursor`, etc.)
      with context, not a copy-paste.

## Issue-response SLA reminder

During the 8-week window: 72-hour acknowledgement on any non-spam issue.
Documented in `SUPPORT.md`.
