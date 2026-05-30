# Scroll & Motion Overhaul — Implementation Brief
> For Claude Code. Read this entire file before touching any code.

---

## What we're doing and why

We studied the live DOM of five agency sites (Augen, Floema, Superpower, Mantis, WeAreMotto).
**Mantis** has the scroll feel we want: weighted, inertia-based, tactile, calm, premium.

This brief tells you exactly how to reproduce that feel for Resonance.OS.

---

## What creates the Mantis feel (do not skip this)

Three things in combination — all three are required:

**1. Smooth inertia scroll via Lenis**
The browser normally snaps scroll to the wheel delta. Lenis intercepts the wheel event and lerps the actual scroll position toward the target each rAF frame. The page *drifts* to a stop — it doesn't snap. This is the single biggest contributor to "premium/haptic/calm."

**2. One expo easing curve on every transition**
Mantis runs `cubic-bezier(.84, 0, .16, 1)` on every single transition across the entire site via a `--smooth` CSS token. This curve decelerates extremely hard — things start fast and float to a stop. The coherence across all elements is what reads as expensive.

**3. Staggered section arrivals replace scroll room**
Mantis achieves lingering via 900px section padding. We cannot and should not do that. Instead: each section has a choreographed GSAP entrance (staggered children, 700–900ms) that naturally slows the user's reading pace. The Lenis inertia carries between sections; the arrival animation makes them pause.

---

## Technology decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Smooth scroll | **Lenis** | Handles mobile/touch/iOS bounce/anchor links. Don't roll your own. |
| Animation engine | **GSAP + ScrollTrigger** | Already installed (`gsap ^3.15.0` in package.json). ScrollTrigger feeds on Lenis scroll ticks. |
| Replace IntersectionObserver reveals | **Yes** | GSAP gives stagger, per-element timing, and expo easing that CSS IO cannot. |
| Keep MetaballButton rAF lerp | **Yes — do not touch** | Already smooth. Lenis does not interfere with it. |
| Keep nav metaball rAF lerp | **Yes — do not touch** | Same reason. |
| Keep conv-track CSS carousel | **Yes — do not touch** | CSS `animation: conv-scroll 52s linear infinite` is correct. No change. |
| Keep logo-breathe keyframe | **Yes — do not touch** | Already correct. |
| Keep FAQ CSS transition | **Yes — do not touch** | 200ms ease-out on icon rotate is correct. |

---

## Install Lenis

```bash
npm install lenis
```

Lenis is ~8KB. It has no peer dependencies.

---

## File to create: `src/lib/scroll.ts`

Create this file. It wires Lenis into GSAP ScrollTrigger and exports the lenis instance.

```typescript
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScroll() {
  const lenis = new Lenis({
    lerp: 0.09,           // weighted but not sluggish — tuned for 13 short sections
    smoothWheel: true,
    wheelMultiplier: 0.85, // slight resistance, makes scroll feel intentional
    touchMultiplier: 1.5,  // slightly more responsive on touch
    infinite: false,
  });

  // Feed Lenis ticks into ScrollTrigger — required for scrub to work
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}
```

---

## Update `src/lib/gsap.ts`

The existing file registers ScrollTrigger and SplitText. Keep it, just make sure ScrollTrigger is registered there:

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

