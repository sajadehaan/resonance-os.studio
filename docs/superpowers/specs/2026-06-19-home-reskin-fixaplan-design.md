# Resonance.OS — Home page restyle (fixaplan visual language)

**Date:** 2026-06-19
**Author:** Saja Dehaan + Claude
**Status:** Design — awaiting review (rev 2)
**Files touched:** `src/pages/index.astro` (restyle in place), `src/styles/global.css` (new primitives + tokens), `src/layouts/Base.astro` (pill nav + dark footer), new partials under `src/components/`.

---

## 1. Goal

Restyle the existing Resonance.OS home page in the **visual language and scroll motion of fixaplan.com** — *without changing the section structure, the section order, or the copy*. Same information, new clothes.

Reference: a 22s screen recording of fixaplan.com, torn down frame-by-frame.

### Hard constraints (from the user)
- **Do not change the structure.** Keep the same 7 sections in the same order.
- **Do not change the information.** All headlines, body copy, eyebrows, CTAs, project text, testimonials stay **verbatim**.
- **Only change styling and section design.** Visual treatment, layout of each section, and motion are in scope.

### Decisions locked (from brainstorming)
1. **Scope** — restyle `index.astro` in place.
2. **Imagery** — *hybrid*: parallax hero media + optional gradient accents; all cards/panels stay typographic/UI (vault cards, Spline, monospace). No new photography required.
3. **Headlines** — keep **Urbanist + diagonal-line reveals**. No italic serif.
4. **Dark bands** — *yes*: introduce warm-dark treatment on the pinned-tabs section and the footer. Deep charcoal `#1a1a1a` + faint orange glow, never pure black.
5. **Pinned scroll-tabs** — applied to the existing **"Why — three reasons"** section. Each reason is a tab; existing title = tab label, existing description shows on the right with a vault-card-style visual. Copy verbatim.
6. **Hero photo** — none today; hero degrades gracefully to the existing Spline mark over a gradient. A photo can be dropped in later via one variable.

### Dropped from rev 1 (would have required new content — out of scope now)
- Stat-metrics band, FAQ section, gradient "too loud" band, the "Your brand already exists." statement line, the mirrored-outro line. None of these exist in the current copy, so they are removed.

### Non-goals
- No new fonts, no copy edits, no section reordering, no new sections.
- No CMS/data changes; copy stays inline in the Astro page.
- No rework of `/id`, `/site`, or legal pages beyond the footer links that already point to them.

---

## 2. Global shell — three new primitives

Shared mechanisms the sections compose from. Each is independently understandable and testable.

### 2.1 Floating pill nav
- Restyle the current sticky `.nav` into a centered white pill (`--white`, `--rad-btn`, soft shadow) holding the `Resonance.OS` wordmark + existing metaball menu.
- `position: fixed; top: clamp(0.75rem, 2vw, 1.25rem)`, horizontally centered, `z-index: 200`. No content change — same logo + same menu links.

### 2.2 Stacked rounded panels
- Each existing section becomes a `.panel` with a large top radius (`--rad-panel`) that slides up over the previous panel on scroll.
- Pure layout: increasing `z-index` per panel + `margin-top` overlap + per-panel background. Backgrounds alternate `--bg` / `--bg-alt`; the Why (pinned-tabs) section and the footer use `--ink-panel`.
- The existing `.logo-sep` separators are folded into the panel transitions (kept as a faint accent at panel seams, not removed).

