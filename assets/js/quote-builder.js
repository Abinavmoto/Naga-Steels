/* ============================================================
   NAGA STEELS, Quote builder → WhatsApp
   ------------------------------------------------------------
   Composes the enquiry live on every keystroke and writes it
   into a REAL anchor href.

   Why an anchor and not window.open(): iOS Safari blocks
   programmatic popups that are not inside a synchronous user
   gesture, so the common `onclick → build string → window.open()`
   pattern silently fails on a large share of this audience and
   the lead is lost with no error. A real href is a genuine
   user-initiated navigation: no popup blocker, works with
   long-press and "open in new tab", and still works if the rest
   of this script throws.
   ============================================================ */

import {
  BUSINESS, CATEGORIES, byId, coatingById, gaugeToMm, APERTURES, ALL_AREA_NAMES,
} from './data/products.js';
import * as store from './store.js';

const WA_MAX = 1500; // some Android WhatsApp builds truncate longer prefills
const $ = (id) => document.getElementById(id);

/* ---- Family-specific free-text spec prompts --------------------------
   A sheet buyer and a wire buyer need different questions. Asking a
   roofing customer for a mesh aperture is how a quote form teaches
   someone that the supplier does not understand their trade.          */

const SPEC_PROMPTS = {
  sheets:   { label: 'Thickness & size',  placeholder: 'e.g. 0.50 mm, 8ft × 4ft', key: 'spec' },
  wire:     { label: 'Gauge or diameter', placeholder: 'e.g. 16 SWG binding wire, 25 kg coils', key: 'spec' },
  roofing:  { label: 'Profile & length',  placeholder: 'e.g. corrugated 0.47 mm, 12 ft sheets', key: 'spec' },
  hardware: { label: 'Size & type',       placeholder: 'e.g. 3" MS wire nails, 50 kg', key: 'spec' },
  fencing:  { label: 'Specification',     placeholder: 'e.g. 12 × 14 SWG, 4" barb spacing', key: 'spec' },
  mesh:     { label: 'Grid & gauge',      placeholder: 'e.g. 1" grid, 14 SWG, 4 ft roll', key: 'spec' },
};

/* ---- Message composition --------------------------------------------- */

export function buildMessage(s) {
  const cat = byId(s.category);
  if (!cat) return '';

  const lines = ['Hello Naga Steels, I would like a quote.', '', `Product: ${cat.name}`];

  if (cat.configurable) {
    const mm = gaugeToMm(s.gauge);
    const ap = APERTURES.find((a) => a.in === s.aperture);
    const coat = coatingById(s.coating);
    lines.push(`Gauge: ${s.gauge} SWG (${mm} mm)`);
    if (ap) lines.push(`Mesh: ${ap.label} (${ap.mm} mm)`);
    if (coat) lines.push(`Coating: ${coat.full}`);
    if (s.height) lines.push(`Height: ${s.height}`);
  } else if (String(s.spec || '').trim()) {
    lines.push(`Specification: ${s.spec.trim()}`);
  }

  const qty = String(s.qty || '').trim();
  lines.push(`Quantity: ${qty ? `${qty} ${s.unit}` : '(to be confirmed)'}`);
  lines.push(`Delivery to: ${String(s.town || '').trim() || '(to be confirmed)'}`);
  if (String(s.name || '').trim()) lines.push(`Name: ${s.name.trim()}`);

  lines.push('', 'Sent from the Naga Steels website');

  let msg = lines.join('\n');
  if (msg.length > WA_MAX) msg = `${msg.slice(0, WA_MAX - 1)}…`;
  return msg;
}

export const waLink = (msg) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;

/* ---- Spec fields, rebuilt when the category changes -------------------- */

function renderSpecFields(cat) {
  const host = $('q-specs');
  if (!host) return;

  if (!cat.configurable) {
    const p = SPEC_PROMPTS[cat.family] || SPEC_PROMPTS.fencing;
    host.innerHTML = `
      <div class="field">
        <label for="q-spec">${p.label}</label>
        <input class="input" id="q-spec" type="text" placeholder="${p.placeholder}"
               autocomplete="off" value="${escapeAttr(store.get().spec || '')}">
      </div>
      <p class="step__hint" style="margin:0">
        ${cat.short} is quoted by ${cat.unit}. Not sure of the exact specification?
        Send the enquiry anyway and we will call to confirm.
      </p>`;
    $('q-spec').oninput = (e) => store.set({ spec: e.target.value });
    return;
  }

  const opt = (v, sel, label) =>
    `<option value="${v}"${v === sel ? ' selected' : ''}>${label}</option>`;

  // Switching category can leave the stored spec outside what this range
  // actually offers: a 16 SWG carried over from weld mesh into chain link,
  // which is only woven 8-12. Clamp to the nearest valid option and write
  // it back, so the select can never render blank and the WhatsApp message
  // can never carry a spec the yard does not supply.
  const nearest = (list, want) =>
    list.reduce((best, v) => (Math.abs(v - want) < Math.abs(best - want) ? v : best), list[0]);

  const cur = store.get();
  const fix = {};
  if (!cat.gauges.includes(cur.gauge))       fix.gauge = nearest(cat.gauges, cur.gauge);
  if (!cat.apertures.includes(cur.aperture)) fix.aperture = nearest(cat.apertures, cur.aperture);
  if (!cat.coatings.includes(cur.coating))   fix.coating = cat.coatings[0];
  if (!cat.heights.includes(cur.height))     fix.height = cat.heights[Math.floor(cat.heights.length / 2)];
  if (Object.keys(fix).length) store.set(fix);

  const s = store.get();
  host.innerHTML = `
    <div class="field-row">
      <div class="field">
        <label for="q-gauge">Wire gauge</label>
        <select class="select" id="q-gauge">
          ${cat.gauges.map((g) => opt(g, s.gauge, `${g} SWG · ${gaugeToMm(g)} mm`)).join('')}
        </select>
      </div>
      <div class="field">
        <label for="q-ap">Mesh aperture</label>
        <select class="select" id="q-ap">
          ${cat.apertures.map((a) => {
            const ap = APERTURES.find((x) => x.in === a);
            return opt(a, s.aperture, `${ap.label} · ${ap.mm} mm`);
          }).join('')}
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field">
        <label for="q-coat">Coating</label>
        <select class="select" id="q-coat">
          ${cat.coatings.map((c) => {
            const co = coatingById(c);
            return opt(c, s.coating, `${co.full} · ${co.life}`);
          }).join('')}
        </select>
      </div>
      <div class="field">
        <label for="q-ht">Height</label>
        <select class="select" id="q-ht">
          ${cat.heights.map((h) => opt(h, s.height, h)).join('')}
        </select>
      </div>
    </div>`;

  // Numeric selects must write numbers back, not strings, or the strict
  // equality in the store misses and the view silently desyncs.
  $('q-gauge').onchange = (e) => store.set({ gauge: Number(e.target.value) });
  $('q-ap').onchange    = (e) => store.set({ aperture: Number(e.target.value) });
  $('q-coat').onchange  = (e) => store.set({ coating: e.target.value });
  $('q-ht').onchange    = (e) => store.set({ height: e.target.value });
}

