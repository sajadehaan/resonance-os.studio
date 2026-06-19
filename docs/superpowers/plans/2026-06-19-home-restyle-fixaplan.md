# Home Page Restyle (fixaplan visual language) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the existing Resonance.OS home page in fixaplan.com's visual language and scroll motion — same 7 sections, same order, copy verbatim — adding stacked rounded panels, two warm-dark bands, word-fill reveals, a parallax hero, and a pinned scroll-tabs treatment on the "Why" section.

**Architecture:** Additive only. New design tokens + a `.panel` primitive in `global.css`; one new motion module `src/lib/motion.ts` (built on the already-installed GSAP/ScrollTrigger/SplitText + Lenis); one new component `src/components/PinnedTabs.astro`. Each existing section in `src/pages/index.astro` is rewrapped/restyled in place. The footer (in `src/layouts/Base.astro`) gets a dark-band restyle. **No copy is changed.**

**Tech Stack:** Astro 6, vanilla CSS (custom properties), GSAP 3.15 (`gsap`, `ScrollTrigger`, `SplitText`), Lenis. No new dependencies.

## Global Constraints

- **Structure frozen:** exactly 7 sections in `index.astro`, same order — Hero → The Gap → Why → Two Ways In → Projects → The Studio → Testimonials — plus the footer. No sections added, removed, or reordered.
- **Copy frozen:** every headline, paragraph, eyebrow, CTA label, project text, and testimonial string stays **verbatim**. Diffs must show markup/class/style changes only, never wording changes.
- **Nav frozen:** the existing `.nav` (logo + metaball menu + hamburger) in `Base.astro` is untouched.
- **Tokens additive:** add to `:root`, never edit existing token values. Existing tokens: `--bg #f9f9f9`, `--bg-alt #f0eee9`, `--ink #222222`, `--ink-m rgba(34,34,34,0.48)`, `--rule rgba(34,34,34,0.10)`, `--accent #f75b1d`, `--accent-s rgba(247,91,29,0.07)`, `--white #ffffff`, `--fu Urbanist`, `--fm Geist Mono`, `--rad 12px`, `--rad-btn 10px`, `--ease-expo cubic-bezier(0.19,1,0.22,1)`, `--vp clamp(4rem,8vw,8rem)`, `--sp max(--hp, ...)`.
- **Dark band color:** `#1a1a1a` warm-dark, never pure black. Two dark bands only: the Why section and the footer.
- **Reduced motion:** every motion must no-op under `@media (prefers-reduced-motion: reduce)` — text at full color, no parallax, no pin (sections render as normal flow).
- **Reuse, don't reinvent:** keep `.r`/`.v`/`data-d` reveals, `.diag-h`/`.diag-line` headlines, `.vault-card`, `.project-accordion`, `.conv-*` testimonials, `MetaballButton`, the `#logo-mark` symbol.
- **Verification model:** this is visual work — each task is verified by (a) `npm run build` succeeding with no errors, and (b) a Playwright screenshot of the affected section matching the described result. There are no unit tests.

**Node:** `>=22.12.0`. **Commands:** `npm run dev` (localhost:4321), `npm run build`, `npm run preview`.

---

## Pre-flight (once, before Task 1)

- [ ] **Confirm dev server runs**

Run: `npm run dev`
Expected: Astro serves on `http://localhost:4321/`. Open it; the current home page renders (light bg, sticky nav, 7 sections, footer). Stop the server (`Ctrl-C`) once confirmed.

- [ ] **Confirm clean build baseline**

Run: `npm run build`
Expected: ends with `Complete!` / build success, no errors. This is the green baseline every task must preserve.

- [ ] **Screenshot helper** — all visual checks use this pattern (Playwright is available in this repo via `.playwright-cli`). With `npm run dev` running, capture a section by scrolling to its `id` and screenshotting. Use the `playwright-cli` skill, or this inline node script saved as `/tmp/shot.mjs`:

```js
import { chromium } from 'playwright';
const [url, sel, out] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
if (sel && sel !== '-') { await p.locator(sel).scrollIntoViewIfNeeded(); await p.waitForTimeout(900); }
await p.screenshot({ path: out, fullPage: sel === 'full' });
await b.close();
```

