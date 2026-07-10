# blackvest.ai Launch Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the launch front door: cinematic single page built on the three locked footage
masters, waitlist removed, every CTA into `https://app.blackvest.ai`, `/verify` restyled.

**Architecture:** Astro static site (unchanged) on Cloudflare Pages. A reusable `SceneVideo`
full-bleed layer renders the locked loops with poster/mobile/reduced-motion fallbacks and an
IntersectionObserver play-pause controller. New tokens (footage-calibrated gold) + self-hosted
variable Bodoni Moda carry the identity. Sections: Nav → Hero → Mechanic → MeritGate → Proof →
Membership → FinalCta → footer.

**Tech Stack:** Astro ^4 (static output), vanilla JS (<15KB), CSS custom properties, H.264 MP4,
woff2 variable fonts. No new npm dependencies.

## Global Constraints (from the spec — verbatim)

- Every CTA routes to `https://app.blackvest.ai`; the waitlist (component, Pages Function,
  `schema.sql`, D1 binding) is removed.
- **No pricing numbers and no refund-guarantee claims anywhere on the site.**
- One cinematic page + `/verify`; no other routes.
- Footage is camera-locked; ALL motion grammar in CSS/JS is light choreography only — section
  reveals; **no pinned scenes, no scroll-scrubbing** (scrollytelling declined 2026-07-10).
- **Never interpolate or crossfade thin bright structures**; videos ship as native-frame masters.
- Reduced-motion / save-data / no-JS / <720px: posters and stills instead of video; page fully
  legible with zero motion.
- Budgets: total JS < 15KB; hero poster < 120KB; Lighthouse (mobile+desktop) perf ≥ 90, a11y ≥ 95,
  best-practices ≥ 95. LCP is the hero poster image, never video frames (hence `preload="none"`
  everywhere + instant IO src-attach for the hero — a deliberate refinement of spec §4).
- Videos: muted, loop, playsinline, `preload="none"` + lazy src attach; ≤ 2 playing concurrently.
- Proof numbers stay exactly: `95% of the work, automated` / `100% human-approved before send` /
  `0 fabricated claims, ever` (traceable to ADR-019 invariants).
- Palette: bg `#050505` panel `#0b0a09` line `#211d17` ink `#f2ede3` dim `#9d968a` mute `#5f5a52`
  gold `#d4af6a` champagne `#f0d9a8` gold-deep `#8a6a2f`.
- Display face: self-hosted variable **Bodoni Moda** (latin, roman+italic), `font-display: swap`.
- Repo stays MIT/public: no candidate PII, no secrets; media assets are our own generated footage.

## File Structure

```
public/
  fonts/bodoni-moda-latin.woff2            (new — variable roman)
  fonts/bodoni-moda-italic-latin.woff2     (new — variable italic)
  media/hero-{1080,720}.mp4  hero-poster.jpg  hero-mobile.jpg      (new)
  media/gate-{1080,720}.mp4  gate-poster.jpg  gate-mobile.jpg      (new)
  media/loom-{1080,720}.mp4  loom-poster.jpg  loom-mobile.jpg      (new)
  media/og.jpg                                                     (new)
src/
  site.config.ts               (modify — funnelUrl, no waitlist copy)
  styles/tokens.css            (rewrite — footage-calibrated system)
  styles/global.css            (rewrite — fonts, buttons, scenes, reveal)
  layouts/BaseLayout.astro     (modify — font preload, og meta, skip link)
  components/Nav.astro         (modify — links + funnel CTA)
  components/SceneVideo.astro  (new — full-bleed footage layer + controller)
  components/Hero.astro        (rewrite — hero scene)
  components/Mechanic.astro    (new — replaces HowItWorks.astro)
  components/MeritGate.astro   (new — gate set-piece)
  components/ProofStrip.astro  (modify — restyle, same numbers)
  components/Membership.astro  (new)
  components/FinalCta.astro    (new — loom scene)
  pages/index.astro            (modify — section order, footer)
  pages/verify.astro           (modify — minor: inherits new system)
DELETED: src/components/Waitlist.astro, src/components/HowItWorks.astro,
         functions/api/waitlist.ts (and functions/), schema.sql, wrangler.toml D1 block
```

There is no JS test framework in this repo (static site). Each task's test cycle is:
`npm run build` (must succeed) + explicit `grep` assertions against `dist/` + (where noted)
headless-Chrome screenshots. Run all commands from the worktree root
`/Users/zander/Documents/Dreamware-Holdings/code/blackvest-site-launch`.

---

### Task 1: Media + font assets into `public/`

**Files:**
- Create: `public/media/*` (13 files), `public/fonts/*.woff2` (2 files)

**Interfaces:**
- Produces: the exact asset paths listed in File Structure; every later component references them
  as `/media/<name>` and `/fonts/<name>`.

- [ ] **Step 1: Copy the locked renditions from the session scratchpad**

The masters were produced and founder-approved in-session (spec §2 provenance). The staging dir
is `$SCRATCH/assets-out` where
`SCRATCH=/private/tmp/claude-501/-Users-zander-git-repos-Second-Brain/2a070833-b101-4974-908a-5b57f19ffc73/scratchpad`.
If staging is absent, regenerate from the masters in `$SCRATCH` (`vidA3-raw.mp4` = hero,
`vidB14-loop.mp4` = loom, `vidC2-raw.mp4` = gate) with these exact commands:

