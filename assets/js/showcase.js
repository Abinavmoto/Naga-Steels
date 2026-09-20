/* ============================================================
   NAGA STEELS, product showcase controller
   ------------------------------------------------------------
   Mirrors configurator.js: decide the tier first, then load the
   3D behind a dynamic import so a Tier 0 device never fetches a
   byte of it.

   Three states on the section, via data-3d:
     off     collapsed stack. No JS, Tier 0, or reduced motion.
     poster  sticky stage active, SVG blueprint showing.
     live    sticky stage active, canvas showing.

   The markup ships as "off" so the no-JS experience is the plain
   stack rather than six empty screens.
   ============================================================ */

import { getTier, TIERS } from './capability.js';

/* SVG blueprints, one per range. Doubles as the Tier 1 poster and as the
   permanent rendering for anyone who never gets a canvas. */
const BLUEPRINTS = {
  'chain-link': `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.2" stroke-linecap="round">
        <path d="M20 0 44 32 20 64 44 96 20 128 44 160M68 0 92 32 68 64 92 96 68 128 92 160
                 M116 0 140 32 116 64 140 96 116 128 140 160M164 0 188 32 164 64 188 96 164 128 188 160
                 M212 0 236 32 212 64 236 96 212 128 236 160"/>
        <path d="M44 0 20 32 44 64 20 96 44 128 20 160M92 0 68 32 92 64 68 96 92 128 68 160
                 M140 0 116 32 140 64 116 96 140 128 116 160M188 0 164 32 188 64 164 96 188 128 164 160"
              stroke="#5A646F"/>
      </g></svg>`,

  'weld-mesh': `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.2">
        <path d="M0 24h240M0 60h240M0 96h240M0 132h240"/>
        <path d="M24 0v160M60 0v160M96 0v160M132 0v160M168 0v160M204 0v160" stroke="#5A646F"/>
      </g>
      <g fill="#F59E0B">
        <circle cx="96" cy="60" r="3"/><circle cx="132" cy="96" r="3"/>
        <circle cx="60" cy="96" r="3"/><circle cx="168" cy="24" r="3"/>
      </g></svg>`,

  'barbed-wire': `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.4" stroke-linecap="round">
        <path d="M0 64c30 12 60-12 90 0s60 12 90 0 40-8 60 0"/>
        <path d="M0 96c30-12 60 12 90 0s60-12 90 0 40 8 60 0"/>
      </g>
      <g stroke="#F59E0B" stroke-width="2" stroke-linecap="round">
        <path d="M44 66 34 52M44 66 56 54M46 94 36 108M46 94 58 106
                 M134 66 124 52M134 66 146 54M136 94 126 108M136 94 148 106"/>
      </g></svg>`,

  'gi-wire': `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2">
        <ellipse cx="120" cy="80" rx="82" ry="46"/>
        <ellipse cx="120" cy="80" rx="62" ry="33" stroke="#5A646F"/>
        <ellipse cx="120" cy="80" rx="40" ry="20" stroke="#5A646F"/>
      </g>
      <path d="M120 34v14M120 112v14" stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`,

  sheets: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2" stroke-linejoin="round">
        <path d="M42 50h120v66H42z"/>
      </g>
      <g stroke="#5A646F" stroke-width="1.8">
        <path d="M52 40h120v66M62 30h120v66"/>
      </g>
      <path d="M42 128h120M42 124v8M162 124v8" stroke="#F59E0B" stroke-width="1.6"/>
      </svg>`,

  roofing: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.4" stroke-linejoin="round">
        <path d="M8 112 32 52l24 60 24-60 24 60 24-60 24 60 24-60 24 60"/>
      </g>
      <path d="M8 128h224" stroke="#5A646F" stroke-width="1.6" stroke-dasharray="5 5"/>
      <path d="M32 52V36M56 112v16" stroke="#F59E0B" stroke-width="1.6"/>
      </svg>`,

  hardware: `<svg viewBox="0 0 240 160" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.2" stroke-linecap="round">
        <path d="M52 40v82M40 40h24M120 40v82M108 40h24"/>
      </g>
      <g stroke="#5A646F" stroke-width="2">
        <path d="M176 48l28 16v32l-28 16-28-16V64z"/>
      </g>
      <circle cx="176" cy="80" r="10" stroke="#F59E0B" stroke-width="2.2" fill="none"/>
      </svg>`,
};

export function initShowcase() {
  const section = document.getElementById('showcase');
  if (!section) return;

  const panels = [...section.querySelectorAll('.showcase__panel')];
  const ticks = [...section.querySelectorAll('.showcase__ticks li')];
  const poster = document.getElementById('showcase-poster');
  const canvas = document.getElementById('showcase-canvas');
  if (!panels.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tierId = reduced ? 0 : getTier();

  // Tier 0 keeps the collapsed stack that shipped in the markup.
  if (tierId === 0) return;

  section.dataset['3d'] = 'poster';

  let active = -1;
  let scene = null;

  const setActive = (i) => {
    if (i === active || i < 0 || i >= panels.length) return;
    active = i;
    panels.forEach((p, n) => { p.dataset.active = String(n === i); });
    ticks.forEach((t, n) => {
      if (n === i) t.setAttribute('aria-current', 'true');
      else t.removeAttribute('aria-current');
    });
    const id = panels[i].dataset.product;
    if (poster) poster.innerHTML = BLUEPRINTS[id] || '';
    scene?.setProduct(id);
  };

  /* Which panel is active: IntersectionObserver, not a scroll handler. The
     band is narrow and centred so the switch happens when a panel is
     genuinely the one being read, not when it first peeks into view. */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) setActive(panels.indexOf(e.target));
      });
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );
  panels.forEach((p) => io.observe(p));
  setActive(0);

  /* ---- 3D, strictly opt-in ------------------------------------------
     Same rule as the configurator: this dynamic import is the whole
     strategy. A static import at the top of this file would pull three.js
     onto the critical path for everyone. */

  const boot = async () => {
    if (!canvas) return;
    try {
      const { createShowcaseScene } = await import('./three/showcase.js');
      scene = await createShowcaseScene({
        canvas,
        tier: { ...TIERS[tierId] },
        stage: section.querySelector('.showcase__stage'),
        initial: panels[Math.max(0, active)].dataset.product,
        onGiveUp: () => { section.dataset['3d'] = 'poster'; },
      });
      section.dataset['3d'] = 'live';
    } catch (err) {
      // The blueprint poster is a complete experience, so a failure here
      // costs nothing the user can see.
      console.warn('[naga] showcase 3D unavailable:', err);
      section.dataset['3d'] = 'poster';
    }
  };

  /* Only start once the section is genuinely near. No point compiling
     shaders for someone who bounces from the hero. */
  const near = new IntersectionObserver((entries, obs) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    obs.disconnect();
    if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 2000 });
    else setTimeout(boot, 200);
  }, { rootMargin: '100% 0px' });
  near.observe(section);
}
