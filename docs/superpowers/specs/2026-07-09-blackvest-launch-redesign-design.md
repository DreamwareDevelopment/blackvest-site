# blackvest.ai launch redesign — design spec

**Date:** 2026-07-09 · **Status:** approved direction, pending spec review
**Repo:** `blackvest-site` (Astro SSG → Cloudflare Pages, apex `blackvest.ai`)
**Direction:** **A-composite — "The Figure"** (founder-picked from the three-direction pitch,
artifact `claude.ai/code/artifact/23ccd198-003b-43b6-aa7a-bcd1bcaade4c`, v2 video heroes)

## 1. What changes and why

The site graduates from a thesis-page-with-waitlist to the **launch front door** of a live product.
The funnel (`app.blackvest.ai`: sign-in → intake → Stage-1 screen → Stage-2 assessment → admission →
membership) is in production; the marketing site's job is now to *route qualified AI engineers into it*
with a presentation that reads like a well-funded company.

Founder-locked scope decisions (2026-07-09):

1. **Waitlist dies.** Every CTA routes to `https://app.blackvest.ai`. The `Waitlist` component,
   `functions/api/waitlist.ts`, `schema.sql`, and the D1 binding in `wrangler.toml` are removed.
2. **Full mechanic, no dollar figures.** The site explains the merit gate, the free two-stage
   assessment, admission, and membership — but publishes **no pricing and no refund-guarantee claims**
   (ADR-020 OQ#1 counsel review is still open; the apex stays claim-safe). Pricing lives inside the funnel.
3. **One cinematic page + `/verify`.** A single long-scroll flagship page; `/verify` restyled to the
   new system, content substantively unchanged.

## 2. Visual direction — "The Figure" (A-composite)

A golden particle-man in a black vest and bowtie — the **maître d' of your career** — carries the page.
The two sibling concepts are absorbed as set-pieces: the **Gate** footage anchors the merit-gate
section; the **thread-woven vest** is the brand moment (final CTA / sign-off). One graded world:
black void, gold particles, restrained luxury.

**Execution is footage-first** (founder decision after v1 canvas sketches were rejected): Higgsfield
stills → Seedance image-to-video with pinned first/last frames → seamless ambient loops served as
full-bleed `<video>` layers. No hand-rolled WebGL figure.

### Asset inventory (founder-approved masters, 2026-07-09 motion-design pass)

| Asset | Status | Use |
|---|---|---|
| **Hero loop** — figure breathing, internal particle circulation, ember shed, butler's at-ease gesture, 10s pinned loop (job `e2a4b060`, `vidA3-raw.mp4`) | **LOCKED** | Hero |
| **Loom loop** — still vest, swaying ribbons; B6 take (job `7a88a539`) half-speeded via optical-flow interpolation, chunk-seam frames blended, palindromed at energy minima → 13.8s seamless (`vidB11-loop.mp4`) | **LOCKED** | Final CTA / brand moment |
| **Threshold loop** — immovable gate, dust in the beam, two god-ray flare breaths, 8s pinned loop (job `ef2aa78f`, `vidC2-raw.mp4`) | **LOCKED** | Merit-gate set-piece |
| Figure gesture shot: open palm (mechanic section backdrop) | optional, iteration pass 2 | Section punctuation |
| Mobile treatment: static plates (art-directed crops of the stills) at <720px for v1; 9:16 `reframe` loops are an iteration-pass upgrade if quality holds | to generate | Mobile |
| OG image (1200×630 from hero plate) | to generate | Social |
| Poster JPEGs per video | to generate (ffmpeg) | LCP + fallbacks |

All video ships **muted, looped, playsinline**, H.264 MP4 (dark footage compresses to ~0.1–1MB per
8s at 720p; serve 1080p desktop / 720p small screens). Posters are the graded stills.

### Motion-design system (learned + locked during the footage pass)

- **The camera never moves in footage.** All camera grammar (push-ins, parallax) lives in CSS
  scroll choreography — deterministic, reversible, and it never compounds with scrolling.
- **Verb-first physics prompts**: named similes ("embers rise like slow campfire sparks"), one
  cyclical system + at most one accent event that decays; explicit negative constraints (what must
  NOT move/appear); never script gestures with everyday-prop associations (wrist → watch).
- **Loop mechanics**: pinned first/last frames only for gentle non-rotational motion (hero, gate).
  Rotation or big sway + a pin ⇒ the model snaps/rushes to honor it. For energetic motion:
  un-pinned take → palindrome between two energy minima (seamless by construction).
- **Post pipeline** (applied per shot, zero-credit): full-frame whip scan (per-frame diff, flag
  >1.1) → half-speed via `minterpolate` when tempo is hot → blend-replace Seedance's periodic
  chunk-seam outlier frames (every 12 source frames) → palindrome. **Never crossfade thin bright
  structures** (ribbons/beams) — dissolves read as teleports; crossfades are fine on dark diffuse
  content only.
- Known platform caveats: Seedance `speedramp:"off"` is silently ignored; expect `speedramp:auto`
  pacing and correct in post. Chunk-boundary jitter at 12-frame cadence is inherent — scan for it.

### Brand tokens (recalibrated to the footage)

```
--bg:#050505  --bg2:#0b0a09  --line:#211d17
--ink:#f2ede3  --dim:#9d968a  --mute:#5f5a52
--gold:#d4af6a  --champagne:#f0d9a8  --gold-deep:#8a6a2f
```

### Type system

- **Display:** self-hosted **Bodoni Moda** (OFL) — the didone voice of the pitch; italic is the
  concierge's emphasis. `font-display: swap`, woff2 subset, preloaded.
- **Body:** system sans stack (unchanged from current site).
- **Utility/evidence:** `ui-monospace` stack for eyebrows, micro-copy, footer, claims.
- Scale: display clamp(2.6rem→5.2rem), h2 clamp(1.8rem→2.8rem), body 1.0625rem, mono 0.68–0.82rem.

## 3. Page architecture (single scroll)

1. **Nav** — brand wordmark, `Method · Verify`, CTA pill "Start your assessment". Sticky, blur.
2. **Hero** — figure loop full-bleed, left-gradient scrim. Eyebrow `MERIT-GATED · AI ENGINEERS ONLY`;
   H1 "You can already get hired. *This is for the role you actually want.*"; sub (agentic system,
   admission earned); CTA → funnel + ghost "How it works"; micro-line "Stage 1 is free · no spam ·
   every claim traceable".
3. **The mechanic** — "An operator's system, pointed at your search." Three stages as an editorial
   sequence (01 free automated screen → 02 deep assessment → 03 membership: the system goes to work,
   you approve every send). Gesture shot (open palm) as a dimmed full-bleed backdrop under the same
   scrim treatment as the hero — consistent, not a new layout device.
4. **The merit gate** — Gate footage set-piece. "You can't buy your way in. *Passing is the point.*"
   What the gate scores: technical depth, criteria realism, reachability. Honest framing: most are
   declined; admission means we're confident we can place you. (No guarantee language.)
5. **Proof / verify** — "Proof, not promises." Traceable-claims strip (100% human-approved sends,
   0 fabricated claims, 95% automated) + links to `/verify` and `showcase.blackvest.ai`.
6. **Membership** — what admitted members get (the toolkit to ~95%, tailored applications, prep,
   pipeline, human-approval gate). No dollar figures.
7. **Final CTA** — vest-weave loop brand moment. "The vest is earned." CTA → funnel.
8. **Footer** — brand, `Verify · The system, live · GitHub`, colophon.

`/verify` keeps its content, restyled with the new tokens/type.

## 4. Motion & performance system

- **Video layers:** IntersectionObserver play/pause (never >1–2 playing); `preload="metadata"`
  below the fold, hero `preload="auto"`; poster-first paint so LCP is an image, not video frames.
- **Scroll choreography:** section reveals (opacity/translate, 0.7s cubic-bezier(.22,1,.36,1)),
  crossfade seams between video sections. CSS + ~1KB vanilla JS; **no animation framework**.
- **Reduced motion / save-data / no-JS:** posters replace videos (`prefers-reduced-motion`,
  `saveData`, `<noscript>` images); reveals disabled. The page is fully legible with zero motion.
- **Budget:** LCP < 2.0s on Fast 3G-ish CF Pages edge; total JS < 15KB; hero poster < 120KB;
  Lighthouse ≥ 90 performance / ≥ 95 accessibility on mobile + desktop.
- **A11y:** all videos `aria-hidden` decorative w/ text alternatives in copy; contrast ≥ 4.5:1 for
  body on scrims (scrim gradients are load-bearing); visible focus states; skip-to-content link.

## 5. Implementation notes

- Astro stays; zero new runtime deps. Media in `public/media/` (committed; repo is public, assets
  are ours). `site.config.ts` gains `funnelUrl: 'https://app.blackvest.ai'` and drops waitlist copy;
  proof numbers stay traceable to ADR-019 invariants.
- Delete: `src/components/Waitlist.astro`, `functions/`, `schema.sql`, D1 block in `wrangler.toml`.
  (The D1 database itself is retired manually later; existing signups are exported first — flagged
  as a founder follow-up, not a build step.)
- OG/meta refresh: og:image, twitter:card image, canonical, description aligned to new copy.
- CI/CD unchanged (push-to-main → CF Pages). Ship via PR on `launch-redesign`.
- **Out of scope:** analytics (PostHog exists for the funnel; adding it to the marketing site is a
  separate decision), pricing page, multi-page IA, blog.

## 6. Open questions (for spec review)

1. **Gesture shots** — RESOLVED 2026-07-09: the hero loop carries its own gesture (the butler's
   at-ease). One optional open-palm shot for the mechanic section is deferred to iteration pass 2.
2. **D1 waitlist export** — where should the existing signup emails go before the binding is removed?
   *Recommendation: `wrangler d1 execute … --command "select * from signups"` → founder keeps the CSV;
   the D1 database itself is left alive (unbound) until you delete it.*
3. **ADR-020 changelog amendment** — the apex upgrade reverses the 2026-05-31 "no interview CTA"
   posture (founder-authorized today). Recorded as a vault changelog PR at ship time. OK?

## 7. Acceptance criteria

- Waitlist fully removed; all CTAs resolve to `https://app.blackvest.ai` (200, funnel renders).
- The three video loops play/pause correctly per viewport; posters render under reduced-motion.
- No pricing or guarantee language anywhere on the site.
- Lighthouse: perf ≥ 90, a11y ≥ 95, best-practices ≥ 95 (mobile + desktop).
- `/verify` restyled, links intact.
- Three iteration passes completed and logged before merge.
- Live verification on `blackvest.ai` post-deploy (CD auto-deploys main).