### 2.3 Word-fill scroll reveal
- Existing body/statement copy reveals word-by-word from `--ink-m` → `--ink` as the section crosses the viewport (fixaplan's signature fill). Applied to existing paragraphs only — no new text.
- GSAP ScrollTrigger (already a dependency) drives per-word color over a scrub range; words wrapped in `<span>` at render.
- Composes with the existing `diag-line` stagger (kept for stacked display headlines).
- **Reduced motion:** words render at full `--ink` immediately.

---

## 3. Section-by-section restyle

Existing order preserved: Hero → The Gap → Why → Two Ways In → Projects → The Studio → Testimonials → Footer. **All copy verbatim.**

### 01 — Hero  *(restyle: parallax held-text + bottom bar)*
- Full-viewport panel. Media layer = hero photo when supplied, else the **existing Spline mark** over a soft `--bg`→`--bg-alt` gradient (current fallback).
- Existing headline (*"Clients meet you in person. They don't recognize you online."*) held with `diag-line` stagger while the media parallaxes upward.
- Existing sub copy retained. CTAs (`Start your ID — €247`, `Explore Resonance.SITE`) regrouped into a fixaplan-style **bottom bar** with the eyebrow/tagline. Existing **vault card** kept as a floating UI element.
- No copy change; layout + parallax only.

### 02 — The Gap  *(restyle: pill eyebrow + word-fill body)*
- Eyebrow `// THE GAP` styled as a fixaplan pill tag. Existing headline kept with `diag-line`. Existing Gap paragraph rendered with word-fill reveal.

### 03 — Why — three reasons  *(restyle: PINNED SCROLL-TABS, dark band)*
- `--ink-panel` warm-dark band. Existing eyebrow `// A DIFFERENT KIND OF STUDIO` + existing headline *"Three reasons we're not the agency you've been quoted by."*
- **Sticky left** tab list = the three existing reason titles (verbatim):
  1. *Built around recognition, not deliverables.*
  2. *Built to be useful in 30 seconds.*
  3. *Built for one specific market.*
- **Right** panel morphs per active tab, showing that reason's **existing description** (verbatim) inside a vault-card-style surface.
- Scroll pins the section; progress maps to active index (0–2); panels cross-fade; active tab = filled pill, inactive muted.
- **Reduced motion / mobile:** no pin — the three tab+panel pairs render as a normal vertical stack (existing copy intact).

### 04 — Two Ways In  *(restyle: fixaplan product cards)*
- Existing eyebrow + headline + the two existing product cards (Resonance.ID / Resonance.SITE) restyled in fixaplan's card aesthetic (larger radius, refined hover, meta row). All card copy verbatim. Links unchanged (`/id`, `/site`).

### 05 — Projects  *(restyle: refined accordion)*
- Existing `.project-accordion` rows (KRAFTT, PMB, placeholders) restyled to match fixaplan's accordion treatment (panel radius, expand affordance, case-study layout). All project copy verbatim.

### 06 — The Studio  *(restyle: "meet the system" layout)*
- Existing eyebrow + headline + studio copy + "Talk to Saja" button kept verbatim. Restyle the studio-grid into fixaplan's two-column treatment; the existing `.studio-av` placeholder may take a light device-mockup frame. No copy change.

### 07 — Testimonials  *(restyle: panel)*
- Existing conversation-card auto-scroll strip kept, including hover/tap-to-pause behavior. Restyle as a panel with the fixaplan rhythm. All testimonial copy verbatim.

### Footer  *(restyle: warm-dark band)*
- The existing footer (in `Base.astro`) restyled into a `--ink-panel` rounded dark band. Same links/content — wordmark, nav, contact, legal (`/terms`, `/refund-policy`). No new copy beyond what already exists there.

---

## 4. Motion system summary

| Motion | Where | Tech | Reduced-motion |
|---|---|---|---|
| Stacked panels | All sections | CSS radius + overlap | unaffected (static) |
| Parallax media | Hero | GSAP `y` scrub | disabled (static) |
| Word-fill reveal | The Gap (+ other existing body copy) | ScrollTrigger scrub per-word | instant full `--ink` |
| Diagonal stagger | All display headlines | existing `diag-line` | existing behavior |
| Pinned tab morph | Why | ScrollTrigger pin + index map | unpinned vertical list |
| Card hover / accordion | Two Ways In, Projects | CSS | unaffected |

Built on existing `src/lib/gsap.ts` + `src/lib/scroll.ts` (Lenis) and the existing `.r` + `data-d` reveal convention.

---

## 5. Tokens — additions only

Add to `:root` in `global.css` (extends, never replaces existing tokens):

```css
--ink-panel:  #1a1a1a;                 /* warm-dark band bg */
--ink-panel-2:#222222;                 /* dark band raised surface */
--on-dark:    #f4f2ee;                 /* text on dark */
--on-dark-m:  rgba(244,242,238,0.55);  /* muted text on dark */
--rad-panel:  clamp(1.5rem,4vw,2.5rem);/* stacked-panel top radius */
```

Existing tokens reused as-is: `--bg`, `--bg-alt`, `--ink`, `--ink-m`, `--accent`, `--accent-s`, `--rule`, `--fu`, `--fm`, `--rad`, `--rad-btn`, `--ease-expo`.

---

## 6. Reuse vs. new

**Reused (unchanged content/behavior):** all section copy, `MetaballButton` + metaball menu, `.vault-card`, conversation/testimonial cards, `.project-accordion`, `diag-line` headline stagger, monospace eyebrows, Spline mark, `.r`/`data-d` reveal convention, footer links.

**New components (proposed files):**
- `src/components/PillNav.astro` — floating pill nav (wraps existing menu).
- `src/components/PinnedTabs.astro` — pinned scroll-tabs controller, fed the three existing reasons as props.
- Section markup stays inline in `index.astro` (matching the page's current inline-section + scoped-`<style>`/`<script>` pattern); shared primitives live in `global.css`.

---

## 7. Open items / dependencies
- **Hero photo:** none today → hero renders the Spline/gradient fallback; dropping a file in `public/` + setting one variable swaps it in. No blocker.
- **Studio device frame (06):** pure CSS, no asset.

---

## 8. Acceptance criteria
1. Same 7 sections in the same order, all copy verbatim — diff shows styling/markup-structure changes only, no wording changes.
2. Stacked-panel rhythm with two warm-dark bands (Why + footer); pill nav floats over all panels.
3. Why section pins and advances through the three existing reasons on desktop; degrades to a vertical stack on mobile / reduced-motion.
4. Word-fill, parallax, and stagger run on desktop and are disabled under `prefers-reduced-motion: reduce`.
5. Hero renders correctly with no photo (fallback) and with a photo (when supplied).
6. All existing CTAs/links still resolve (`/id`, `/site`, mail, `/terms`, `/refund-policy`).
7. No regression to `/id`, `/site`, or legal pages. `astro build` passes with no console errors.