```bash
SCRATCH=/private/tmp/claude-501/-Users-zander-git-repos-Second-Brain/2a070833-b101-4974-908a-5b57f19ffc73/scratchpad
mkdir -p public/media public/fonts
cp "$SCRATCH"/assets-out/media/* public/media/
# regeneration reference (only if staging is missing) — repeat per pair {hero:vidA3-raw, loom:vidB14-loop, gate:vidC2-raw}:
#   ffmpeg -i $SRC -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -movflags +faststart public/media/$N-1080.mp4
#   ffmpeg -i $SRC -an -vf scale=1280:720 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -movflags +faststart public/media/$N-720.mp4
#   ffmpeg -i $SRC -vf "select=eq(n\,0),scale=1600:-2" -frames:v 1 -q:v 3 public/media/$N-poster.jpg
# mobile stills from the graded plates (crop offsets tuned per plate):
#   ffmpeg -i artA.png -vf "crop=ih*9/16:ih:iw*0.52:0,scale=900:1600" -q:v 3 public/media/hero-mobile.jpg
#   ffmpeg -i artC.png -vf "crop=ih*9/16:ih:iw*0.42:0,scale=900:1600" -q:v 3 public/media/gate-mobile.jpg
#   ffmpeg -i artB.png -vf "crop=ih*9/16:ih:iw*0.30:0,scale=900:1600" -q:v 3 public/media/loom-mobile.jpg
#   ffmpeg -i artA.png -vf "crop=iw:iw*630/1200:0:ih*0.12,scale=1200:630" -q:v 3 public/media/og.jpg
```

- [ ] **Step 2: Download the variable Bodoni Moda latin woff2 (roman + italic)**

```bash
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
CSS=$(curl -s -H "User-Agent: $UA" "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..800;1,6..96,400..800&display=swap")
python3 - "$CSS" <<'EOF'
import re, sys, urllib.request
css = sys.argv[1]
blocks = re.findall(r'/\* latin \*/\s*@font-face\s*{([^}]+)}', css)
assert len(blocks) == 2, f"expected 2 latin blocks, got {len(blocks)}"
for block in blocks:
    url = re.search(r'url\((https://[^)]+\.woff2)\)', block).group(1)
    italic = 'font-style: italic' in block
    out = 'public/fonts/bodoni-moda-italic-latin.woff2' if italic else 'public/fonts/bodoni-moda-latin.woff2'
    urllib.request.urlretrieve(url, out)
    print('saved', out)
EOF
```

- [ ] **Step 3: Verify the assets**

```bash
ls -la public/media public/fonts
# expect 13 media files + 2 woff2; then check budgets:
du -h public/media/hero-poster.jpg   # must be < 120K (re-encode with -q:v 5 if over)
du -sh public/media                  # sanity: total under ~25MB
file public/fonts/*.woff2            # both report "Web Open Font Format (Version 2)"
```

- [ ] **Step 4: Commit**

```bash
git add public/media public/fonts
git commit -m "assets: locked footage renditions (hero/gate/loom), posters, mobile plates, og, Bodoni Moda"
```

---

### Task 2: Remove the waitlist (infra + config + copy)

**Files:**
- Delete: `src/components/Waitlist.astro`, `functions/api/waitlist.ts`, `schema.sql`
- Modify: `wrangler.toml`, `src/site.config.ts`, `src/pages/index.astro`, `README.md`

**Interfaces:**
- Produces: `site.funnelUrl: string` (`https://app.blackvest.ai`) — every CTA consumes this.
- Consumes: nothing.

- [ ] **Step 1: Delete waitlist files**

```bash
git rm src/components/Waitlist.astro functions/api/waitlist.ts schema.sql
rmdir functions/api functions 2>/dev/null || true
```

- [ ] **Step 2: Drop the D1 block from `wrangler.toml`** — full new content:

```toml
name = "blackvest-site"
compatibility_date = "2026-05-01"
pages_build_output_dir = "dist"
```

- [ ] **Step 3: Rewrite `src/site.config.ts`** — full new content:

```ts
/**
 * site.config.ts: blackvest.ai marketing front door.
 *
 * Launch posture (2026-07-09 spec): full mechanic, NO dollar figures and NO
 * refund-guarantee claims (ADR-020 OQ#1 pending counsel). Every CTA routes to
 * the live funnel. Never imports the vault.
 */
export interface SiteConfig {
  name: string;
  tagline: string;
  origin: string;
  funnelUrl: string;
  showcaseUrl: string;
  /** Proof-strip claims. Each MUST trace to a real system fact (ADR-019 invariants). */
  proof: { n: string; label: string }[];
}

export const site: SiteConfig = {
  name: 'blackvest',
  tagline: 'The role you actually want has a gate.',
  origin: 'https://blackvest.ai',
  funnelUrl: 'https://app.blackvest.ai',
  showcaseUrl: 'https://showcase.blackvest.ai',
  // Verified against the real system (ADR-019 invariants + the live showcase):
  //  - human-approval gate before every send → "100% human-approved"
  //  - no-fabricate-metrics rule → "0 fabricated claims"
  //  - agent does ~95% of the work, human gates the send → "95% automated"
  proof: [
    { n: '95%', label: 'of the work, automated' },
    { n: '100%', label: 'human-approved before send' },
    { n: '0', label: 'fabricated claims, ever' },
  ],
};
```

- [ ] **Step 4: Remove the Waitlist import/usage from `src/pages/index.astro`**

Delete the two lines `import Waitlist from "../components/Waitlist.astro";` and `<Waitlist />`
(the full index rewrite happens in Task 6; this keeps the build green now).

- [ ] **Step 5: Update `README.md`** — full new content:

