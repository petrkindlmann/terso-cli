# terso.dev

This directory builds `terso.dev` — landing page + blog for `terso-cli`.

## Stack

- **[Astro](https://astro.build)** v5 with content collections.
- Markdown for posts (read directly from `../content/blog/` — single source of truth, no duplication).
- Deployed to **GitHub Pages** via `.github/workflows/deploy-site.yml`.
- DNS: `terso.dev` (Cloudflare) → GitHub Pages via `CNAME` in `public/`.

## Local dev

```sh
cd site
npm install
npm run dev                       # http://localhost:4321
PUBLIC_SHOW_DRAFTS=1 npm run dev  # show draft posts (default-hidden in prod)
```

## Build

```sh
npm run build      # writes to dist/
npm run preview    # serve dist/ for verification
```

## Content

Blog posts live at `../content/blog/*.md`. Frontmatter schema is enforced
by `src/content.config.ts`. Required fields:

```yaml
---
title: "Post title"
date: 2026-05-20
slug: optional-override-slug   # defaults to filename
tags: [agents-md, cli]
status: draft                   # 'draft' hides on production
note: "Optional callout banner"
references:
  - https://source.example/
---
```

Posts with `status: draft` only render in dev mode or when
`PUBLIC_SHOW_DRAFTS=1`. Flip to `status: published` at publish time.

## Deploy

Push to `main`. The `deploy-site` workflow builds and publishes via
GitHub Pages. The `CNAME` file ensures Pages serves at `terso.dev` once
DNS is pointed there (Cloudflare → GitHub Pages CNAME records).

## DNS setup (one-time)

On Cloudflare for `terso.dev`:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | @ | 185.199.108.153 | DNS-only |
| A | @ | 185.199.109.153 | DNS-only |
| A | @ | 185.199.110.153 | DNS-only |
| A | @ | 185.199.111.153 | DNS-only |
| CNAME | www | petrkindlmann.github.io | DNS-only |

(Use Cloudflare proxy mode only after enabling "Always Use HTTPS" + a
Cloudflare origin cert; GitHub Pages handles TLS natively when DNS-only.)

Then in the GitHub repo: Settings → Pages → Custom domain → `terso.dev`,
and enable HTTPS once the cert provisions (~30s).
