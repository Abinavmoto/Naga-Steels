/* ============================================================
   NAGA STEELS, Hero configurator controller
   ------------------------------------------------------------
   Owns the segmented controls and the readout. The 3D scene is an
   optional listener: every control works identically whether or not
   WebGL ever loads, because the readout, the labels and the WhatsApp
   message are all driven from the store, not from the canvas.
   ============================================================ */

import { gaugeToMm, APERTURES, coatingById } from './data/products.js';
import * as store from './store.js';
import { getTier, TIERS, demoteTier } from './capability.js';

const $ = (id) => document.getElementById(id);

export function initConfigurator() {
  const stage = $('stage');
  if (!stage) return;

  /* ---- Segmented controls ---- */
  const wire = (attr, key, cast = (v) => v) => {
    stage.querySelectorAll(`[data-${attr}]`).forEach((btn) => {
      btn.addEventListener('click', () => {
        store.set({ [key]: cast(btn.dataset[attr]) });
      });
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

  store.subscribe((s) => {
    const mm = gaugeToMm(s.gauge);
    const ap = APERTURES.find((a) => a.in === s.aperture);
    const coat = coatingById(s.coating);

    syncPressed('gauge', s.gauge);
    syncPressed('ap', s.aperture);
    syncPressed('coat', s.coating);

    $('lbl-gauge').textContent = `${s.gauge} SWG · ${mm} mm`;
    $('lbl-ap').textContent = ap ? `${ap.in} inch · ${ap.mm} mm` : '';
    $('lbl-coat').textContent = coat ? `${coat.life} life` : '';

    $('ro-gauge').textContent = `${s.gauge} SWG`;
    $('ro-mm').textContent = `${mm} mm`;
    $('ro-ap').textContent = ap ? ap.label : '';
  });

  /* ---- 3D, strictly opt-in ------------------------------------------
     The import() below is the entire tiering strategy in one line: on a
     Tier 0 device it never executes, so three.js is never fetched. Watch
     for this in the network waterfall. A stray static import at the top
     of this file would silently pull ~90 KB onto the critical path and
     undo all of it.                                                    */

  let tierId = getTier();
  if (tierId === 0) return;

  const boot = async () => {
    const canvas = $('weave-canvas');
    if (!canvas) return;

    try {
      const { createScene } = await import('./three/scene.js');

      const scene = await createScene({
        canvas,
        tier: { ...TIERS[tierId] },
        apertures: APERTURES.map((a) => a.mm),
        initial: { apertureMm: APERTURES.find((a) => a.in === store.get().aperture)?.mm ?? 50 },
        onDowngrade: (verdict) => {
          if (verdict === 'abort') {
            // Fall back to the poster. It is a complete experience, not a
            // broken one, so there is nothing to apologise for visually.
            stage.dataset['3d'] = 'poster';
            demoteTier(tierId);
          }
        },
        // The browser dropped the GL context. Cross-fade the poster back in
        // rather than leaving a black rectangle where the weave was.
        onContextLost: () => { stage.dataset['3d'] = 'poster'; },
      });

      stage.dataset['3d'] = 'live';

      store.subscribe((s, changed) => {
        if (changed.includes('gauge')) scene.setGauge(gaugeToMm(s.gauge));
        if (changed.includes('aperture')) {
          const ap = APERTURES.find((a) => a.in === s.aperture);
          if (ap) scene.setAperture(ap.mm);
        }
        if (changed.includes('coating')) {
          const c = coatingById(s.coating);
          if (c) scene.setCoating(c);
        }
      });
    } catch (err) {
      // Any failure here leaves the poster in place and the configurator
      // fully usable. A broken canvas must never break the quote path.
      console.warn('[naga] 3D unavailable, using poster:', err);
      stage.dataset['3d'] = 'poster';
    }
  };

  /* The canvas must never be the LCP element. Wait for load, then for an
     idle moment, then bring it in over the poster. */
  const schedule = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(boot, { timeout: 2500 });
    else setTimeout(boot, 400);
  };

  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
}
