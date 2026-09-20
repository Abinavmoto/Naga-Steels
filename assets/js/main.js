/* ============================================================
   NAGA STEELS, Entry point
   ------------------------------------------------------------
   Critical path only. Everything expensive is deferred:
     · GSAP        → injected after first paint
     · three.js    → dynamic import, and only above Tier 0

   Every module below is defensive about missing DOM: the same
   entry point runs on the landing page and on the product pages,
   which have different sections.
   ============================================================ */

import { SWG, ZINC_GRADES, CATEGORIES, AREAS, BRANDS, APPLICATIONS } from './data/products.js';
import { initNav } from './nav.js';
import { initOpenNow } from './open-now.js';
import { initQuoteBuilder } from './quote-builder.js';
import { initCalculator } from './calculator.js';
import { initConfigurator } from './configurator.js';
import { initShowcase } from './showcase.js';
import { initScroll } from './scroll.js';

const $ = (id) => document.getElementById(id);

/* ---- Card figures ----------------------------------------------------
   Each range gets its own SVG blueprint rather than a stock photo. Drawn
   inline: no requests, scales perfectly, and it looks deliberate rather
   than like filler.                                                     */

const FIGURES = {
  'chain-link': `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.6" stroke-linecap="round">
        <path d="M20 8 44 40 20 72 44 104 20 128M68 8 92 40 68 72 92 104 68 128
                 M116 8 140 40 116 72 140 104 116 128M164 8 188 40 164 72 188 104 164 128
                 M212 8 236 40 212 72 236 104 212 128"/>
        <path d="M44 8 20 40 44 72 20 104 44 128M92 8 68 40 92 72 68 104 92 128
                 M140 8 116 40 140 72 116 104 140 128M188 8 164 40 188 72 164 104 188 128"
              stroke="#5A646F"/>
      </g></svg>`,

  'weld-mesh': `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.4">
        <path d="M0 24h240M0 56h240M0 88h240M0 120h240"/>
        <path d="M24 0v128M60 0v128M96 0v128M132 0v128M168 0v128M204 0v128" stroke="#5A646F"/>
      </g>
      <g fill="#F59E0B">
        <circle cx="96" cy="56" r="3.2"/><circle cx="132" cy="88" r="3.2"/>
        <circle cx="60" cy="88" r="3.2"/><circle cx="168" cy="24" r="3.2"/>
      </g></svg>`,

  'barbed-wire': `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.6" stroke-linecap="round">
        <path d="M0 48c30 12 60-12 90 0s60 12 90 0 40-8 60 0"/>
        <path d="M0 80c30-12 60 12 90 0s60-12 90 0 40 8 60 0"/>
      </g>
      <g stroke="#F59E0B" stroke-width="2.2" stroke-linecap="round">
        <path d="M44 50 34 36M44 50 56 38M46 78 36 92M46 78 58 90
                 M134 50 124 36M134 50 146 38M136 78 126 92M136 78 148 90"/>
      </g></svg>`,

  'gi-wire': `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.2">
        <ellipse cx="120" cy="64" rx="76" ry="40"/>
        <ellipse cx="120" cy="64" rx="56" ry="28" stroke="#5A646F"/>
        <ellipse cx="120" cy="64" rx="34" ry="16" stroke="#5A646F"/>
      </g>
      <path d="M120 24v12M120 92v12" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M196 64h20M24 64h20" stroke="#F59E0B" stroke-width="2.4" stroke-linecap="round"/>
      </svg>`,

  sheets: `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.2" stroke-linejoin="round">
        <path d="M44 34h120v60H44z"/>
      </g>
      <g stroke="#5A646F" stroke-width="2">
        <path d="M52 26h120v60M60 18h120v60"/>
      </g>
      <path d="M44 104h120" stroke="#F59E0B" stroke-width="1.6"/>
      <path d="M44 100v8M164 100v8" stroke="#F59E0B" stroke-width="1.6"/>
      <path d="M176 34h8M176 94h8M180 34v60" stroke="#F59E0B" stroke-width="1.6"/>
      </svg>`,

  roofing: `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.6" stroke-linejoin="round">
        <path d="M8 96 32 40l24 56 24-56 24 56 24-56 24 56 24-56 24 56"/>
      </g>
      <path d="M8 110h224" stroke="#5A646F" stroke-width="1.6" stroke-dasharray="5 5"/>
      <path d="M32 40v-14M56 96v14" stroke="#F59E0B" stroke-width="1.8"/>
      </svg>`,

  hardware: `<svg viewBox="0 0 240 128" fill="none" aria-hidden="true">
      <g stroke="#8D97A3" stroke-width="2.4" stroke-linecap="round">
        <path d="M52 26v76M40 26h24M52 102l0 10"/>
        <path d="M120 26v76M108 26h24M120 102l0 10"/>
      </g>
      <g stroke="#5A646F" stroke-width="2.2">
        <path d="M176 34l28 16v32l-28 16-28-16V50z"/>
      </g>
      <circle cx="176" cy="66" r="10" stroke="#F59E0B" stroke-width="2.4" fill="none"/>
      </svg>`,
};