Run a shot with: `node /tmp/shot.mjs http://localhost:4321/ '#gap' /tmp/gap.png` then Read `/tmp/gap.png`.
(If `playwright` isn't resolvable from the project, use the `playwright-cli` skill instead — same intent: screenshot the section and visually confirm.)

---

## Task 1: Design tokens + `.panel` stacked-panel primitive

**Files:**
- Modify: `src/styles/global.css` — add tokens to `:root` (after line 27, before the closing `}` at line 29); append a new `/* ── PANELS ── */` block after the `.s` layout rules (around line 35).

**Interfaces:**
- Produces: CSS tokens `--ink-panel`, `--ink-panel-2`, `--on-dark`, `--on-dark-m`, `--rad-panel`; classes `.panel`, `.panel--alt`, `.panel--dark`, and a `.panel-stack` wrapper rule. Consumed by Tasks 2–10.

- [ ] **Step 1: Add tokens** to the `:root` block in `src/styles/global.css` (insert immediately before the closing brace of `:root`, after `--ease-expo`):

```css
      /* ── fixaplan restyle additions ── */
      --ink-panel:   #1a1a1a;                  /* warm-dark band background */
      --ink-panel-2: #222222;                  /* raised surface on dark */
      --on-dark:     #f4f2ee;                  /* primary text on dark */
      --on-dark-m:   rgba(244, 242, 238, 0.55);/* muted text on dark */
      --rad-panel:   clamp(1.5rem, 4vw, 2.5rem);/* stacked-panel top radius */
```

- [ ] **Step 2: Add the panel primitive.** Append this block right after the `.s--alt` rule (after line 35 `.s--alt { background: var(--bg-alt); }`):

```css
    /* ── STACKED ROUNDED PANELS (fixaplan rhythm) ── */
    .panel-stack { position: relative; }
    .panel {
      position: relative;
      background: var(--bg);
      border-radius: var(--rad-panel) var(--rad-panel) 0 0;
      margin-top: calc(var(--rad-panel) * -1);
      /* each panel sits above the previous so its rounded top overlaps it */
      box-shadow: 0 -1px 0 rgba(34,34,34,0.04);
    }
    .panel:first-child { margin-top: 0; border-radius: 0; }
    .panel--alt  { background: var(--bg-alt); }
    .panel--dark {
      background: var(--ink-panel);
      color: var(--on-dark);
      box-shadow: 0 -1px 0 rgba(0,0,0,0.25);
    }
    .panel--dark .lbl,
    .panel--dark .body, .panel--dark .body-lg { color: var(--on-dark-m); }
    .panel--dark .h2, .panel--dark .diag-h { color: var(--on-dark); }
    /* z-index is assigned inline per panel in index.astro so later panels stack on top */
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: `Complete!`, no errors. (No visual change yet — classes are not applied until Task 2.)

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(home): add dark-band tokens + stacked-panel primitive"
```

---

## Task 2: Wrap all sections in stacked panels + two dark bands

This is the structural milestone: identical content, now in fixaplan's stacked-panel rhythm with the Why section and footer dark. No interior restyle yet.

**Files:**
- Modify: `src/pages/index.astro` — add `class="panel ..."` + inline `style="z-index:N"` to each top-level `<section>`; wrap the section run in a `.panel-stack` container; remove the three `.logo-sep` separators between panels (the panel seams replace them).
- Modify: `src/layouts/Base.astro` — give `.s-footer` the `panel panel--dark` treatment (final stack member) and remove the `.slash-sep` directly above the footer (the panel seam replaces it). Keep the in-footer `.slash-sep` and all footer content.

**Interfaces:**
- Consumes: `.panel`, `.panel--alt`, `.panel--dark` from Task 1.
- Produces: a `.panel-stack` wrapping all home sections; panel z-index order Hero=1 … Testimonials=7, footer=8.

- [ ] **Step 1: Wrap the home sections.** In `src/pages/index.astro`, wrap everything from the opening `<section class="s-hero">` (line 10) through the end of the Testimonials `</section>` (line 354) in:

```html
<div class="panel-stack">
  ... sections ...
</div>
```

- [ ] **Step 2: Tag each section.** Apply these exact classes + inline z-index (keep every existing `id` and all inner markup/copy). Backgrounds alternate; Why is the dark band:

| Section (existing) | Add to its `<section>` |
|---|---|
| `s-hero` (Hero) | `class="s-hero panel" style="z-index:1"` |
| `#gap` (The Gap) | `class="s panel panel--alt" id="gap" style="z-index:2"` |
| `#why` (Why) | `class="s panel panel--dark" id="why" style="z-index:3"` |
| `#products` (Two Ways In) | `class="s panel panel--alt" id="products" style="z-index:4"` (remove the old inline `style="background:var(--bg-alt)"`) |
| `#projects` (Projects) | `class="s panel" id="projects" style="z-index:5"` |
| `#studio` (The Studio) | `class="s panel panel--alt" id="studio" style="z-index:6"` |
| `#testimonials` (Testimonials) | `class="s panel" id="testimonials" style="z-index:7; padding-bottom:0"` (remove old inline `background:var(--bg-alt)`; keep `padding-bottom:0`) |

- [ ] **Step 3: Remove inter-panel separators.** Delete the three standalone `<div class="logo-sep">…</div>` blocks in `index.astro` (the ones between sections, at approx lines 60–65, 80–85, 236–241). Leave any `#logo-mark` usage inside sections intact. *(Rationale: the rounded panel seams are the new separators.)*

- [ ] **Step 4: Footer panel.** In `src/layouts/Base.astro`: change `<section class="s-footer" id="footer">` to `<section class="s-footer panel panel--dark" id="footer" style="z-index:8">`. Delete the `<div class="slash-sep" …>` on line 106 (directly above the footer, outside it). Keep the `slash-sep` *inside* the footer (line 122) and all footer content/links.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 6: Visual check**

Run `npm run dev`, then:
`node /tmp/shot.mjs http://localhost:4321/ full /tmp/stack.png` and Read `/tmp/stack.png`.
Expected: all 7 sections present with copy intact; each section has a rounded top edge overlapping the previous; the Why section and footer are dark `#1a1a1a` with light text; no broken `logo-sep` gaps. Nav unchanged.

- [ ] **Step 7: Commit**

```bash
git add src/pages/index.astro src/layouts/Base.astro
git commit -m "feat(home): stacked rounded panels + dark Why/footer bands"
```

---

## Task 3: Motion module + word-fill reveal (Gap body + hero sub)

**Files:**
- Create: `src/lib/motion.ts` — exports `initWordFill()`, `initParallax()`, `initPinnedTabs()` (latter two are stubs filled in Tasks 4–5).
- Modify: `src/styles/global.css` — append `.wordfill` styles + reduced-motion rule.
- Modify: `src/pages/index.astro` — add a module `<script>` importing/init-ing motion; mark the Gap paragraph and hero sub with `data-wordfill`.

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`, `SplitText` from `src/lib/gsap.ts`.
- Produces: `initWordFill()` — finds `[data-wordfill]`, splits into words, scrubs each word's color `--ink-m`→`--ink` (or `--on-dark-m`→`--on-dark` inside `.panel--dark`) across the element's scroll range. No-ops under reduced motion.

- [ ] **Step 1: Create `src/lib/motion.ts`:**

```ts
import { gsap, ScrollTrigger, SplitText } from './gsap';

const reduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initWordFill() {
  const els = document.querySelectorAll<HTMLElement>('[data-wordfill]');
  els.forEach((el) => {
    if (reduced()) { el.style.color = ''; return; } // CSS resolves to full ink
    const onDark = !!el.closest('.panel--dark');
    const from = onDark ? 'var(--on-dark-m)' : 'var(--ink-m)';
    const to   = onDark ? 'var(--on-dark)'   : 'var(--ink)';
    const split = new SplitText(el, { type: 'words' });
    gsap.set(split.words, { color: from });
    gsap.to(split.words, {
      color: to,
      ease: 'none',
      stagger: 0.4,
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        end: 'bottom 55%',
        scrub: true,
      },
    });
  });
}

