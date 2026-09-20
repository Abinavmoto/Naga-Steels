/* ============================================================
   NAGA STEELS, mobile menu
   ------------------------------------------------------------
   The desktop nav is hidden below 1080px. This is what replaces
   it, so a phone user can still reach all ten pages.

   Accessibility is not optional here: the panel is a modal, so
   it traps focus while open, closes on Escape and on the scrim,
   and returns focus to the button that opened it.
   ============================================================ */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function initNav() {
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
    // Focus the first focusable, which is the close button. That puts the way
    // out one keypress away before the user has to tab through eight links to
    // find it, and the first Tab still lands on the navigation.
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

    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }

    if (e.key !== 'Tab') return;

    // Focus trap. Without this, Tab walks into the page behind the scrim and
    // the user is editing a form they cannot see.
    const items = [...panel.querySelectorAll(FOCUSABLE)].filter(
      (el) => el.offsetParent !== null,
    );
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // Resizing up to desktop while open would leave the body locked with no
  // visible way to unlock it.
  const wide = window.matchMedia('(min-width: 1081px)');
  const onWide = (e) => { if (e.matches) close({ restoreFocus: false }); };
  wide.addEventListener('change', onWide);
}