export { gsap, ScrollTrigger, SplitText };
```

No change needed if it already looks like this.

---

## CSS token changes — add to `:root` in `index.astro`

Replace `--ease-expo` and add the Mantis easing system:

```css
:root {
  /* ... existing tokens ... */

  /* REMOVE this line: */
  /* --ease-expo: cubic-bezier(0.19, 1, 0.22, 1); */

  /* ADD these: */
  --smooth:     cubic-bezier(.84, 0, .16, 1);   /* Mantis primary — use everywhere */
  --ease:       .8s cubic-bezier(.84, 0, .16, 1);
  --fast-ease:  .5s cubic-bezier(.84, 0, .16, 1);
  --color-ease: .4s ease-out;                    /* for color-only transitions */
}
```

Then do a find-replace: any existing `cubic-bezier(0.16, 1, 0.3, 1)` or `cubic-bezier(0.19, 1, 0.22, 1)` in transitions → replace with `var(--smooth)`.

**Also update the `.r` reveal class** — it will be replaced by GSAP but keep the CSS as a no-JS fallback:

```css
.r {
  opacity: 0;
  transform: translateY(20px);
  /* Remove the CSS transition — GSAP handles this now */
}
.r.v { opacity: 1; transform: translateY(0); }
```

**Remove all `.r[data-d]` transition-delay rules** — GSAP stagger handles timing instead.

**Add to `html` tag — remove `scroll-behavior: smooth`** because Lenis takes over:

```css
html { font-size: 16px; /* remove: scroll-behavior: smooth; */ }
```

---

## Remove the IntersectionObserver scroll reveal script

In `index.astro`, find and DELETE this block:

```javascript
// Scroll reveals
const ro = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('v'); ro.unobserve(e.target); }
  }),
  { threshold: 0.08 }
);
document.querySelectorAll('.r').forEach(el => ro.observe(el));
```

GSAP ScrollTrigger replaces this entirely.

---

## Main script block — replace with this

In `index.astro`, the `<script>` tag at the bottom keeps the metaball nav code and adds the new scroll/reveal system.

```typescript
import { initScroll } from '../lib/scroll';
import { gsap } from '../lib/gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// ── LENIS + SCROLL ──────────────────────────────
const lenis = initScroll();

// ── SECTION REVEALS ─────────────────────────────
// Each section: label first (no delay), then h2 lines staggered, then body, then visual
// Trigger: when section top hits 88% of viewport height

// Generic reveal for any .r element not inside a specific group
gsap.utils.toArray<HTMLElement>('.r').forEach((el) => {
  gsap.from(el, {
    opacity: 0,
    y: 20,
    duration: 0.85,
    ease: 'cubic-bezier(.84, 0, .16, 1)',
    scrollTrigger: {
      trigger: el,
      start: 'top 90%',
      once: true,
    },
  });
});

// Section-level stagger: children of each .s animate as a group
gsap.utils.toArray<HTMLElement>('.s').forEach((section) => {
  const items = section.querySelectorAll('.r');
  if (!items.length) return;
  gsap.from(items, {
    opacity: 0,
    y: 22,
    duration: 0.9,
    ease: 'cubic-bezier(.84, 0, .16, 1)',
    stagger: 0.09,
    scrollTrigger: {
      trigger: section,
      start: 'top 88%',
      once: true,
    },
  });
});

// ── HERO — does NOT animate on scroll ───────────
// hero-h1 never animates (same rule as Mantis/Resonance.OS spec)
// hero-eyebrow and hero-sub and hero-ctas animate on page load only
gsap.from(['.hero-eyebrow', '.hero-sub', '.hero-ctas'], {
  opacity: 0,
  y: 16,
  duration: 1.0,
  ease: 'cubic-bezier(.84, 0, .16, 1)',
  stagger: 0.12,
  delay: 0.2,
});

