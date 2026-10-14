/* ============================================================
   NAGA STEELS, Fence configurator
   ------------------------------------------------------------
   Owns the segmented controls, the readout and the SVG weave.

   Everything is driven from the shared store, never from the
   view, so the hero controls, the quote builder's selects and
   the WhatsApp message can never disagree about the spec. A
   customer who picks 8 SWG here and finds 10 SWG in the message
   has been given a reason not to trust the quote.
   ============================================================ */

import { gaugeToMm, APERTURES, coatingById } from './data/products.js';
import * as store from './store.js';
import { createWeave } from './weave-svg.js';

const $ = (id) => document.getElementById(id);

export function initConfigurator() {
  const stage = $('config');
  if (!stage) return;

  const weave = createWeave($('weave-view'));

  /* ---- Segmented controls ---- */
  const wire = (attr, key, cast = (v) => v) => {
    stage.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      btn.addEventListener('click', () => store.set({ [key]: cast(btn.dataset[attr]) }));
    });
  };
  wire('gauge', 'gauge', Number);
  wire('ap', 'aperture', Number);
  wire('coat', 'coating');

  const syncPressed = (attr, value) => {
    stage.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset[attr] === String(value)));
    });
  };

  const set = (id, text) => { const el = $(id); if (el) el.textContent = text; };

  store.subscribe((s) => {
    const mm = gaugeToMm(s.gauge);
    const ap = APERTURES.find((a) => a.in === s.aperture);
    const coat = coatingById(s.coating);
    if (!mm || !ap || !coat) return;

    syncPressed('gauge', s.gauge);
    syncPressed('ap', s.aperture);
    syncPressed('coat', s.coating);

    set('lbl-gauge', `${s.gauge} SWG · ${mm} mm`);
    set('lbl-ap', `${ap.in} inch · ${ap.mm} mm`);
    set('lbl-coat', `${coat.life} life`);

    set('ro-gauge', `${s.gauge} SWG`);
    set('ro-mm', `${mm} mm`);
    set('ro-ap', ap.label);

    weave?.render({
      wireMm: mm,
      apertureMm: ap.mm,
      apertureLabel: ap.label,
      gauge: s.gauge,
      coating: coat,
    });
  });
}

/* ---- Planner tabs ----------------------------------------------------
   Configurator and calculator share one block. Proper tab semantics:
   roving tabindex, arrow-key navigation, aria-selected. */

export function initPlannerTabs() {
  const tablist = document.querySelector('[data-planner-tabs]');
  if (!tablist) return;

  const tabs = [...tablist.querySelectorAll('[role="tab"]')];
  if (!tabs.length) return;

  const select = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !on;
    });
  };

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', (e) => {
      const i = tabs.indexOf(tab);
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      select(next);
      next.focus();
    });
  });

  select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
}