```markdown
# blackvest-site

Marketing front door for blackvest.ai — the launch page for the merit-gated
AI-Engineer placement service. Static Astro site on Cloudflare Pages; every CTA
routes to the live funnel at https://app.blackvest.ai. No backend, no data capture.

Media in `public/media/` are generated footage masters (Higgsfield/Seedance/Kling
pipeline — see docs/superpowers/specs/2026-07-09-blackvest-launch-redesign-design.md).

## Develop

    npm install
    npm run dev

## Build / deploy

    npm run build    # static output in dist/

CI builds on every PR; on push to main it deploys dist/ to Cloudflare Pages
(project `blackvest-site`, custom domain blackvest.ai).
```

- [ ] **Step 6: Verify**

```bash
npm run build
grep -ri "waitlist" dist/ && echo "FAIL: waitlist survived" || echo "OK: no waitlist in output"
```
Expected: build succeeds; "OK: no waitlist in output".

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: retire the waitlist — CTAs route to the live funnel (app.blackvest.ai)"
```

---

### Task 3: Design system — tokens, global styles, BaseLayout

**Files:**
- Rewrite: `src/styles/tokens.css`, `src/styles/global.css`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: CSS custom properties (`--bg --bg2 --line --line2 --ink --dim --mute --gold
  --champagne --gold-deep --gold-dim --serif --sans --mono --fs-display --fs-h2 --fs-h3
  --fs-body --fs-small --lh-tight --lh-snug --lh-body --tracking-cap --s-1..--s-32 --maxw
  --maxw-prose --radius --ease`), utility classes (`.wrap .section .eyebrow .dim .mute .lede
  .btn-p .btn-s .micro .reveal .sr-only .skip`), scene classes (`.scene .scene__video
  .scene__still .scene__scrim--left/--center/--right .scene--rm`), and
  `<BaseLayout title description>` slots.

- [ ] **Step 1: Rewrite `src/styles/tokens.css`** — full content:

```css
/*
 * tokens.css — blackvest.ai launch system.
 * Calibrated to the locked footage: black void, particle gold, champagne highlights.
 * Display voice: variable Bodoni Moda (self-hosted, latin). Single dark theme by design.
 */
:root {
  --bg:#050505; --bg2:#0b0a09; --line:#211d17; --line2:#15120d;
  --ink:#f2ede3; --dim:#9d968a; --mute:#5f5a52;
  --gold:#d4af6a; --champagne:#f0d9a8; --gold-deep:#8a6a2f;
  --gold-dim:rgba(212,175,106,.14);

  --serif:"Bodoni Moda","Bodoni 72",Didot,Georgia,serif;
  --sans:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  --mono:ui-monospace,"SF Mono","JetBrains Mono",Menlo,Consolas,monospace;

  --fs-display:clamp(2.7rem,6.4vw,5.4rem);
  --fs-h2:clamp(1.9rem,3.6vw,3rem);
  --fs-h3:clamp(1.15rem,2vw,1.4rem);
  --fs-body:1.0625rem;
  --fs-small:.9rem;

  --lh-tight:1.04; --lh-snug:1.35; --lh-body:1.6;
  --tracking-cap:.24em;

  --s-1:.25rem; --s-2:.5rem; --s-3:.75rem; --s-4:1rem; --s-6:1.5rem;
  --s-8:2rem; --s-12:3rem; --s-16:4rem; --s-24:6rem; --s-32:8rem;

  --maxw:74rem; --maxw-prose:44rem;
  --radius:2px;
  --ease:cubic-bezier(.22,1,.36,1);
}
@media (prefers-reduced-motion: reduce) {
  * { animation:none !important; transition:none !important; scroll-behavior:auto !important; }
}
```

- [ ] **Step 2: Rewrite `src/styles/global.css`** — full content:

```css
@import "./tokens.css";

/* self-hosted variable Bodoni Moda (latin) — OFL, downloaded at asset time */
@font-face {
  font-family:"Bodoni Moda";
  src:url("/fonts/bodoni-moda-latin.woff2") format("woff2");
  font-weight:400 800; font-style:normal; font-display:swap;
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}
@font-face {
  font-family:"Bodoni Moda";
  src:url("/fonts/bodoni-moda-italic-latin.woff2") format("woff2");
  font-weight:400 800; font-style:italic; font-display:swap;
  unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD;
}

