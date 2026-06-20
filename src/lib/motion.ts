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
export function initPinnedTabs() {
  document.querySelectorAll<HTMLElement>('[data-ptabs]').forEach((root) => {
    const panels = root.querySelectorAll<HTMLElement>('.ptabs-panel');
    const segs   = root.querySelectorAll<HTMLElement>('.ptabs-rail-seg');
    const n = panels.length;
    if (!n) return;

    // Pin the whole heading + cards block so the heading stays static while
    // the cards advance. Falls back to the cards container if no wrapper.
    const pinEl = (root.closest<HTMLElement>('[data-ptabs-pin]')) || root;

    const setActive = (idx: number, frac: number) => {
      panels.forEach((p, i) => p.classList.toggle('is-active', i === idx));
      segs.forEach((s, i) => {
        s.classList.toggle('is-active', i === idx);
        const fill = s.querySelector<HTMLElement>('.ptabs-rail-fill');
        if (fill) fill.style.height = i < idx ? '100%' : i === idx ? `${(frac * 100).toFixed(1)}%` : '0%';
      });
    };

    // Only reduced-motion opts out of the scroll animation; it runs at every width.
    if (reduced()) { root.classList.add('is-static'); panels.forEach(p => p.classList.add('is-active')); return; }

    ScrollTrigger.create({
      trigger: pinEl,
      start: 'center center',
      end: () => `+=${n * 55}%`,
      pin: pinEl,
      scrub: true,
      onUpdate: (self) => {
        const raw = self.progress * n;
        const idx = Math.min(n - 1, Math.floor(raw));
        const frac = Math.min(1, Math.max(0, raw - idx));
        setActive(idx, frac);
      },
    });
  });
}