export function initParallax() { /* Task 4 */ }
export function initPinnedTabs() { /* Task 5 */ }
```

- [ ] **Step 2: Add CSS** — append to `src/styles/global.css`. Includes the fixaplan **pill-tag eyebrow** treatment, scoped to `.panel-stack` so subpages (`/id`, `/site`) keep the plain `// EYEBROW`:

```css
    /* ── WORD-FILL REVEAL ── */
    [data-wordfill] { color: var(--ink-m); }
    .panel--dark [data-wordfill] { color: var(--on-dark-m); }
    @media (prefers-reduced-motion: reduce) {
      [data-wordfill] { color: var(--ink) !important; }
      .panel--dark [data-wordfill] { color: var(--on-dark) !important; }
    }

    /* ── PILL-TAG EYEBROWS (home panels only) ── */
    .panel-stack .lbl {
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      background: var(--accent-s);
      color: var(--accent);
    }
    .panel-stack .panel--dark .lbl {
      background: rgba(244,242,238,0.08);
      color: var(--on-dark-m);
    }
```

- [ ] **Step 3: Wire init + mark targets** in `src/pages/index.astro`. At the very end of the file (after the existing `<script>` testimonials block), add a new module script:

```html
<script>
  import { initWordFill, initParallax, initPinnedTabs } from '../lib/motion';
  const start = () => { initWordFill(); initParallax(); initPinnedTabs(); };
  if (document.readyState !== 'loading') start();
  else document.addEventListener('DOMContentLoaded', start);
</script>
```

Then add `data-wordfill` to two existing elements (no copy change): the Gap body `<p class="body-lg gap-body r" data-d="2" data-wordfill>` (line 76) and the hero sub `<p class="hero-sub r" data-d="1" data-wordfill>` (line 20).

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `Complete!`, no errors (SplitText import resolves from gsap).

- [ ] **Step 5: Visual check**

`npm run dev`, then `node /tmp/shot.mjs http://localhost:4321/ '#gap' /tmp/wf.png`, Read it.
Expected: the Gap paragraph shows a left-to-right gray→ink gradient of words mid-scroll (some words muted, some full ink). Toggle OS "reduce motion" mentally — the CSS rule guarantees full ink as fallback.

- [ ] **Step 6: Commit**

```bash
git add src/lib/motion.ts src/styles/global.css src/pages/index.astro
git commit -m "feat(home): word-fill scroll reveal on Gap + hero sub"
```