// ── HERO GRADIENT SCRUB ─────────────────────────
// The hero section gently parallaxes as you scroll away from it
// This gives depth without pinning — calibrated for shorter section heights
gsap.to('.s-hero', {
  y: -40,
  ease: 'none',
  scrollTrigger: {
    trigger: '.s-hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
});

// ── LOGO SEPARATORS ─────────────────────────────
// Each separator logo mark subtly scales up as it enters view
gsap.utils.toArray<HTMLElement>('.logo-sep-mark').forEach((mark) => {
  gsap.from(mark, {
    scale: 0.8,
    opacity: 0,
    duration: 1.2,
    ease: 'cubic-bezier(.84, 0, .16, 1)',
    scrollTrigger: {
      trigger: mark,
      start: 'top 85%',
      once: true,
    },
  });
});

// ── EDITORIAL LIST ITEMS ─────────────────────────
// Each .editorial-item reveals with a horizontal hairline draw + content fade
// The border-top "draws in" via scaleX
gsap.utils.toArray<HTMLElement>('.editorial-item').forEach((item, i) => {
  gsap.from(item, {
    opacity: 0,
    y: 24,
    duration: 0.85,
    ease: 'cubic-bezier(.84, 0, .16, 1)',
    delay: i * 0.08,
    scrollTrigger: {
      trigger: item,
      start: 'top 88%',
      once: true,
    },
  });
});

// ── PROJECT ROWS ─────────────────────────────────
// Stagger rows with a tight 0.06s interval — feels like a list loading in
gsap.from('.project-row', {
  opacity: 0,
  x: -12,
  duration: 0.7,
  ease: 'cubic-bezier(.84, 0, .16, 1)',
  stagger: 0.06,
  scrollTrigger: {
    trigger: '.project-list',
    start: 'top 88%',
    once: true,
  },
});

// ── VAULT / BROWSER CARDS ────────────────────────
// These are larger visual blocks — reveal with a gentle rise and slight scale
gsap.utils.toArray<HTMLElement>('.vault-preview, .vault-full, .browser').forEach((card) => {
  gsap.from(card, {
    opacity: 0,
    y: 32,
    scale: 0.98,
    duration: 1.0,
    ease: 'cubic-bezier(.84, 0, .16, 1)',
    scrollTrigger: {
      trigger: card,
      start: 'top 88%',
      once: true,
    },
  });
});

// ── STEPS ────────────────────────────────────────
gsap.from('.step', {
  opacity: 0,
  y: 20,
  duration: 0.8,
  ease: 'cubic-bezier(.84, 0, .16, 1)',
  stagger: 0.1,
  scrollTrigger: {
    trigger: '.steps',
    start: 'top 88%',
    once: true,
  },
});

// ── VAULT MODULES ────────────────────────────────
gsap.from('.vmod', {
  opacity: 0,
  y: 16,
  duration: 0.7,
  ease: 'cubic-bezier(.84, 0, .16, 1)',
  stagger: 0.05,
  scrollTrigger: {
    trigger: '.vault-modules',
    start: 'top 88%',
    once: true,
  },
});

// ── METABALL NAV (unchanged — keep existing code below) ──────────────────
// ... paste existing metaball nav IIFE here unchanged ...
```

---

## Per-section choreography spec

This is the intent behind each section's animation. Reference this if you need to adjust timing.

| Section | First element | Stagger target | Duration | Note |
|---------|--------------|---------------|----------|------|
| Hero | `.hero-eyebrow → .hero-sub → .hero-ctas` | page load | 1.0s | H1 never animates |
| Logo separators | `.logo-sep-mark` | scale from 0.8 | 1.2s | One of the slower reveals — intentional |
| All `.s` sections | `.lbl → .h2 → .body` | 0.09s stagger | 0.9s | Generic group reveal |
| Editorial list | `.editorial-item` | 0.08s per item | 0.85s | Items are tall — stagger feels like reading |
| Project rows | `.project-row` | 0.06s per row | 0.7s | Tighter stagger — list loads like data |
| Vault/Browser cards | `.vault-preview`, `.vault-full`, `.browser` | none (single) | 1.0s | Scale 0.98→1 on entry |
| Steps grid | `.step` | 0.1s per step | 0.8s | Left→center→right read order |
| Vault modules | `.vmod` | 0.05s per module | 0.7s | Fast — grid of small items |
| Footer CTA | treated as `.s` | 0.09s stagger | 0.9s | — |

---

## Lenis configuration explained

```typescript
new Lenis({
  lerp: 0.09,
  // Range: 0 (frozen) → 1 (native scroll).
  // Mantis feel is approximately 0.06–0.08.
  // 0.09 is slightly more responsive for our denser section structure.
  // If it feels too fast: lower to 0.07. If too sluggish: raise to 0.11.

  wheelMultiplier: 0.85,
  // Slows wheel scroll by 15%. Makes each scroll gesture feel deliberate.
  // Range: 0.7 (very slow) → 1.0 (default speed).

  touchMultiplier: 1.5,
  // Touch should feel more responsive than wheel. 1.5 is natural.
  // Do not lower below 1.2 or mobile will feel sluggish.

  smoothWheel: true,
  // Must be true. This is the whole point.

  infinite: false,
  // Never set to true for a standard page.
})
```

---

## Easing curve guide

All animation uses one curve: `cubic-bezier(.84, 0, .16, 1)`

In GSAP this is written as a string directly — GSAP accepts standard CSS cubic-bezier syntax.

Do NOT use GSAP named eases (`power2.out`, `expo.out`) — they won't match the CSS transitions.

**Duration scale:**
- `0.7s` — fast UI elements (project rows, small modules)
- `0.85s` — standard content reveals
- `0.9s` — section group reveals
- `1.0s` — large cards and hero elements
- `1.2s` — logo separators (the slowest, most deliberate)

Never invent new durations. Always pick from this list.

---

## What to leave completely unchanged

- `.MetaballButton` — the SVG rAF lerp. Do not touch. Works perfectly with Lenis.
- `.fl-menu` / metaball nav IIFE — the gap lerp. Do not touch.
- `.conv-track` / `conv-scroll` keyframe — CSS carousel. Do not touch.
- `.logo-breathe` keyframe — breathing animation. Do not touch.
- `.faq-icon` transition — 200ms ease-out rotate. Do not touch.
- `.project-row` hover opacity transition — do not touch.
- `prefers-reduced-motion` block — keep and extend:

```css
@media (prefers-reduced-motion: reduce) {
  .r { opacity: 1; transform: none; }
  .logo-sep-mark { animation: none; opacity: 0.15; }
  .conv-track { animation: none; }
  .faq-icon { transition: none; }
}
```

And in JS, skip initScroll() and all GSAP animations when reduced motion is preferred:

```typescript
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  initScroll();
  // ... all GSAP code ...
  document.querySelectorAll('.r').forEach(el => el.classList.add('v')); // show everything immediately
}
```

---

## Known constraints

- **Astro 6.x** — scripts in `.astro` pages run as `<script>` tags with `type="module"` by default. Import Lenis from `lenis` (npm package), not a CDN.
- **GSAP 3.15.0** is already in `package.json`. Do not upgrade or reinstall it.
- **SplitText** is imported in `gsap.ts` — it's available if you want to animate headline text character by character, but it is not required by this brief.
- **`scroll-behavior: smooth`** on `html` must be removed — it conflicts with Lenis and causes double-smooth behavior on anchor links.
- **Spline viewer** in the hero: Lenis does not interfere with it. No changes needed there.
- **Anchor links** (`#id`, `#site`, etc.) used by the nav metaball: Lenis handles these automatically. No custom scroll-to code needed.

---

## Validation checklist

After implementation, verify:

- [ ] Page scrolls with visible inertia — drifts to a stop, does not snap
- [ ] All `.r` elements start invisible and animate in when scrolled into view
- [ ] Hero H1 is visible immediately — no animation on it
- [ ] Hero sub and CTAs fade in on page load (not on scroll)
- [ ] Logo separators scale in gently as they enter view
- [ ] Project rows slide in from left with stagger
- [ ] Vault/browser cards rise with subtle scale
- [ ] MetaballButton still lerps smoothly on hover
- [ ] Nav metaball still tracks active section
- [ ] Conv-track carousel still scrolls
- [ ] FAQ icon still rotates on open
- [ ] On `prefers-reduced-motion`: everything visible immediately, no animation, scroll is native
- [ ] Anchor links (`#id`, `#site`, etc.) still navigate correctly
- [ ] No `console.error` in browser devtools

---

## The one tuning knob

If the scroll feels wrong after implementation:

**Too fast / snappy:** Lower `lerp` from `0.09` → `0.07`
**Too slow / drunk:** Raise `lerp` from `0.09` → `0.11`
**Wheel gesture too sensitive:** Lower `wheelMultiplier` from `0.85` → `0.75`

Do not touch anything else. These three values control the entire feel.
