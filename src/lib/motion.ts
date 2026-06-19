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
