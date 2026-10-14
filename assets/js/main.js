/* ============================================================
   NAGA STEELS, Entry point
   ------------------------------------------------------------
   Critical path only. GSAP is injected after first paint; there
   is no other heavyweight dependency. The three.js stack that
   used to live here has been removed entirely, which took about
   600 KB and the whole device-tiering apparatus with it.

   Every module below is defensive about missing DOM: the same
   entry point runs on the landing page and on ~25 sub-pages,
   which have different sections.

   SEO note: nothing that matters for indexing is rendered here.
   Headings, product copy, links and the FAQ are all real HTML in
   the document. These renderers only populate repeating data
   tables and grids that are duplicated in the static markup or
   are genuinely supplementary.
   ============================================================ */

import { SWG, ZINC_GRADES } from './data/products.js';
import { AREAS, AREAS_NEARBY } from './data/business.js';
import { initNav } from './nav.js';
import { initOpenNow } from './open-now.js';
import { initQuoteBuilder } from './quote-builder.js';
import { initCalculator } from './calculator.js';
import { initConfigurator, initPlannerTabs } from './configurator.js';
import { initScroll } from './scroll.js';

const $ = (id) => document.getElementById(id);

/* ---- Spec tables ------------------------------------------------------ */

function renderTables() {
  const swg = $('swg-body');
  if (swg) {
    swg.innerHTML = SWG.map((g) => `
      <tr>
        <td class="mono">${g.swg} SWG</td>
        <td class="num">${g.inch.toFixed(3)}"</td>
        <td class="num">${g.mm.toFixed(2)} mm</td>
        <td style="color:var(--muted)">${g.use}</td>
      </tr>`).join('');
  }

  const zinc = $('zinc-body');
  if (zinc) {
    zinc.innerHTML = ZINC_GRADES.map((z) => `
      <tr>
        <td>${z.grade}</td>
        <td class="num">${z.gsm}</td>
        <td class="num">${z.life}</td>
        <td style="color:var(--muted)">${z.use}</td>
      </tr>`).join('');
  }
}

/* ---- Coverage map ------------------------------------------------------
   Pins and spokes are positional data, not content: the same town names
   are listed as crawlable text immediately below the figure, so building
   the schematic in JS costs nothing in SEO terms and keeps 28 elements
   of coordinate noise out of the HTML. */

function renderCoverage() {
  const plot = $('coverage-plot');
  if (!plot) return;

  const hub = AREAS.find((a) => a.hub) || AREAS[0];
  const spokes = AREAS.filter((a) => !a.hub);

  const lines = spokes
    .map((a) => `<line x1="${hub.x}" y1="${hub.y}" x2="${a.x}" y2="${a.y}"/>`)
    .join('');

  const pin = (a) => `
    <span class="coverage-pin${a.hub ? ' coverage-pin--hub' : ''}"
          style="left:${a.x}%;top:${a.y}%"><i></i>${a.label || a.name}</span>`;

  plot.innerHTML =
    `<svg viewBox="0 0 100 104" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>` +
    pin(hub) + spokes.map(pin).join('');
}

/* ---- Delivery area lists ---------------------------------------------- */

function renderAreas() {
  const primary = $('areas-primary');
  if (primary) {
    primary.textContent = AREAS.map((a) => a.label || a.name).join(' · ');
  }
  const nearby = $('areas-nearby');
  if (nearby) {
    nearby.textContent = AREAS_NEARBY.map((a) => a.name).join(' · ');
  }

  const table = $('areas-table');
  if (table) {
    const row = (a) => `
      <tr>
        <td>${a.label || a.name}</td>
        <td class="num">${a.dist}</td>
        <td style="color:var(--muted)">${a.note}</td>
      </tr>`;
    table.innerHTML = [...AREAS, ...AREAS_NEARBY].map(row).join('');
  }
}

/* ---- Boot --------------------------------------------------------------- */

function boot() {
  const yr = $('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  renderTables();
  renderCoverage();
  renderAreas();

  initNav();
  initOpenNow();
  initPlannerTabs();
  initConfigurator();
  initQuoteBuilder();
  initCalculator();

  // Homepage-only blocks. Dynamically imported so the other 23 pages
  // never fetch or parse the module; the hero is the sentinel because
  // it is the one element unique to index.html.
  if (document.getElementById('home-hero')) {
    import('./home.js')
      .then((m) => m.initHome())
      .catch(() => { /* carousel keeps slide 1, hero still navigable */ });
  }

  // Reveals must be observed after the data-driven markup exists.
  initScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
