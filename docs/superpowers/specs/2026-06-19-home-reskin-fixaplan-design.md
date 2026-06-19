# Resonance.OS — Home page reskin (fixaplan structure)

**Date:** 2026-06-19
**Author:** Saja Dehaan + Claude
**Status:** Design — awaiting review
**File touched:** `src/pages/index.astro` (full rebuild), `src/styles/global.css` (new primitives), possibly `src/layouts/Base.astro` (nav pill), new partials under `src/components/`.

---

## 1. Goal

Rebuild the Resonance.OS home page end-to-end using the **section structure and scroll motion** of fixaplan.com, expressed entirely in Resonance.OS **content, voice, and design tokens**. The reference gives us layout + motion; the brand gives us type, color, and copy.

Reference source: a 22s screen recording of fixaplan.com (`fixaplan.com 1.mp4`), torn down frame-by-frame. fixaplan is an editorial SaaS landing page for an ADHD planner.

### Decisions locked (from brainstorming)
1. **Scope** — full reskin of `index.astro`, replacing the current home flow.
2. **Imagery** — *hybrid*: photographic hero + one gradient band; every card / stat / pinned-tab panel stays typographic/UI (vault cards, Spline, monospace). Only 1 photo asset required, and it is optional (see §6).
3. **Headlines** — keep **Urbanist + diagonal-line reveals**. No italic serif is introduced.
4. **Dark bands** — *yes*. Introduce two warm-dark sections (pinned-tabs + footer). Deep charcoal `#1a1a1a` with a faint orange glow, never pure black.
5. **Pinned-tabs content** — the **process**: Intake → Generate → Read → Ship.
6. **Hero photo** — build to **degrade gracefully** to a gradient/Spline fallback until a photo is dropped in.

### Non-goals
- No new fonts (no italic serif).
- No CMS / data layer changes; copy stays inline in the Astro page as today.
- No rework of `/id`, `/site`, or legal pages beyond linking to them from the new footer.
- No stock photography sourcing — the hero accepts an image when the user supplies one; until then it renders the fallback.

---

## 2. Global shell — three new primitives

These are shared mechanisms the sections compose from. Each is independently understandable and testable.

### 2.1 Floating pill nav
- Replaces the current sticky top `.nav`. A centered white pill (`--white`, `--rad-btn`, soft shadow) holding the `Resonance.OS` wordmark + the existing metaball menu.
- `position: fixed; top: clamp(0.75rem, 2vw, 1.25rem)`, horizontally centered, `z-index: 200` (above all panels).
- Stays put through the whole scroll. No hide-on-scroll behavior in v1.
- **What it does:** persistent brand + nav anchor. **Depends on:** existing `MetaballButton` / metaball menu markup, `--white`, `--rad-btn`.

### 2.2 Stacked rounded panels
- Each top-level section is a `.panel` with a large top radius (`clamp(1.5rem, 4vw, 2.5rem)`) that visually slides up over the previous panel as the user scrolls.
- Implementation: each panel is `position: relative; z-index` increasing per panel, with `margin-top: -<radius>` overlap and its own background. The radius + overlap creates fixaplan's "card stacking" read. No JS required for the stack itself — pure layout + a `border-radius` on the top corners. Backgrounds alternate `--bg` / `--bg-alt`, with the two dark bands using `--ink-panel` (new token, see §5).
- **What it does:** the structural rhythm of the whole page. **Depends on:** layout tokens only.

### 2.3 Word-fill scroll reveal
- Text reveals word-by-word from `--ink-m` (muted gray) to `--ink` as the section crosses the viewport — fixaplan's signature "Now is the time." fill.
- Implementation: GSAP ScrollTrigger (already a dependency, see `src/lib/gsap.ts` / `scroll.ts`) driving per-word `color`/opacity across a scrub range. Words wrapped at build via a small Astro helper or inline `<span>`s.
- Composes with the existing `diag-line` stagger — fill-reveal is for body/statement lines; `diag-line` stays for stacked display headlines.
- **What it does:** the dominant reveal motion. **Depends on:** GSAP ScrollTrigger, `--ink`, `--ink-m`.
- **Reduced motion:** when `prefers-reduced-motion: reduce`, words render at full `--ink` immediately; no scrub.

---

## 3. Section-by-section spec

Replaces the current order (Hero → Gap → Why → Two Ways In → Projects → Studio → Testimonials). New order:

### 01 — Hero (parallax, held text)
- Full-viewport panel. Background = hero photo when supplied, else **fallback**: existing Spline mark over a soft `--bg`→`--bg-alt` gradient.
- Held headline (Urbanist, `diag-line` stagger): *"Clients meet you in person. They don't recognize you online."*
- Sub: existing hero sub copy. The background parallaxes upward faster than the headline as you scroll (GSAP `y` on the media layer; reduced-motion disables).
- Bottom bar: tagline left (*"A brand identity studio for boutique movement & wellness operators."*) + `Start your ID — €247` pill (existing `MetaballButton`, links `/id`).
- Eyebrow `// RESONANCE.OS — BRAND IDENTITY FOR MOVEMENT & WELLNESS` retained.

### 02 — Fill-reveal statement
- `--bg-alt` panel, centered. Single line, word-fill reveal: **"Your brand already exists."**
- Short — one viewport, generous whitespace, like fixaplan's "Now is the time."

### 03 — The Gap (tag + intro)
- Eyebrow `// THE GAP`. Headline *"The room you hold doesn't survive the trip to your website."* (`diag-line`).
- Body = existing Gap paragraph, rendered with word-fill reveal.

### 04 — Stat cards (animated, over gradient)
- Panel with a soft orange gradient wash (`--accent-s` → `--bg`). Floating frosted-glass UI cards (not photography — hybrid rule).
- Animated bars + count-up on scroll-in:
  - **Cost** — `€247` (vs `€5,000` typical) — bar fills low/short = "less".
  - **Time** — `~20 min` (vs `6 weeks`) — bar.
  - **Modules** — `7` count-up.
  - **Delivery** — `same day`.
- Frosted card style: `backdrop-filter: blur`, translucent white, `--rule` border. Numbers count up via GSAP (reduced-motion → final value shown).

### 05 — "Designed differently" + 3-card grid
- Eyebrow `// A DIFFERENT KIND OF STUDIO`. Eyebrow-statement *"Three reasons we're not the agency you've been quoted by."* (big `diag-line`).
- The existing three Why reasons become a **3-card icon grid** (`.feature-card`): each card = monospace icon/number + title + description.
  1. *Built around recognition, not deliverables.*
  2. *Built to be useful in 30 seconds.*
  3. *Built for one specific market.*
- Cards reveal with a small stagger fade/translate on scroll-in.

### 06 — Pinned scroll-tabs (signature) — **warm-dark band**
- `--ink-panel` dark band. Headline left: *"How a brand identity arrives in one evening."*
- **Sticky left** vertical tab list; **right** panel morphs per active tab. As the user scrolls the section, the active tab advances and the right card swaps. Active tab = filled pill (`--accent` or white-on-dark); inactive = muted.
- Four tabs = the process, each with a typographic/UI mock card on the right:
  1. **Intake** — *"Answer 12 questions."* Right: a mock intake-question card (question + text field UI).
  2. **Generate** — *"The system reads every word and writes the brand."* Right: a processing/"generating" card (animated line shimmer).
  3. **Read** — *"Your vault, the same evening."* Right: a **`.vault-card`** mockup (reuse existing component — swatches, tagline, modules).
  4. **Ship** — *"Straight into your next post."* Right: a card showing the tagline dropped into a class description / caption.
- Implementation: ScrollTrigger pins the section; scroll progress maps to active index (0–3); right panels cross-fade. Bottom-left sticky CTA `Start your ID`.
- **Reduced motion / no-pin fallback:** if pinning is disabled (reduced motion or narrow viewport), render the four tab+card pairs as a normal stacked vertical list (no pin, no morph).
- **Mobile:** no pin. Tabs collapse to a stacked list of four labeled cards.

### 07 — "Meet the system" (accordion + device mockup)
- `--bg` panel. Eyebrow `// THE STUDIO`. Headline *"One person, plus a system that does the listening at scale."*
- **Left:** accordion (native `<details>`, matching existing `.project-accordion` styling):
  - *The system reads every intake.*
  - *The person reviews every output before it ships.*
  - *Delivered the same day.*
- **Right:** a device mockup (CSS frame, no photo) showing the **live vault dashboard** — reuse `.vault-card` content inside a browser/phone chrome.
- Retains the "Talk to Saja" ghost button.

### 08 — Testimonials (kept asset)
- `--bg-alt` panel. The existing conversation-card auto-scroll strip, unchanged in behavior (hover/tap to pause). Eyebrow `// TESTIMONIALS` + headline *"What people said after their Resonance.ID landed."*

### 09 — Gradient band + deliverables tag cloud
- Full-bleed **orange gradient** panel (`--accent` based, warm). Right-aligned big headline: *"For the moment your old site stops matching you."* + `Start your ID` pill.
- Tag cloud of deliverables as pills: `Palette · Tagline · Voice · Type system · Site · Brand Vault`. Leads into Resonance.SITE (link `/site`).

