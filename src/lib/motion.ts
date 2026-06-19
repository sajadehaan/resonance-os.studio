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
