/* ============================================================
   NAGA STEELS, Homepage behaviours
   ------------------------------------------------------------
   Loaded only by index.html, and only after the hero exists in
   the DOM, so the other 23 pages never parse any of this.

   Four behaviours:
     initUpdates()   supply-update carousel
     initHeroHover() ken-burns + sibling desaturate, pointer-gated
     initCounters()  count-up figures in the "Why" band
     initWhyGlow()   mouse-follow spotlight

   The range carousel is deliberately absent: it is a pure CSS
   animation with a cloned track, so it costs no JavaScript and
   keeps running if this module fails to load.

   Everything here is enhancement. With JS disabled the carousel
   shows its first slide, the hero is fully navigable, the
   counters show their final values and the spotlight sits
   centred. Nothing is hidden behind a script.
   ============================================================ */

const reduceMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- 01 · Supply updates carousel ------------------------------------
   Slides are stacked and toggled with [hidden] rather than translated.
   A transform track would need the slides to be equal height, and these
   teasers are not; toggling avoids a layout jump on every advance. */

function initUpdates() {
  const root = document.getElementById('updates');
  if (!root) return;

  const viewport = root.querySelector('.updates__viewport');
  const slides = [...root.querySelectorAll('[data-slide]')];
  const dots = [...root.querySelectorAll('[data-dot]')];
  if (slides.length < 2) return;

  let i = 0;
  let timer = 0;
  const DELAY = 7000;

  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, k) => { s.hidden = k !== i; });
    dots.forEach((d, k) => {
      d.setAttribute('aria-current', String(k === i));
    });
  };

  const stop = () => { clearInterval(timer); timer = 0; };
  const start = () => {
    stop();
    if (reduceMotion()) return;
    timer = setInterval(() => show(i + 1), DELAY);
  };

  /* Manual control permanently stops auto-rotation and turns the live
     region on. Per the APG carousel pattern: once a user has taken
     control, resuming rotation under them is hostile, and from that
     point on an announcement is expected rather than intrusive. */
  let manual = false;
  const takeControl = () => {
    if (manual) return;
    manual = true;
    stop();
    viewport?.setAttribute('aria-live', 'polite');
  };

  root.querySelector('[data-prev]')?.addEventListener('click', () => { takeControl(); show(i - 1); });
  root.querySelector('[data-next]')?.addEventListener('click', () => { takeControl(); show(i + 1); });
  dots.forEach((d, k) => d.addEventListener('click', () => { takeControl(); show(k); }));

  // Pause while the user is reading or tabbing through. All four guard
  // on `manual`, so none of them can restart a carousel the user stopped.
  const resume = () => { if (!manual) start(); };
  root.addEventListener('pointerenter', stop);
  root.addEventListener('pointerleave', resume);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', (e) => {
    if (!root.contains(e.relatedTarget)) resume();
  });

  // A background tab should not burn through slides.
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop(); else resume();
  });

  show(0);
  start();
}

/* ---- 02 · Hero hover ------------------------------------------------
   The desaturate-siblings effect is gated behind a real pointermove.
   On touch, a tap fires :hover and leaves two of three columns greyed
   out with no way to clear it; requiring pointer movement first means
   that never happens. This is the reference's own technique. */

function initHeroHover() {
  const hero = document.getElementById('home-hero');
  if (!hero) return;

  const enable = () => {
    hero.classList.add('is-hoverable');
    hero.removeEventListener('pointermove', onMove);
  };
  const onMove = (e) => {
    // pointerType is absent on some older engines; treat that as a mouse.
    if (!e.pointerType || e.pointerType === 'mouse') enable();
  };
  hero.addEventListener('pointermove', onMove, { passive: true });

  // Scroll cue. Native smooth scrolling honours scroll-padding-top from
  // base.css, so the sticky header never covers the target heading.
  const cue = hero.querySelector('[data-scroll-next]');
  cue?.addEventListener('click', () => {
    document.getElementById(cue.dataset.scrollNext)?.scrollIntoView({
      behavior: reduceMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  });
}

/* ---- 03 · Count-up figures ------------------------------------------- */

function initCounters() {
  const nodes = [...document.querySelectorAll('[data-count]')];
  if (!nodes.length) return;

  const run = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (!Number.isFinite(target)) return;

    if (reduceMotion()) {
      el.textContent = target + suffix;
      return;
    }

    const steps = 48;
    let step = 0;
    const tick = () => {
      step += 1;
      const v = Math.min(target, Math.round((target / steps) * step));
      el.textContent = v + suffix;
      if (step < steps) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) {
    nodes.forEach((el) => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      run(entry.target);
      io.unobserve(entry.target);   // run once, never on scroll-back
    });
  }, { threshold: 0.4 });

  nodes.forEach((el) => io.observe(el));
}

/* ---- 04 · "Why" spotlight --------------------------------------------
   Writes --mx/--my for the radial gradient. Throttled to one write per
   frame: pointermove fires far faster than the compositor can use, and
   setProperty on every event would thrash style recalculation. */

function initWhyGlow() {
  const grid = document.querySelector('[data-why-grid]');
  if (!grid || !window.matchMedia('(hover: hover)').matches) return;

  let queued = false;
  let x = 50;
  let y = 50;

  grid.addEventListener('pointermove', (e) => {
    const r = grid.getBoundingClientRect();
    x = ((e.clientX - r.left) / r.width) * 100;
    y = ((e.clientY - r.top) / r.height) * 100;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      grid.style.setProperty('--mx', x + '%');
      grid.style.setProperty('--my', y + '%');
      queued = false;
    });
  }, { passive: true });

  grid.addEventListener('pointerleave', () => {
    grid.style.removeProperty('--mx');
    grid.style.removeProperty('--my');
  });
}

export function initHome() {
  initUpdates();
  initHeroHover();
  initCounters();
  initWhyGlow();
}