### 10 — FAQ accordion
- `--bg` panel. Eyebrow `// FAQ` + intro *"Still deciding? Here's what people ask before they start."*
- Accordion (`<details>`):
  - *Is this only for movement & wellness studios?*
  - *What do I actually get for €247?*
  - *How is it delivered the same day?*
  - *Do I need the website too?*
  - *Who owns the output?*

### 11 — Mirrored big-text outro
- `--bg-alt`. Huge Urbanist headline with a reflected/faded mirror of the second line (CSS `transform: scaleY(-1)` + mask gradient): **"Where your body finds its frequency."** (the recommended tagline).

### 12 — Footer — **warm-dark band**
- `--ink-panel` rounded footer. `Resonance.OS` wordmark + `Start your ID — €247` pill + a one-line "early updates" note.
- Columns: **Studio** (Home, Resonance.ID, Resonance.SITE, Projects) · **Social** (Instagram, LinkedIn) · **Contact** (saja@resonance-os.studio).
- Legal row: © 2026 Resonance.OS · Terms (`/terms`) · Refund Policy (`/refund-policy`).
- Spline mark may sit as a faint accent.

---

## 4. Motion system summary

| Motion | Where | Tech | Reduced-motion |
|---|---|---|---|
| Stacked panels | All sections | CSS radius + overlap | unaffected (static stack) |
| Parallax media | Hero | GSAP `y` scrub | disabled (static) |
| Word-fill reveal | 02, 03 | ScrollTrigger scrub per-word color | instant full `--ink` |
| Count-up + bar fill | 04 | GSAP on enter | final values shown |
| Card stagger | 05 | ScrollTrigger batch | instant |
| Pinned tab morph | 06 | ScrollTrigger pin + index map | unpinned vertical list |
| Mirror reflection | 11 | CSS only | unaffected |

All ScrollTrigger usage builds on existing `src/lib/gsap.ts` + `src/lib/scroll.ts` (Lenis). Honor the existing reveal convention (`.r` + `data-d`) where it already works.

---

## 5. Tokens — additions

Add to `:root` in `global.css` (extends, does not replace):

```css
--ink-panel:  #1a1a1a;                 /* warm-dark band bg */
--ink-panel-2:#222222;                 /* dark band raised surface */
--on-dark:    #f4f2ee;                 /* text on dark */
--on-dark-m:  rgba(244,242,238,0.55);  /* muted text on dark */
--accent-glow:radial-gradient(...);    /* faint orange glow for dark bands */
--rad-panel:  clamp(1.5rem,4vw,2.5rem);/* stacked-panel top radius */
```

Existing tokens reused as-is: `--bg`, `--bg-alt`, `--ink`, `--ink-m`, `--accent`, `--accent-s`, `--rule`, `--fu`, `--fm`, `--rad`, `--rad-btn`, `--ease-expo`.

---

## 6. Reuse vs. new

**Reused components/patterns:** `MetaballButton` + metaball menu, `.vault-card`, conversation/testimonial cards, `.project-accordion` (→ FAQ + Meet-the-system accordions), `diag-line` headline stagger, monospace eyebrows, Spline mark, `.r`/`data-d` reveal convention.

**New components (proposed files):**
- `src/components/PillNav.astro` — floating pill nav.
- `src/components/StatCard.astro` — frosted animated stat card.
- `src/components/FeatureCard.astro` — 3-card grid item.
- `src/components/PinnedTabs.astro` — the signature section (pin + morph controller + four panels).
- Section markup itself stays inline in `index.astro` (matching the current page's style of inline sections + a scoped `<style>` + `<script>`), with shared primitives in `global.css`.

---

## 7. Open items / dependencies
- **Hero photo:** none today. Hero ships with the gradient/Spline fallback; dropping a file into `public/` + setting one variable swaps it in. No blocker.
- **Device-mockup chrome (07):** pure CSS frame; no asset.
- **Section 09 gradient:** pure orange gradient (no photo), per hybrid rule — confirmed acceptable.

---

## 8. Acceptance criteria
1. `index.astro` renders all 12 sections in order with stacked-panel rhythm and the two dark bands.
2. Pinned scroll-tabs section pins on desktop, advances through Intake→Generate→Read→Ship, and degrades to a vertical list on mobile / reduced-motion.
3. Word-fill, parallax, count-up, and stagger motions run on desktop and are disabled under `prefers-reduced-motion: reduce`.
4. Hero renders correctly with no photo (fallback) and with a photo (when supplied).
5. All CTAs link correctly (`/id`, `/site`, mail, `/terms`, `/refund-policy`).
6. No regression to `/id`, `/site`, or legal pages.
7. Build passes (`astro build`) with no console errors.