---

## Task 4: Hero parallax media + bottom-bar layout

**Files:**
- Modify: `src/lib/motion.ts` — implement `initParallax()`.
- Modify: `src/pages/index.astro` — wrap hero media in a parallax layer; regroup eyebrow/sub/CTAs into a bottom bar. Copy verbatim.
- Modify: `src/styles/global.css` — append hero restyle + `.hero-media` + `.hero-bottombar` styles.

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`.
- Produces: `initParallax()` — translates `[data-parallax]` by `yPercent` on scrub; no-op under reduced motion. CSS class `.hero-media` (the Spline/gradient/photo layer), `.hero-photo` (optional `<img>`/bg, hidden until a file exists).

- [ ] **Step 1: Implement `initParallax()`** in `src/lib/motion.ts` (replace the stub):

```ts
export function initParallax() {
  if (reduced()) return;
  document.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
    gsap.to(el, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: { trigger: el.closest('.s-hero') || el, start: 'top top', end: 'bottom top', scrub: true },
    });
  });
}
```

- [ ] **Step 2: Restructure the hero** in `src/pages/index.astro` (section 01). Keep the existing `.hero-eyebrow`, `.hero-h1`, `.hero-sub`, both `MetaballButton`s, the `spline-viewer`, and the `.vault-card` — only regroup containers and add classes/attributes:

```html
<section class="s-hero panel" style="z-index:1">

  <!-- parallax media layer: photo if supplied, else Spline over gradient -->
  <div class="hero-media" data-parallax aria-hidden="true">
    <div class="hero-photo"></div>
    <div class="spline-wrap">
      <spline-viewer url="https://prod.spline.design/SSUb1QPOv-tdYAa2/scene.splinecode" loading="lazy"></spline-viewer>
    </div>
  </div>

  <div class="hero-body">
    <h1 class="hero-h1 diag-h">
      <span class="diag-line">Clients meet you</span>
      <span class="diag-line">in person.</span>
      <span class="diag-line">They don't recognize</span>
      <span class="diag-line">you online.</span>
    </h1>
    <p class="hero-sub r" data-d="1" data-wordfill>A brand identity studio for boutique movement and wellness operators. We close the gap between who you are when you teach and how you come across on a screen.</p>
  </div>

  <!-- fixaplan-style bottom bar: eyebrow/tagline + CTAs -->
  <div class="hero-bottombar r" data-d="2">
    <p class="hero-eyebrow r">// RESONANCE.OS — BRAND IDENTITY FOR MOVEMENT &amp; WELLNESS</p>
    <div class="hero-ctas">
      <MetaballButton href="/id" label="Start your ID — €247" />
      <MetaballButton href="/site" variant="ghost" label="Explore Resonance.SITE" />
    </div>
  </div>

  <aside class="vault-card r" data-d="3">
    <!-- UNCHANGED: keep the entire existing .vault-card inner markup verbatim -->
  </aside>

</section>
```

(Preserve the full existing `.vault-card` contents from the current file — header, swatches, divider, quote, why, footer — verbatim.)

- [ ] **Step 3: Add hero CSS** — append to `src/styles/global.css`:

```css
    /* ── HERO RESTYLE (fixaplan parallax + bottom bar) ── */
    .s-hero { position: relative; min-height: 100svh; overflow: hidden; display: flex; flex-direction: column; justify-content: center; padding: clamp(5rem,10vw,8rem) var(--sp) 0; }
    .hero-media { position: absolute; inset: -10% 0 0 0; z-index: 0; pointer-events: none; }
    .hero-photo { position: absolute; inset: 0; background: var(--photo, none) center/cover no-repeat; }
    .s-hero .spline-wrap { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0.9; }
    .s-hero .hero-body, .s-hero .hero-bottombar, .s-hero .vault-card { position: relative; z-index: 2; }
    .hero-bottombar {
      display: flex; align-items: center; justify-content: space-between; gap: 1.5rem;
      flex-wrap: wrap; margin-top: auto; padding: 1.5rem 0 2rem;
      border-top: 1px solid var(--rule);
    }
    @media (max-width: 760px) {
      .hero-bottombar { flex-direction: column; align-items: flex-start; }
    }
```

(Note: `--photo` is unset by default, so `.hero-photo` is invisible and the Spline/gradient shows — graceful fallback. Setting `--photo: url('/hero.jpg')` on `.s-hero` later swaps in a photo.)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 5: Visual check**

`npm run dev`, then `node /tmp/shot.mjs http://localhost:4321/ '-' /tmp/hero.png`, Read it.
Expected: headline held center-left, Spline mark behind as media, eyebrow + two CTAs in a bottom bar with a top hairline, vault card floating. Scroll a little and re-shot to confirm the media drifts (parallax) relative to the text.

- [ ] **Step 6: Commit**

```bash
git add src/lib/motion.ts src/pages/index.astro src/styles/global.css
git commit -m "feat(home): parallax hero media + fixaplan bottom bar"
```