*,*::before,*::after { box-sizing:border-box; }
html { scroll-behavior:smooth; -webkit-text-size-adjust:100%; scroll-padding-top:5rem; }
body {
  margin:0; background:var(--bg); color:var(--ink);
  font-family:var(--sans); font-size:var(--fs-body); line-height:var(--lh-body);
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
h1,h2,h3 { font-family:var(--serif); font-weight:475; line-height:var(--lh-tight);
  letter-spacing:.005em; margin:0; text-wrap:balance; }
h1 em,h2 em { font-style:italic; color:var(--champagne); }
p { margin:0; }
a { color:var(--gold); text-decoration:none; }
a:hover { text-decoration:underline; text-underline-offset:3px; }
::selection { background:var(--gold); color:#0a0805; }
:focus-visible { outline:2px solid var(--gold); outline-offset:3px; border-radius:3px; }

.sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px;
  overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }
.skip { position:fixed; top:-3rem; left:1rem; z-index:100; background:var(--gold);
  color:#0a0805; padding:.6rem 1rem; border-radius:var(--radius); transition:top .2s; }
.skip:focus { top:1rem; }

.wrap { width:100%; max-width:var(--maxw); margin-inline:auto;
  padding-inline:clamp(1.25rem,4vw,2.5rem); }
.section { padding-block:var(--s-24); position:relative; }
.eyebrow { display:inline-flex; align-items:center; gap:.7rem; font-family:var(--mono);
  font-size:.72rem; letter-spacing:var(--tracking-cap); text-transform:uppercase; color:var(--gold); }
.eyebrow::before { content:""; width:2rem; height:1px; background:var(--gold); }
.dim { color:var(--dim); } .mute { color:var(--mute); }
.lede { font-size:clamp(1.05rem,1.7vw,1.3rem); line-height:var(--lh-snug); color:var(--dim); }
.micro { font-family:var(--mono); font-size:.7rem; letter-spacing:.05em; color:var(--mute); }

.btn-p { background:var(--gold); color:#0a0805; font-weight:600; font-size:.95rem;
  padding:.9rem 1.7rem; border-radius:var(--radius); display:inline-block; border:0; cursor:pointer; }
.btn-p:hover { background:var(--champagne); text-decoration:none; }
.btn-s { border:1px solid #2c2820; color:var(--ink); font-size:.95rem; padding:.9rem 1.5rem;
  border-radius:var(--radius); display:inline-flex; gap:.5rem; align-items:center; }
.btn-s:hover { border-color:var(--gold); text-decoration:none; }

/* ── full-bleed footage layer ─────────────────────────────────────────── */
.scene { position:absolute; inset:0; overflow:hidden; pointer-events:none; background:#000; }
.scene__video { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:none; }
.scene__still { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
@media (min-width:720px) and (prefers-reduced-motion: no-preference) {
  .scene__video { display:block; }
  .scene:not(.scene--rm) .scene__still { display:none; }
}
.scene--rm .scene__video { display:none; }
.scene--rm .scene__still { display:block; }
.scene__scrim { position:absolute; inset:0; }
.scene__scrim--left { background:linear-gradient(90deg,rgba(5,5,5,.9) 18%,rgba(5,5,5,.5) 46%,rgba(5,5,5,.08) 70%); }
.scene__scrim--right { background:linear-gradient(270deg,rgba(5,5,5,.9) 18%,rgba(5,5,5,.5) 46%,rgba(5,5,5,.08) 70%); }
.scene__scrim--center { background:linear-gradient(180deg,rgba(5,5,5,.7),rgba(5,5,5,.3) 34%,rgba(5,5,5,.3) 62%,rgba(5,5,5,.88)); }
/* every scene fades into the page ground at its edges */
.scene::after { content:""; position:absolute; inset:0;
  background:linear-gradient(180deg,rgba(5,5,5,.55),transparent 18%,transparent 82%,rgba(5,5,5,.92)); }

/* ── reveal choreography (light; no pinning, no scrubbing) ────────────── */
.reveal { opacity:1; }
@media (prefers-reduced-motion: no-preference) {
  .js .reveal { opacity:0; transform:translateY(16px);
    transition:opacity .7s var(--ease), transform .7s var(--ease); }
  .js .reveal.in { opacity:1; transform:none; }
  .js .reveal[data-d="1"] { transition-delay:.08s; }
  .js .reveal[data-d="2"] { transition-delay:.16s; }
  .js .reveal[data-d="3"] { transition-delay:.24s; }
}

@media (max-width:640px) {
  .section { padding-block:var(--s-16); }
  .btn-p,.btn-s { width:100%; justify-content:center; text-align:center; padding-block:1rem; }
}
```

- [ ] **Step 3: Rewrite `src/layouts/BaseLayout.astro`** — full content:

```astro
---
import "../styles/global.css";
import { site } from "../site.config";

interface Props { title?: string; description?: string; }
const {
  title = `${site.name} — ${site.tagline}`,
  description = "BlackVest is an agentic placement system that interviews AI Engineers on merit before it goes to work for them. Admission is earned. Stage 1 is free.",
} = Astro.props;
const og = `${site.origin}/media/og.jpg`;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="generator" content={Astro.generator} />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="canonical" href={new URL(Astro.url.pathname, site.origin).href} />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:image" content={og} />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content={og} />
    <meta name="theme-color" content="#050505" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="preload" href="/fonts/bodoni-moda-latin.woff2" as="font" type="font/woff2" crossorigin />
    <link rel="preload" href="/fonts/bodoni-moda-italic-latin.woff2" as="font" type="font/woff2" crossorigin />
  </head>
  <body>
    <a class="skip" href="#main">Skip to content</a>
    <slot />
    <script is:inline>
      document.documentElement.classList.add("js");
      (function () {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        var io = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
        }, { rootMargin: "0px 0px -10% 0px", threshold: 0.08 });
        document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
      })();
    </script>
  </body>
</html>
```

- [ ] **Step 4: Verify**

```bash
npm run build
grep -o "bodoni-moda-latin.woff2" dist/index.html | head -1        # preload present
grep -o 'og.jpg' dist/index.html | head -1                          # og image wired
```
Expected: build succeeds, both greps match. (Old components still compile against the new
utility classes — `.btn-p/.btn-s/.eyebrow/.reveal` names are unchanged.)

- [ ] **Step 5: Commit**

```bash
git add src/styles src/layouts
git commit -m "feat: launch design system — footage-calibrated tokens, Bodoni Moda, scene + reveal layers"
```

---

### Task 4: SceneVideo component + Nav + Hero

**Files:**
- Create: `src/components/SceneVideo.astro`
- Rewrite: `src/components/Nav.astro`, `src/components/Hero.astro`

**Interfaces:**
- Consumes: `site.funnelUrl` (Task 2), scene/utility CSS (Task 3), `/media/*` (Task 1).
- Produces: `<SceneVideo name scrim label priority? />` where `name ∈ {"hero","gate","loom"}`,
  `scrim ∈ {"left","center","right"}` (default `"left"`), `label: string` (screen-reader text),
  `priority?: boolean` (eager poster for the LCP scene). Sections place it as the first child
  of a `position:relative` container.

- [ ] **Step 1: Create `src/components/SceneVideo.astro`** — full content:

```astro
---
/**
 * Full-bleed footage layer. Desktop: lazy-attached looping MP4 (1080p wide /
 * 720p narrow) with IntersectionObserver play-pause. Mobile (<720px),
 * reduced-motion, save-data, or no-JS: graded still, zero motion.
 * The footage is decorative — `label` carries the meaning for screen readers.
 */
interface Props {
  name: "hero" | "gate" | "loom";
  scrim?: "left" | "center" | "right";
  label: string;
  priority?: boolean;
}
const { name, scrim = "left", label, priority = false } = Astro.props;
---
<div class="scene" data-scene>
  <picture>
    <source media="(min-width: 720px)" srcset={`/media/${name}-poster.jpg`} />
    <img
      class="scene__still"
      src={`/media/${name}-mobile.jpg`}
      alt=""
      loading={priority ? "eager" : "lazy"}
      fetchpriority={priority ? "high" : "auto"}
      decoding="async"
    />
  </picture>
  <video
    class="scene__video"
    muted
    loop
    playsinline
    preload="none"
    poster={`/media/${name}-poster.jpg`}
    aria-hidden="true"
    tabindex="-1"
    data-desktop={`/media/${name}-1080.mp4`}
    data-narrow={`/media/${name}-720.mp4`}
  ></video>
  <div class={`scene__scrim scene__scrim--${scrim}`} aria-hidden="true"></div>
  <span class="sr-only">{label}</span>
</div>

<script>
  // Astro dedupes this module across SceneVideo instances — it runs once.
  const rm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const conn = (navigator as any).connection;   // nonstandard; feature-detect
  const saveData = !!(conn && conn.saveData);
  const small = matchMedia("(max-width: 719px)").matches;

  if (rm || saveData || small) {
    document.querySelectorAll<HTMLElement>("[data-scene]").forEach((s) => s.classList.add("scene--rm"));
  } else {
    const narrow = matchMedia("(max-width: 1279px)").matches;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) {
            if (!v.currentSrc && !v.src) {
              v.src = narrow ? v.dataset.narrow! : v.dataset.desktop!;
              v.load();
            }
            const p = v.play();
            if (p) p.catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { rootMargin: "30% 0px" }
    );
    document.querySelectorAll<HTMLVideoElement>("video.scene__video").forEach((v) => io.observe(v));
  }
</script>
```

- [ ] **Step 2: Rewrite `src/components/Nav.astro`** — full content:

```astro
---
import { site } from "../site.config";
---
<header class="nav">
  <div class="wrap nav__inner">
    <a class="nav__brand" href="/#top"><span class="nav__mark" aria-hidden="true"></span>{site.name}</a>
    <nav class="nav__links" aria-label="Sections">
      <a href="/#method">The method</a>
      <a href="/#gate">The gate</a>
      <a href="/verify">Verify</a>
      <a href={site.funnelUrl} class="nav__cta">Start your assessment</a>
    </nav>
  </div>
</header>
<style>
  .nav { position:sticky; top:0; z-index:50; height:4.5rem; display:flex; align-items:center;
    background:color-mix(in srgb, var(--bg) 72%, transparent);
    backdrop-filter:saturate(140%) blur(10px); border-bottom:1px solid var(--line2); }
  .nav__inner { display:flex; align-items:center; justify-content:space-between; }
  .nav__brand { display:inline-flex; align-items:center; gap:.6rem; color:var(--ink);
    font-family:var(--mono); font-weight:600; letter-spacing:.14em; text-transform:uppercase; font-size:.82rem; }
  .nav__brand:hover { text-decoration:none; color:var(--champagne); }
  .nav__mark { width:.85rem; height:.85rem; border-radius:2px; background:var(--gold);
    box-shadow:0 0 0 3px var(--gold-dim); }
  .nav__links { display:flex; align-items:center; gap:clamp(.9rem,2.5vw,1.6rem);
    font-family:var(--mono); font-size:.78rem; letter-spacing:.04em; }
  .nav__links a { color:var(--dim); }
  .nav__links a:hover { color:var(--champagne); text-decoration:none; }
  .nav__cta { color:#0a0805 !important; background:var(--gold); padding:.55rem 1rem;
    border-radius:var(--radius); font-weight:600; }
  .nav__cta:hover { background:var(--champagne); }
  @media (max-width:600px) { .nav__links a:not(.nav__cta) { display:none; } }
</style>
```

- [ ] **Step 3: Rewrite `src/components/Hero.astro`** — full content:

```astro
---
import SceneVideo from "./SceneVideo.astro";
import { site } from "../site.config";
---
<header class="hero" id="top">
  <SceneVideo
    name="hero"
    scrim="left"
    priority
    label="A figure formed of golden particles, wearing a black vest and bow tie, stands composed in darkness."
  />
  <div class="wrap hero__in">
    <span class="eyebrow">Merit-gated · AI engineers only</span>
    <h1 class="hero__title">
      You can already get hired.
      <em>This is for the role you actually want.</em>
    </h1>
    <p class="lede hero__sub">
      BlackVest is an agentic placement system that interviews you on merit before it
      goes to work for you. Admission is earned — membership begins when the system
      is confident it can place you.
    </p>
    <div class="hero__cta">
      <a href={site.funnelUrl} class="btn-p">Start your assessment</a>
      <a href="#method" class="btn-s">How it works <span style="color:var(--gold)" aria-hidden="true">&rarr;</span></a>
    </div>
    <p class="micro hero__micro">Stage 1 is free · one authentic identity · every claim traceable</p>
  </div>
</header>
<style>
  .hero { position:relative; min-height:100svh; display:flex; align-items:center; overflow:hidden; }
  .hero__in { position:relative; z-index:2; padding-block:7rem 5rem; }
  .hero__title { font-size:var(--fs-display); max-width:14ch; margin-top:var(--s-6); }
  .hero__sub { margin-top:var(--s-6); max-width:34rem; }
  .hero__cta { margin-top:var(--s-8); display:flex; flex-wrap:wrap; gap:var(--s-3); align-items:center; }
  .hero__micro { margin-top:var(--s-4); }
  @media (max-width:719px) {
    .hero__in { padding-block:5rem 3.5rem; }
    .hero__title { font-size:clamp(2.2rem,10.5vw,3rem); }
  }
</style>
```

- [ ] **Step 4: Verify**

```bash
npm run build
grep -c "scene__video" dist/index.html          # ≥ 1
grep -c "app.blackvest.ai" dist/index.html      # ≥ 2 (nav + hero)
grep -o "hero-1080.mp4" dist/index.html | head -1
grep -o "hero-mobile.jpg" dist/index.html | head -1
```
Expected: all match. (HowItWorks/ProofStrip still render below — replaced next tasks.)

- [ ] **Step 5: Commit**

```bash
git add src/components/SceneVideo.astro src/components/Nav.astro src/components/Hero.astro
git commit -m "feat: SceneVideo footage layer + launch hero + funnel nav"
```

---

### Task 5: Mechanic + MeritGate sections

**Files:**
- Create: `src/components/Mechanic.astro`, `src/components/MeritGate.astro`
- Delete: `src/components/HowItWorks.astro`
- Modify: `src/pages/index.astro` (swap HowItWorks → Mechanic + MeritGate)

**Interfaces:**
- Consumes: `SceneVideo` (Task 4), `site.funnelUrl`.
- Produces: sections with `id="method"` and `id="gate"` (Nav links target these).

- [ ] **Step 1: Create `src/components/Mechanic.astro`** — full content:

```astro
---
const stages = [
  {
    n: "01",
    t: "Prove it",
    b: "A free, structured screen assesses how you actually think and build. No fee, no fast-track, no shortcut — the only way in is through.",
  },
  {
    n: "02",
    t: "Go deeper",
    b: "Clear the screen and the deep assessment begins: a real conversation that scores technical depth, criteria realism, and reachability — the things placement actually depends on.",
  },
  {
    n: "03",
    t: "The system goes to work",
    b: "Admitted members get the engine: roles sourced to fit, every application tailored to the posting, prep built from your verified profile. You approve every send.",
  },
];
---
<section class="section method" id="method">
  <div class="wrap">
    <span class="eyebrow reveal">The method</span>
    <h2 class="method__title reveal">An operator's system, pointed at your search.</h2>
    <ol class="method__grid">
      {stages.map((s, i) => (
        <li class="method__stage reveal" data-d={String(i + 1)}>
          <span class="method__n">{s.n}</span>
          <h3>{s.t}</h3>
          <p class="dim">{s.b}</p>
        </li>
      ))}
    </ol>
    <p class="micro method__foot reveal">Appropriate autonomy, human oversight — the exact maturity these roles screen for.</p>
  </div>
</section>
<style>
  .method__title { font-size:var(--fs-h2); margin-block:var(--s-3) var(--s-12); max-width:24ch; }
  .method__grid { list-style:none; margin:0; padding:0; display:grid;
    grid-template-columns:repeat(3,1fr); gap:var(--s-6); }
  @media (max-width:760px) { .method__grid { grid-template-columns:1fr; } }
  .method__stage { border-top:1px solid var(--line); padding-top:var(--s-6);
    display:flex; flex-direction:column; gap:var(--s-3); }
  .method__n { font-family:var(--mono); font-size:.78rem; color:var(--gold); letter-spacing:.1em; }
  .method__stage h3 { font-size:var(--fs-h3); }
  .method__stage p { font-size:var(--fs-small); line-height:var(--lh-snug); max-width:38ch; }
  .method__foot { margin-top:var(--s-12); }
</style>
```

The stage numbers are a real sequence (screen → assessment → membership), so numbered markers
carry information here.

- [ ] **Step 2: Create `src/components/MeritGate.astro`** — full content:

```astro
---
import SceneVideo from "./SceneVideo.astro";
import { site } from "../site.config";
---
<section class="section gate" id="gate">
  <SceneVideo
    name="gate"
    scrim="left"
    label="A colossal dark gate split by a thin blade of golden light; a lone figure stands before it."
  />
  <div class="wrap gate__in">
    <span class="eyebrow reveal">The merit gate</span>
    <h2 class="gate__title reveal">You can't buy your way in. <em>Passing is the point.</em></h2>
    <p class="lede gate__sub reveal">
      BlackVest admits only candidates it's confident it can place. Most are declined.
      That's what admission means — and why membership is worth having.
    </p>
    <p class="micro gate__dims reveal">scored on: technical depth · criteria realism · reachability</p>
    <p class="reveal" data-d="1"><a class="btn-s gate__cta" href={site.funnelUrl}>Approach the gate <span style="color:var(--gold)" aria-hidden="true">&rarr;</span></a></p>
  </div>
</section>
<style>
  .gate { min-height:92svh; display:flex; align-items:center; overflow:hidden; }
  .gate__in { position:relative; z-index:2; }
  .gate__title { font-size:clamp(2.2rem,5vw,4rem); max-width:14ch; margin-top:var(--s-4); }
  .gate__sub { margin-top:var(--s-6); max-width:30rem; }
  .gate__dims { margin-top:var(--s-6); color:var(--gold); }
  .gate__cta { margin-top:var(--s-6); }
</style>
```

- [ ] **Step 3: Swap into `src/pages/index.astro`**

Replace the import `import HowItWorks from "../components/HowItWorks.astro";` with
`import Mechanic from "../components/Mechanic.astro";` and
`import MeritGate from "../components/MeritGate.astro";`, and replace `<HowItWorks />` with
`<Mechanic />` followed by `<MeritGate />`. Then:

```bash
git rm src/components/HowItWorks.astro
```

- [ ] **Step 4: Verify**

```bash
npm run build
grep -o 'id="method"' dist/index.html && grep -o 'id="gate"' dist/index.html
grep -o "gate-1080.mp4" dist/index.html | head -1
grep -ciE 'guarantee|refund|\$[0-9]' dist/index.html   # MUST print 0 (no commercial claims)
```
Expected: ids + gate media present; the claims grep prints `0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: mechanic + merit-gate sections (gate footage set-piece)"
```

---

### Task 6: Proof restyle + Membership + FinalCta + final page assembly

**Files:**
- Rewrite: `src/components/ProofStrip.astro`
- Create: `src/components/Membership.astro`, `src/components/FinalCta.astro`
- Rewrite: `src/pages/index.astro`

**Interfaces:**
- Consumes: `SceneVideo`, `site.proof`, `site.funnelUrl`, `site.showcaseUrl`.
- Produces: final page order Hero → Mechanic → MeritGate → Proof(`#proof`) →
  Membership(`#membership`) → FinalCta → footer.

- [ ] **Step 1: Rewrite `src/components/ProofStrip.astro`** — full content:

```astro
---
import { site } from "../site.config";
---
<section class="section proof" id="proof">
  <div class="wrap">
    <span class="eyebrow reveal">Proof, not promises</span>
    <h2 class="proof__title reveal">The system is already running.</h2>
    <p class="lede proof__lede reveal">
      Not a pitch deck — a live system running in the open, with its architecture
      and guardrails on display, and a verification method that grades every claim
      by how it was established.
    </p>
    <div class="proof__stats reveal">
      {site.proof.map((p) => (
        <div class="proof__stat">
          <div class="proof__n">{p.n}</div>
          <div class="proof__l">{p.label}</div>
        </div>
      ))}
    </div>
    <div class="proof__links reveal" data-d="1">
      <a href="/verify">How verification works &rarr;</a>
      <a href={site.showcaseUrl}>See the system, live &rarr;</a>
    </div>
  </div>
</section>
<style>
  .proof { background:var(--bg2); border-block:1px solid var(--line2); }
  .proof__title { font-size:var(--fs-h2); margin-block:var(--s-3) var(--s-4); }
  .proof__lede { max-width:var(--maxw-prose); }
  .proof__stats { margin-top:var(--s-12); display:flex; flex-wrap:wrap; gap:var(--s-8) var(--s-16);
    border-top:1px solid var(--line); padding-top:var(--s-8); }
  .proof__n { font-family:var(--serif); font-size:clamp(2rem,3.4vw,2.8rem); color:var(--gold); }
  .proof__l { font-size:var(--fs-small); color:var(--mute); margin-top:.25rem; }
  .proof__links { margin-top:var(--s-8); display:flex; flex-wrap:wrap; gap:var(--s-6);
    font-family:var(--mono); font-size:.82rem; }
</style>
```

- [ ] **Step 2: Create `src/components/Membership.astro`** — full content:

```astro
---
const perks = [
  { t: "A sourced pipeline", b: "Roles that fit your criteria, found and ranked for you. Quality over volume, always." },
  { t: "Applications cut to measure", b: "Every application tailored to the posting, grounded in your verified profile. Zero fabricated claims." },
  { t: "Prep that knows the room", b: "Interview preparation built from the posting, the company, and what you've actually proven." },
  { t: "Your hand on every send", b: "Nothing leaves without your explicit yes. The system does the work; you keep the controls." },
];
---
<section class="section membership" id="membership">
  <div class="wrap">
    <span class="eyebrow reveal">Membership</span>
    <h2 class="mem__title reveal">What the vest gets you.</h2>
    <ul class="mem__grid">
      {perks.map((p, i) => (
        <li class="mem__item reveal" data-d={String((i % 2) + 1)}>
          <h3>{p.t}</h3>
          <p class="dim">{p.b}</p>
        </li>
      ))}
    </ul>
  </div>
</section>
<style>
  .mem__title { font-size:var(--fs-h2); margin-block:var(--s-3) var(--s-12); }
  .mem__grid { list-style:none; margin:0; padding:0; display:grid;
    grid-template-columns:repeat(2,1fr); gap:var(--s-8) var(--s-12); }
  @media (max-width:700px) { .mem__grid { grid-template-columns:1fr; } }
  .mem__item { border-top:1px solid var(--line); padding-top:var(--s-4); }
  .mem__item h3 { font-size:var(--fs-h3); margin-bottom:var(--s-2); }
  .mem__item p { font-size:var(--fs-small); line-height:var(--lh-snug); max-width:44ch; }
</style>
```

- [ ] **Step 3: Create `src/components/FinalCta.astro`** — full content:

```astro
---
import SceneVideo from "./SceneVideo.astro";
import { site } from "../site.config";
---
<section class="section final">
  <SceneVideo
    name="loom"
    scrim="center"
    label="A black vest and bow tie suspended among flowing ribbons of golden light."
  />
  <div class="wrap final__in">
    <span class="eyebrow reveal">Admission</span>
    <h2 class="final__title reveal">The vest is earned.</h2>
    <p class="lede final__sub reveal">Take the assessment. If the system can place you, you'll know.</p>
    <p class="reveal" data-d="1"><a class="btn-p" href={site.funnelUrl}>Start your assessment</a></p>
    <p class="micro final__micro reveal" data-d="2">Stage 1 is free</p>
  </div>
</section>
<style>
  .final { min-height:88svh; display:flex; align-items:center; overflow:hidden; text-align:center; }
  .final__in { position:relative; z-index:2; display:flex; flex-direction:column; align-items:center; gap:var(--s-4); }
  .final__title { font-size:clamp(2.4rem,5.6vw,4.6rem); }
  .final__sub { max-width:30rem; }
  .final__micro { margin-top:var(--s-2); }
</style>
```

- [ ] **Step 4: Rewrite `src/pages/index.astro`** — full content:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import Nav from "../components/Nav.astro";
import Hero from "../components/Hero.astro";
import Mechanic from "../components/Mechanic.astro";
import MeritGate from "../components/MeritGate.astro";
import ProofStrip from "../components/ProofStrip.astro";
import Membership from "../components/Membership.astro";
import FinalCta from "../components/FinalCta.astro";
import { site } from "../site.config";
---
<BaseLayout>
  <Nav />
  <main id="main">
    <Hero />
    <Mechanic />
    <MeritGate />
    <ProofStrip />
    <Membership />
    <FinalCta />
  </main>
  <footer class="footer">
    <div class="wrap footer__inner">
      <span class="footer__brand">{site.name}</span>
      <nav class="footer__links" aria-label="Links">
        <a href="/verify">How verification works</a>
        <a href={site.showcaseUrl}>The system, live</a>
        <a href="https://github.com/DreamwareDevelopment" rel="me">GitHub</a>
      </nav>
      <p class="footer__colophon mute">For AI Engineers who want the role they actually want.</p>
    </div>
  </footer>
</BaseLayout>
<style>
  .footer { border-top:1px solid var(--line); padding-block:var(--s-12); }
  .footer__inner { display:flex; flex-wrap:wrap; gap:var(--s-6); justify-content:space-between; align-items:flex-start; }
  .footer__brand { font-family:var(--mono); font-weight:600; letter-spacing:.14em; text-transform:uppercase; font-size:.82rem; }
  .footer__links { display:flex; flex-wrap:wrap; gap:var(--s-4); font-family:var(--mono); font-size:var(--fs-small); }
  .footer__colophon { font-size:.78rem; width:100%; border-top:1px solid var(--line2); padding-top:var(--s-4); }
</style>
```

- [ ] **Step 5: Verify**

```bash
npm run build
for s in method gate proof membership; do grep -o "id=\"$s\"" dist/index.html; done
grep -c "app.blackvest.ai" dist/index.html        # ≥ 4 (nav, hero, gate, final)
grep -c "scene__video" dist/index.html            # = 3 (hero, gate, loom)
grep -ciE 'guarantee|refund|waitlist|\$[0-9]' dist/index.html   # = 0
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: proof, membership, loom final CTA — full launch page assembly"
```

---

### Task 7: `/verify` touch-up + full visual smoke test

**Files:**
- Modify: `src/pages/verify.astro` (minor)

**Interfaces:** consumes the new system only; content unchanged.

- [ ] **Step 1: Align `/verify` with the launch system**

In `src/pages/verify.astro`, change the closing CTA block (currently a single showcase link) to:

```astro
      <p class="reveal">
        <a class="btn-p" href={site.funnelUrl}>Start your assessment</a>
        <a class="verify-close__cta" href={site.showcaseUrl} style="margin-left:1rem">See the system, live →</a>
      </p>
```

and in the footer links add `<a href="/#gate">The gate</a>` after the `Home` link.
Everything else inherits tokens/global automatically.

- [ ] **Step 2: Build + link integrity**

```bash
npm run build
grep -o "app.blackvest.ai" dist/verify/index.html | head -1
python3 - <<'EOF'
import re, os
html = open('dist/index.html').read() + open('dist/verify/index.html').read()
bad = []
for href in set(re.findall(r'href="(/[^"#]*)', html)):
    p = 'dist' + (href.rstrip('/') or '/index')
    if not (os.path.exists(p) or os.path.exists(p + '/index.html') or os.path.exists(p + '.html')):
        bad.append(href)
print('broken internal links:', bad or 'NONE')
EOF
```
Expected: funnel link present; `broken internal links: NONE`.

- [ ] **Step 3: Headless visual smoke (desktop + mobile)**

```bash
npm run preview -- --port 4322 &
sleep 2
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,900 \
  --virtual-time-budget=6000 --screenshot=/tmp/bv-desktop.png http://localhost:4322/
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --window-size=390,844 \
  --virtual-time-budget=6000 --screenshot=/tmp/bv-mobile.png http://localhost:4322/
kill %1
```
Inspect both screenshots: hero copy legible over the scrim, no horizontal scroll, CTAs visible.

- [ ] **Step 4: Commit**

```bash
git add src/pages/verify.astro
git commit -m "feat: verify page joins the launch system + funnel CTA"
```

---

## After the plan

The three founder-mandated **iteration passes** run as review cycles on the built site
(session tasks #4–#6): (1) fine-tooth-comb design review against the design-psychology
checklist at 3 viewports; (2) complexify/polish — micro-interactions, choreography timing,
copy; (3) adversarial multi-agent audit (design/a11y/perf/copy) + Lighthouse gates. Then PR
`launch-redesign` → main (CI deploys to Cloudflare Pages), verify live on blackvest.ai.
Founder follow-ups recorded in the spec: export D1 signups to CSV before deleting the
database (spec §6.2); ADR-020 changelog amendment in the vault at ship time (spec §6.3).
