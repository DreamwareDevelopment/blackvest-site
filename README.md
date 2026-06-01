# blackvest-site

Marketing front door for **blackvest.ai** (apex). Brand + thesis + waitlist for
AI Engineers using AI to land AI-Engineering roles. Astro SSG on Cloudflare
Pages; the waitlist is a Pages Function writing to D1.

**Scope guardrail:** this page makes NO pricing, guarantee, or "start your
interview" claims. blackvest.ai's commercial mechanic (ADR-020) has unresolved
legal questions (refund-guarantee liability, employment-agency licensing); the
full product/lead-gen page is a later, ADR-gated plan. This page sells the
thesis + brand and captures interest only.

Sibling repos: `blackvest-showcase` (the live case study, showcase.blackvest.ai)
and `blackvest-candidate` (private per-candidate template).

## Develop / build / deploy

```sh
npm install
npm run dev
npm run build                                   # → dist/
npx wrangler pages dev dist                     # local, with the Function + D1
npx wrangler pages deploy dist --project-name blackvest-site --branch main
```

## Waitlist data
Signups land in the `blackvest_waitlist` D1 database (`signups` table). Email is
PII: stored only in D1, never logged, never committed.

## License
[MIT](LICENSE).