---

## Task 5: Why → pinned scroll-tabs (signature, dark band)

**Files:**
- Create: `src/components/PinnedTabs.astro` — the pinned tabs section, fed the three existing reasons.
- Modify: `src/lib/motion.ts` — implement `initPinnedTabs()`.
- Modify: `src/pages/index.astro` — replace the Why section's inner `.editorial-list` with `<PinnedTabs />` (import the component). Headline + eyebrow stay verbatim.
- Modify: `src/styles/global.css` — append `.ptabs*` styles (dark-band aware).

**Interfaces:**
- Consumes: `gsap`, `ScrollTrigger`; the three reasons' titles + bodies (verbatim, passed as a literal array in the component).
- Produces: `initPinnedTabs()` — pins `.ptabs`, maps scroll progress → active index (0..n-1), toggles `.is-active` on `.ptabs-tab` and `.ptabs-panel`. Reduced-motion / `max-width:900px` → no pin, panels render stacked.

- [ ] **Step 1: Create `src/components/PinnedTabs.astro`** (titles + bodies copied verbatim from the current Why editorial list — reasons 01/02/03):

```astro
---
const reasons = [
  {
    n: '01',
    title: 'Built around recognition, not deliverables.',
    body: 'Most studios sell you a logo, a palette, and a 40-page guide. We sell the moment you read your own brand back and think <em style="font-style:normal;color:var(--on-dark)">yes, that\'s me</em>. The palette, the tagline, the website — those are just the proof.',
  },
  {
    n: '02',
    title: 'Built to be useful in 30 seconds.',
    body: 'Discovery, workshops, presentations, revisions. Most agencies use the same six weeks we use to deliver the entire Resonance.ID. You answer 12 questions. Your dashboard is generated. You read it the same evening.',
  },
  {
    n: '03',
    title: 'Built for one specific market.',
    body: 'We do not work with fintech founders. We do not work with B2B SaaS. We work with people who teach movement. The intake is tuned for it. The voice rules are tuned for it. The blueprint is tuned for it. That\'s why it lands.',
  },
];
---
<div class="ptabs" data-ptabs>
  <ol class="ptabs-tablist" role="tablist" aria-label="Three reasons">
    {reasons.map((r, i) => (
      <li class={`ptabs-tab${i === 0 ? ' is-active' : ''}`} data-tab={i}>
        <span class="ptabs-tab-n">{r.n}</span>
        <span class="ptabs-tab-ttl">{r.title}</span>
      </li>
    ))}
  </ol>
  <div class="ptabs-stage">
    {reasons.map((r, i) => (
      <article class={`ptabs-panel${i === 0 ? ' is-active' : ''}`} data-panel={i}>
        <span class="ptabs-panel-n">{r.n}</span>
        <p class="ptabs-panel-ttl">{r.title}</p>
        <p class="ptabs-panel-body" set:html={r.body} />
      </article>
    ))}
  </div>
</div>
```

- [ ] **Step 2: Implement `initPinnedTabs()`** in `src/lib/motion.ts` (replace the stub):

```ts
export function initPinnedTabs() {
  document.querySelectorAll<HTMLElement>('[data-ptabs]').forEach((root) => {
    const tabs   = root.querySelectorAll<HTMLElement>('.ptabs-tab');
    const panels = root.querySelectorAll<HTMLElement>('.ptabs-panel');
    const n = panels.length;
    if (!n) return;

    const setActive = (idx: number) => {
      tabs.forEach((t, i) => t.classList.toggle('is-active', i === idx));
      panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
    };

    const noPin = reduced() || window.matchMedia('(max-width: 900px)').matches;
    if (noPin) { tabs.forEach(t => t.classList.add('is-active')); panels.forEach(p => p.classList.add('is-active')); return; }

    ScrollTrigger.create({
      trigger: root,
      start: 'center center',
      end: () => `+=${n * 100}%`,
      pin: true,
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(n - 1, Math.floor(self.progress * n));
        setActive(idx);
      },
    });
  });
}
```

- [ ] **Step 3: Swap the Why interior** in `src/pages/index.astro`. Add `import PinnedTabs from '../components/PinnedTabs.astro';` to the frontmatter. In the Why section (`#why`, now `panel panel--dark`), keep the existing `<span class="lbl r">// A DIFFERENT KIND OF STUDIO</span>` and the existing `<h2 class="h2 diag-h r" …>Three reasons…</h2>` verbatim, then replace the entire `<div class="editorial-list">…</div>` with:

```html
  <PinnedTabs />
```

- [ ] **Step 4: Add CSS** — append to `src/styles/global.css`:

```css
    /* ── PINNED SCROLL-TABS (Why) ── */
    .ptabs { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: clamp(2rem,5vw,5rem); margin-top: 3rem; align-items: start; }
    .ptabs-tablist { display: flex; flex-direction: column; gap: 0.5rem; }
    .ptabs-tab {
      display: flex; gap: 0.875rem; align-items: baseline; padding: 0.875rem 1.125rem;
      border-radius: var(--rad-btn); cursor: default;
      color: var(--on-dark-m); opacity: 0.5;
      transition: opacity .4s var(--ease-expo), background .4s var(--ease-expo), color .4s var(--ease-expo);
    }
    .ptabs-tab.is-active { opacity: 1; color: var(--on-dark); background: var(--ink-panel-2); }
    .ptabs-tab-n { font-family: var(--fm); font-size: 0.625rem; color: var(--accent); }
    .ptabs-tab-ttl { font-family: var(--fu); font-weight: 600; font-size: clamp(1rem,1.6vw,1.25rem); letter-spacing: -0.02em; }
    .ptabs-stage { position: relative; min-height: 18rem; }
    .ptabs-panel {
      position: absolute; inset: 0; opacity: 0; transform: translateY(12px);
      background: var(--ink-panel-2); border: 1px solid rgba(244,242,238,0.08);
      border-radius: var(--rad); padding: clamp(1.5rem,3vw,2.25rem);
      transition: opacity .5s var(--ease-expo), transform .5s var(--ease-expo);
      pointer-events: none;
    }
    .ptabs-panel.is-active { opacity: 1; transform: none; pointer-events: auto; }
    .ptabs-panel-n { font-family: var(--fm); font-size: 0.625rem; color: var(--accent); }
    .ptabs-panel-ttl { font-family: var(--fu); font-weight: 700; font-size: clamp(1.35rem,2.4vw,2rem); letter-spacing: -0.03em; color: var(--on-dark); margin: 0.75rem 0 1rem; line-height: 1.05; }
    .ptabs-panel-body { font-family: var(--fu); font-size: 1rem; line-height: 1.65; color: var(--on-dark-m); max-width: 42ch; }
    @media (max-width: 900px) {
      .ptabs { grid-template-columns: 1fr; }
      .ptabs-stage { min-height: 0; display: flex; flex-direction: column; gap: 1rem; }
      .ptabs-panel { position: relative; inset: auto; opacity: 1; transform: none; pointer-events: auto; }
      /* on mobile each tab is just a label; panels stack below */
      .ptabs-tablist { display: none; }
    }
```

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 6: Visual check (desktop pin)**

`npm run dev`, then `node /tmp/shot.mjs http://localhost:4321/ '#why' /tmp/why1.png`, Read it.
Expected (desktop 1440px): dark band; left list of 3 reason titles with #01 active (filled), others muted; right card shows reason 01's title + body verbatim. Scroll within the pinned range and re-shot — active tab advances to 02 then 03, right card cross-fades. Copy must read exactly as the original reasons.

- [ ] **Step 7: Visual check (mobile fallback)**

`node /tmp/shot.mjs` won't change viewport; edit the helper viewport to `{width:390,height:844}` for one run, shot `#why`.
Expected: no pin, the three panels render stacked vertically, all copy visible.

- [ ] **Step 8: Commit**

```bash
git add src/components/PinnedTabs.astro src/lib/motion.ts src/pages/index.astro src/styles/global.css
git commit -m "feat(home): Why section as pinned scroll-tabs (dark band)"
```

---

## Task 6: Two Ways In — fixaplan product cards restyle

**Files:**
- Modify: `src/pages/index.astro` — restyle the two `.prod-card`s (the scoped `<style>` block at lines 358–406). Markup/copy verbatim; only CSS + minor class additions.

**Interfaces:**
- Consumes: `.panel--alt` background from Task 2. No new JS.

- [ ] **Step 1: Restyle `.prod-card`** in the page-scoped `<style>` in `index.astro`. Replace the existing `.prod-card { … }` rule's visual props to match the fixaplan card (bigger radius, hairline, lift on hover) — keep all selectors/copy:

```css
  .prod-card {
    display: flex; flex-direction: column;
    background: var(--bg);
    border: 1px solid var(--rule);
    border-radius: var(--rad-panel);
    padding: clamp(2rem, 3.5vw, 3rem);
    transition: transform .5s var(--ease-expo), border-color .4s ease-out, box-shadow .5s var(--ease-expo);
  }
  .prod-card:hover {
    border-color: rgba(247,91,29,0.35);
    transform: translateY(-4px);
    box-shadow: 0 18px 40px -24px rgba(34,34,34,0.25);
  }
```

