/* ============================================================
   NAGA STEELS, navigation
   ------------------------------------------------------------
   Two independent behaviours:

   1. The desktop mega-menu. Hover opens it for mouse users, but
      it is keyboard- and click-driven underneath, because a
      hover-only menu is unreachable by keyboard and unusable on
      a hybrid touch laptop.

   2. The mobile drawer. It is a modal, so it traps focus while
      open, closes on Escape and on the scrim, and returns focus
      to the button that opened it.
   ============================================================ */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/* ---- Desktop mega-menu ------------------------------------------------ */

function initMegaMenu() {
  const groups = [...document.querySelectorAll('.nav__group')];
  if (!groups.length) return;

  const closeAll = (except) => {
    groups.forEach((g) => {
      if (g === except) return;
      g.querySelector('.nav__trigger')?.setAttribute('aria-expanded', 'false');
    });
  };

  groups.forEach((group) => {
    const trigger = group.querySelector('.nav__trigger');
    const panel = group.querySelector('.nav__panel');
    if (!trigger || !panel) return;

    const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';
    const open = () => { closeAll(group); trigger.setAttribute('aria-expanded', 'true'); };
    const close = () => trigger.setAttribute('aria-expanded', 'false');

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      isOpen() ? close() : open();
    });

    // Pointer affordance for mouse users only. On a touch device
    // `pointerenter` fires on the tap that is already handled by the click
    // listener above, which would open and immediately re-close the panel.
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let timer;
      group.addEventListener('pointerenter', () => { clearTimeout(timer); open(); });
      group.addEventListener('pointerleave', () => { timer = setTimeout(close, 140); });
    }

    group.addEventListener('focusout', (e) => {
      if (!group.contains(e.relatedTarget)) close();
    });

    group.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        e.preventDefault();
        close();
        trigger.focus();
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav__group')) closeAll(null);
  });
}

/* ---- Mobile drawer ----------------------------------------------------- */

function initDrawer() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('menu');
  if (!burger || !menu) return;

  const panel = menu.querySelector('.menu__panel');
  const scrim = menu.querySelector('.menu__scrim');
  const closeBtn = menu.querySelector('.menu__close');
  let lastFocused = null;

  const isOpen = () => menu.dataset.open === 'true';

  function open() {
    lastFocused = document.activeElement;
    menu.dataset.open = 'true';
    burger.setAttribute('aria-expanded', 'true');
    // Locking the body is what stops the page behind scrolling under the
    // panel, which on a phone reads as the menu itself being broken.
    document.body.classList.add('menu-open');
    // Focus the close button first: the way out is one keypress away
    // before the user has to tab through a dozen links to find it.
    panel.querySelector(FOCUSABLE)?.focus();
  }

  function close({ restoreFocus = true } = {}) {
    if (!isOpen()) return;
    menu.dataset.open = 'false';
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restoreFocus && lastFocused instanceof HTMLElement) lastFocused.focus();
  }

  burger.addEventListener('click', () => (isOpen() ? close() : open()));
  closeBtn?.addEventListener('click', () => close());
  scrim?.addEventListener('click', () => close());

  // Navigating away: let the link win, but drop the body lock first so the
  // destination page never inherits `overflow: hidden`.
  panel.addEventListener('click', (e) => {
    if (e.target.closest('a[href]')) close({ restoreFocus: false });
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen()) return;

    if (e.key === 'Escape') { e.preventDefault(); close(); return; }
    if (e.key !== 'Tab') return;

    // Focus trap. Without this, Tab walks into the page behind the scrim
    // and the user is editing a form they cannot see.
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter((el) => el.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Resizing up to desktop while open would leave the body locked with no
  // visible way to unlock it.
  const wide = window.matchMedia('(min-width: 921px)');
  wide.addEventListener('change', (e) => { if (e.matches) close({ restoreFocus: false }); });
}

export function initNav() {
  initMegaMenu();
  initDrawer();
}