/* ---- Data-driven sections ------------------------------------------- */

function renderCatalogue() {
  const host = $('cards');
  if (!host) return;

  host.innerHTML = CATEGORIES.map((c, i) => `
    <a class="card" href="${c.slug}/">
      <span class="card__fig">
        ${FIGURES[c.id] || ''}
        <span class="card__idx">${String(i + 1).padStart(2, '0')}</span>
      </span>
      <h3>${c.name}</h3>
      <p>${c.blurb}</p>
      <span class="card__specs">${c.chips.map((s) => `<span class="chip">${s}</span>`).join('')}</span>
      <span class="card__go">
        View range &amp; specs
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </span>
    </a>`).join('');

  // Feed the CSS radial hover sweep. Pointer-only: on touch it would fire
  // on every tap and do nothing useful.
  if (window.matchMedia('(pointer: fine)').matches) {
    host.querySelectorAll('.card').forEach((card) => {
      card.addEventListener('pointermove', (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, { passive: true });
    });
  }
}

function renderTables() {
  const swg = $('swg-body');
  if (swg) {
    swg.innerHTML = SWG.map((g) => `
      <tr>
        <td class="mono">${g.swg} SWG</td>
        <td class="num">${g.inch.toFixed(3)}"</td>
        <td class="num">${g.mm.toFixed(2)} mm</td>
        <td style="color:var(--ink-2)">${g.use}</td>
      </tr>`).join('');
  }

  const zinc = $('zinc-body');
  if (zinc) {
    zinc.innerHTML = ZINC_GRADES.map((z) => `
      <tr>
        <td>${z.grade}</td>
        <td class="num">${z.gsm}</td>
        <td class="num">${z.life}</td>
        <td style="color:var(--ink-2)">${z.use}</td>
      </tr>`).join('');
  }
}

/* Text-led, no partner logos. The downloaded marks all carry baked-in light
   backgrounds and different weights, so on a dark strip they render as grey
   boxes and read worse than nothing. Reproducing a third party's logo also
   wants their permission, which we do not have. The role label ("Dealer",
   "Distributor") is the claim doing the actual work anyway. */
function renderBrands() {
  const host = $('brands-grid');
  if (!host) return;
  host.innerHTML = BRANDS.map((b, i) => `
    <div class="brandcard">
      <span class="brandcard__idx">${String(i + 1).padStart(2, '0')}</span>
      <span class="brandcard__role">${b.role}</span>
      <strong class="brandcard__name">${b.name}</strong>
      <p>${b.note}</p>
    </div>`).join('');
}

function renderApplications() {
  const host = $('apps-grid');
  if (!host) return;
  host.innerHTML = APPLICATIONS.map((a, i) => `
    <a class="appcard" href="${a.to}/">
      <span class="appcard__media">
        <img src="assets/img/applications/${a.img}" alt="${a.name}"
             width="760" height="507" loading="lazy" decoding="async">
      </span>
      <span class="appcard__body">
        <span class="appcard__idx">${String(i + 1).padStart(2, '0')}</span>
        <strong>${a.name}</strong>
        <span class="appcard__blurb">${a.blurb}</span>
        <span class="appcard__spec">${a.spec}</span>
      </span>
    </a>`).join('');
}

function renderAreas() {
  const host = $('areas-grid');
  if (!host) return;
  host.innerHTML = AREAS.map((a) => `
    <div class="area">
      <span class="area__n">${a.name}</span>
      <span class="area__d">${a.dist} · ${a.note}</span>
    </div>`).join('');
}

/* ---- Boot ------------------------------------------------------------ */

function boot() {
  const yr = $('yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  renderCatalogue();
  renderBrands();
  renderApplications();
  renderTables();
  renderAreas();

  initNav();
  initOpenNow();
  initConfigurator();
  initShowcase();
  initQuoteBuilder();
  initCalculator();

  // Reveals must be observed after the data-driven markup exists.
  initScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot, { once: true });
} else {
  boot();
}