const escapeAttr = (v) =>
  String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/* ---- Unit options track the selected category -------------------------- */

const UNITS = ['running feet', 'square feet', 'kilograms', 'rolls', 'pieces', 'tonnes'];

function renderUnits(cat) {
  const sel = $('q-unit');
  if (!sel) return;
  sel.innerHTML = UNITS
    .map((u) => `<option value="${u}"${u === cat.unit ? ' selected' : ''}>${u}</option>`)
    .join('');
  store.set({ unit: cat.unit });
}

/* ---- Wire it up --------------------------------------------------------- */

export function initQuoteBuilder() {
  const form = $('qb-form');
  if (!form) return;

  const catSel = $('q-cat');
  catSel.innerHTML = CATEGORIES.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  catSel.value = store.get().category;
  catSel.onchange = (e) => store.set({ category: e.target.value });

  const dl = $('towns');
  if (dl) dl.innerHTML = ALL_AREA_NAMES.map((n) => `<option value="${n}">`).join('');

  // 'input' not 'change' so the preview tracks typing.
  $('q-qty').oninput  = (e) => store.set({ qty: e.target.value });
  $('q-town').oninput = (e) => store.set({ town: e.target.value });
  $('q-name').oninput = (e) => store.set({ name: e.target.value });
  $('q-unit').onchange = (e) => store.set({ unit: e.target.value });

  form.addEventListener('submit', (e) => e.preventDefault());

  let lastCategory = null;

  store.subscribe((s, changed) => {
    const cat = byId(s.category);
    if (!cat) return;

    // Rebuild the spec fields only when the category actually changes,
    // otherwise typing in the quantity box would blow away focus.
    if (s.category !== lastCategory) {
      lastCategory = s.category;
      renderSpecFields(cat);
      renderUnits(cat);
      if (catSel.value !== s.category) catSel.value = s.category;
    } else if (cat.configurable) {
      // Keep the selects in step when the hero configurator drives the change.
      const g = $('q-gauge'), a = $('q-ap'), c = $('q-coat'), h = $('q-ht');
      if (g && Number(g.value) !== s.gauge)    g.value = s.gauge;
      if (a && Number(a.value) !== s.aperture) a.value = s.aperture;
      if (c && c.value !== s.coating)          c.value = s.coating;
      if (h && h.value !== s.height)           h.value = s.height;
    }

    // Re-read rather than using the captured snapshot. renderSpecFields and
    // renderUnits both call store.set() to clamp invalid specs and to switch
    // the default unit, which re-enters this subscriber. Composing from the
    // stale `s` would overwrite the corrected message with the previous
    // category's values, and the unit would lag one category behind.
    const current = store.get();

    const steps = form.querySelectorAll('.step');
    if (steps[2]) {
      steps[2].dataset.done =
        String(Boolean(String(current.qty).trim() && String(current.town).trim()));
    }

    const msg = buildMessage(current);
    const link = waLink(msg);

    const pre = $('q-preview');
    // textContent, never innerHTML: this string contains user input.
    if (pre) pre.textContent = msg;

    const send = $('q-send');
    if (send) { send.href = link; send.target = '_blank'; send.rel = 'noopener'; }

    // The configurator CTA and the sticky bar send the same composed spec.
    const heroWa = $('config-wa');
    if (heroWa && changed.some((k) => ['gauge', 'aperture', 'coating', 'category', 'height'].includes(k))) {
      heroWa.href = link; heroWa.target = '_blank'; heroWa.rel = 'noopener';
    }
    const abWa = $('ab-wa');
    if (abWa) abWa.href = link;
  });

  // Copy to clipboard, with a fallback for insecure contexts
  // (file:// and plain http both lack navigator.clipboard).
  const copyBtn = $('q-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const text = $('q-preview').textContent;
      const label = copyBtn.querySelector('span');
      const done = () => {
        label.textContent = 'Copied';
        setTimeout(() => { label.textContent = 'Copy message'; }, 1800);
      };
      try {
        await navigator.clipboard.writeText(text);
        done();
      } catch {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.cssText = 'position:fixed;top:-1000px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch { label.textContent = 'Press and hold to copy'; }
        ta.remove();
      }
    });
  }
}