(Leave `.prod-card-lbl`, `.prod-card-ttl`, `.prod-card-desc`, `.prod-card-meta`, `.prod-card-go` and the hover-arrow rules as they are.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Visual check**

`node /tmp/shot.mjs http://localhost:4321/ '#products' /tmp/prod.png`, Read it.
Expected: two cards on `--bg-alt` panel, large rounded corners, lift + orange hairline on hover. Both cards' copy verbatim; links `/id` and `/site` intact.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "style(home): fixaplan card treatment for Two Ways In"
```

---

## Task 7: Projects accordion restyle

**Files:**
- Modify: `src/styles/global.css` — restyle `.project-accordion` / `.project-row` / `.project-case` (lines ~373–476) for the fixaplan accordion look (panel surfaces, rounded rows, clearer expand). Markup/copy verbatim.

**Interfaces:**
- Consumes: tokens only. The `<details>`/`<summary>` behavior is native and unchanged.

- [ ] **Step 1: Restyle accordion rows.** Append an override block at the end of `src/styles/global.css` (don't edit the originals — append to win on cascade):

```css
    /* ── PROJECTS ACCORDION (fixaplan restyle) ── */
    #projects .project-list { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 2.5rem; }
    #projects .project-accordion, #projects .project-row--ph {
      background: var(--bg-alt); border: 1px solid var(--rule); border-radius: var(--rad);
      transition: border-color .4s ease-out, background .4s ease-out;
    }
    #projects .project-row { border-bottom: none; padding: 1.25rem 1.5rem; }
    #projects .project-accordion:hover { border-color: rgba(247,91,29,0.30); }
    #projects .project-accordion[open] { background: var(--bg); border-color: rgba(247,91,29,0.30); }
    #projects .project-list > :last-child .project-row,
    #projects .project-list > .project-row:last-child { border-bottom: none; }
    #projects .project-case { padding: 0 1.5rem 1.75rem; }
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Visual check**

`node /tmp/shot.mjs http://localhost:4321/ '#projects' /tmp/proj.png`, Read it.
Expected: each project is a rounded card row; hover shows orange hairline; opening KRAFTT/PMB expands the case panel inside the card. All project copy verbatim.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style(home): fixaplan accordion treatment for Projects"
```

---

## Task 8: The Studio restyle (two-column + device frame)

**Files:**
- Modify: `src/styles/global.css` — restyle `.studio-grid` / `.studio-av` (lines ~510–522) so the right placeholder reads as a light device/screen frame. Copy verbatim.

**Interfaces:**
- Consumes: tokens only. No JS.

- [ ] **Step 1: Restyle** — append to `src/styles/global.css`:

```css
    /* ── THE STUDIO (fixaplan restyle) ── */
    #studio .studio-av {
      aspect-ratio: 4 / 5; border-radius: var(--rad);
      background: linear-gradient(160deg, var(--bg) 0%, var(--bg-alt) 100%);
      border: 1px solid var(--rule);
      box-shadow: 0 24px 60px -36px rgba(34,34,34,0.30);
      display: grid; place-items: end start; padding: 1.25rem;
    }
    #studio .studio-av-lbl { font-family: var(--fm); font-size: 0.625rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--ink-m); }
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Visual check**

`node /tmp/shot.mjs http://localhost:4321/ '#studio' /tmp/studio.png`, Read it.
Expected: studio copy left, a soft framed "screen" panel right with the existing label. Copy + "Talk to Saja" button verbatim.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style(home): device-frame treatment for The Studio"
```

---

## Task 9: Testimonials panel polish

**Files:**
- Modify: `src/styles/global.css` — minor restyle of `.conv-card` (lines ~533+) to match the new card radius/rhythm. Behavior (auto-scroll, hover/tap pause) and copy unchanged.

**Interfaces:**
- Consumes: tokens. The existing testimonials `<script>` in `index.astro` is unchanged.

- [ ] **Step 1: Restyle** — append to `src/styles/global.css`:

```css
    /* ── TESTIMONIALS (fixaplan restyle) ── */
    #testimonials .conv-card {
      border-radius: var(--rad);
      border: 1px solid var(--rule);
      background: var(--bg);
    }
```

(If `.conv-card` already sets these, this is a harmless reaffirmation; do not change widths/animation.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Visual check**

`node /tmp/shot.mjs http://localhost:4321/ '#testimonials' /tmp/test.png`, Read it.
Expected: conversation cards still auto-scroll, now with consistent rounded/hairline cards on the light panel. Hover pauses (desktop). Copy verbatim.

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style(home): align testimonials cards to panel rhythm"
```

---

## Task 10: Footer dark-band interior polish

**Files:**
- Modify: `src/styles/global.css` — append dark-aware overrides for footer text/links so the already-dark footer (from Task 2) reads correctly on `#1a1a1a`. Copy/links verbatim.

**Interfaces:**
- Consumes: `.panel--dark` from Task 1/2.

- [ ] **Step 1: Footer-on-dark overrides** — append to `src/styles/global.css`:

