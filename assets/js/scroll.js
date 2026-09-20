/* ============================================================
   NAGA STEELS, Scroll choreography
   ------------------------------------------------------------
   Two layers, deliberately:

   1. An IntersectionObserver reveal that works with no dependency
      at all. If GSAP never loads, every section still animates in.
   2. GSAP ScrollTrigger for the blueprint draw-ins and count-ups,
      desktop only.

   Nothing is pinned below 768px. On Android, 100vh pinning plus the
   URL bar collapsing mid-scroll retriggers ScrollTrigger.refresh()
   and shifts the pinned section under the user's thumb.
   ============================================================ */

import { loadGsap } from './gsap-loader.js';

const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Layer 1: dependency-free reveals -------------------------------- */

function initReveals() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  if (reduced() || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target); // reveal once; re-animating on scroll-back is noise
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

  items.forEach((el) => io.observe(el));
}

/* ---- Count-up for spec figures --------------------------------------- */

function countUp(el, gsap) {
  const raw = el.textContent.replace(/,/g, '');
  const match = raw.match(/-?\d+(\.\d+)?/);
  if (!match) return;

  const end = parseFloat(match[0]);
  const prefix = raw.slice(0, match.index);
  const suffix = raw.slice(match.index + match[0].length);
  const decimals = (match[0].split('.')[1] || '').length;
  const obj = { v: 0 };

  gsap.to(obj, {
    v: end,
    duration: 1.1,
    ease: 'power2.out',
    onUpdate() {
      el.textContent =
        prefix +
        obj.v.toLocaleString('en-IN', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }) +
        suffix;
    },
  });
}

/* ---- Layer 2: GSAP ---------------------------------------------------- */

export async function initScroll() {
  initReveals();
  if (reduced()) return;

  const mod = await loadGsap();
  if (!mod?.gsap || !mod.ScrollTrigger) return;
  const { gsap, ScrollTrigger } = mod;

  // The URL bar on Android fires resize constantly during a scroll.
  // Without this, ScrollTrigger recalculates every trigger mid-gesture.
  ScrollTrigger.config({ ignoreMobileResize: true });

  const mm = gsap.matchMedia();

  /* Desktop: blueprint draw-in on the spec tables, and count-ups. */
  mm.add('(min-width: 769px)', () => {
    gsap.utils.toArray('.spectable tbody tr').forEach((row) => {
      gsap.from(row, {
        opacity: 0,
        x: -14,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: row, start: 'top 92%', once: true },
      });
    });

    gsap.utils.toArray('.trust__v').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 10,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 95%', once: true },
      });
    });

    // The hero glow drifts slightly with scroll. One scrubbed element on
    // the whole page, and nothing is pinned.
    const glow = document.querySelector('.hero__glow');
    if (glow) {
      gsap.to(glow, {
        yPercent: 18,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
      });
    }
  });

  /* Count-ups run on every size; they are one-shot and cheap. */
  gsap.utils.toArray('.calc__n').forEach((el) => {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => countUp(el, gsap),
    });
  });
}
