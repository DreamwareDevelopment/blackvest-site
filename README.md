# blackvest-site

Marketing front door for blackvest.ai — the launch page for the merit-gated
AI-Engineer placement service. Static Astro site on Cloudflare Pages; every CTA
routes to the live funnel at https://app.blackvest.ai. No backend, no data capture.

Media in `public/media/` are generated footage masters (Higgsfield/Seedance/Kling
pipeline — see docs/superpowers/specs/2026-07-09-blackvest-launch-redesign-design.md).

Sibling repos: `blackvest-showcase` (the live case study, showcase.blackvest.ai)
and `blackvest-candidate` (private per-candidate template).

## Develop

```sh
npm install
npm run dev
```

## Build / deploy

```sh
npm run build    # static output in dist/
```

CI builds on every PR; on push to `main` it deploys `dist/` to Cloudflare Pages
(project `blackvest-site`, custom domain blackvest.ai) via the `wrangler-action`
`deploy` job in `.github/workflows/ci.yml`. Don't run `wrangler pages deploy`
by hand — it bypasses CI + branch protection.