```css
    /* ── FOOTER ON DARK BAND ── */
    .s-footer.panel--dark { color: var(--on-dark); }
    .s-footer.panel--dark .footer-sub,
    .s-footer.panel--dark .footer-tag,
    .s-footer.panel--dark .footer-links a,
    .s-footer.panel--dark .footer-contact,
    .s-footer.panel--dark .footer-legal a { color: var(--on-dark-m); }
    .s-footer.panel--dark .footer-logo,
    .s-footer.panel--dark .footer-big { color: var(--on-dark); }
    .s-footer.panel--dark .footer-links a:hover,
    .s-footer.panel--dark .footer-legal a:hover,
    .s-footer.panel--dark .footer-contact:hover { color: var(--accent); }
    .s-footer.panel--dark .slash-sep { color: rgba(244,242,238,0.18); }
    .s-footer.panel--dark .footer-bar,
    .s-footer.panel--dark .footer-legal { border-color: rgba(244,242,238,0.12); }
    .s-footer.panel--dark .footer-brand svg [fill="#222222"],
    .s-footer.panel--dark .footer-brand svg path[fill="#222222"] { fill: var(--on-dark); }
```

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Visual check**

`node /tmp/shot.mjs http://localhost:4321/ '#footer' /tmp/foot.png`, Read it.
Expected: dark footer with light text, the big CTA headline legible, links muted→orange on hover, separators faint, the logo mark visible on dark. All footer copy/links verbatim (Terms, Refund Policy, contact, nav).

- [ ] **Step 4: Commit**

```bash
git add src/styles/global.css
git commit -m "style(home): footer text/links tuned for dark band"
```

---

## Task 11: Reduced-motion + responsive + full-page verification

**Files:**
- Modify: `src/styles/global.css` — append a consolidated reduced-motion guard for the new motions; minor responsive fixes if screenshots reveal them.

**Interfaces:** none new — this is the integration/verification pass.

- [ ] **Step 1: Consolidated reduced-motion guard** — append to `src/styles/global.css`:

```css
    /* ── REDUCED MOTION: neutralize fixaplan motions ── */
    @media (prefers-reduced-motion: reduce) {
      .hero-media { transform: none !important; }
      .ptabs-panel { position: relative; opacity: 1; transform: none; }
      .ptabs-stage { min-height: 0; display: flex; flex-direction: column; gap: 1rem; }
    }
```

(JS already early-returns under reduced motion in `motion.ts`; this guarantees the static layout even if JS ran first.)

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: `Complete!`, no errors.

- [ ] **Step 3: Full-page desktop screenshot**

`node /tmp/shot.mjs http://localhost:4321/ full /tmp/final-desktop.png`, Read it.
Expected: full top-to-bottom — stacked panels, alternating light/`--bg-alt`, dark Why + dark footer, all 7 sections, copy verbatim, nav unchanged.

- [ ] **Step 4: Full-page mobile screenshot**

Set the helper viewport to `{width:390,height:844}`, `… full /tmp/final-mobile.png`, Read it.
Expected: panels stack cleanly; Why renders as stacked cards (no pin); hero bottom bar wraps; nothing overflows horizontally.

- [ ] **Step 5: Reduced-motion screenshot**

In the helper, launch with `chromium.launch()` and `b.newContext({ reducedMotion: 'reduce' })` (or add `await p.emulateMedia({ reducedMotion: 'reduce' })` after newPage). Shot `full`.
Expected: word-fill text at full ink, no parallax offset, Why as a static stacked list. Page fully readable.

- [ ] **Step 6: Link audit**

Confirm in the screenshots / DOM that CTAs resolve: hero `/id` + `/site`, products `/id` + `/site`, footer `/terms` + `/refund-policy` + `mailto`, nav menu intact.

- [ ] **Step 7: Cross-page regression**

`node /tmp/shot.mjs http://localhost:4321/id '-' /tmp/id.png` and `…/site '-' /tmp/site.png`, Read both.
Expected: `/id` and `/site` still render correctly (they share `Base.astro`'s nav/footer — confirm the dark footer looks right there too, since the footer change is global). If the dark footer is undesired on subpages, that's a follow-up decision — note it, don't fix here unless it's broken.

- [ ] **Step 8: Final commit**

```bash
git add src/styles/global.css
git commit -m "chore(home): reduced-motion guards + responsive verification"
```

---

## Self-review notes (coverage vs spec)

- §2.1 stacked panels → Tasks 1, 2. §2.2 word-fill + pill-tag eyebrows (§3/02) → Task 3. Hero parallax (spec §3/01) → Task 4. Pinned tabs / Why (spec §3/03, decision 5) → Task 5. Two Ways In (04) → Task 6. Projects (05) → Task 7. Studio (06) → Task 8. Testimonials (07) → Task 9. Dark footer → Tasks 2 + 10. Tokens §5 → Task 1. Reduced-motion/mobile fallbacks → embedded per task + consolidated in Task 11.
- **Nav unchanged** (post-approval edit) → no task touches `.nav`; only `.s-footer` in `Base.astro`.
- **Copy frozen** → Tasks 2/4/5 explicitly preserve verbatim strings; PinnedTabs copies the three reasons exactly; Task 11 link audit re-checks.
- **Note for executor:** the footer is global (`Base.astro`), so its dark restyle affects every page — Task 11 step 7 verifies `/id` and `/site` deliberately.
