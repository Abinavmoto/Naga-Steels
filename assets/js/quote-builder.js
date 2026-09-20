/* ============================================================
   NAGA STEELS, Quote builder → WhatsApp
   ------------------------------------------------------------
   Composes the enquiry live on every keystroke and writes it into
   a REAL anchor href.

   Why an anchor and not window.open(): iOS Safari blocks
   programmatic popups that aren't inside a synchronous user
   gesture, so the common `onclick → build string → window.open()`
   pattern silently fails on a large share of this audience and the
   lead is simply lost with no error. A real href is a genuine
   user-initiated navigation: no popup blocker, works with
   long-press and "open in new tab", and still works if the rest of
   this script throws.
   ============================================================ */

import { BUSINESS, CATEGORIES, byId, coatingById, gaugeToMm, APERTURES, AREAS } from './data/products.js';
import * as store from './store.js';

const WA_MAX = 1500; // some Android WhatsApp builds truncate longer prefills

const $ = (id) => document.getElementById(id);

/* ---- Message composition ------------------------------------------- */

const RULE = '─'.repeat(26);

export function buildMessage(s) {
  const cat = byId(s.category);
  const lines = [
    '*NEW ENQUIRY: NAGA STEELS*',
    RULE,
    `*Product:* ${cat.name}`,
  ];

  if (cat.configurable) {
    const mm = gaugeToMm(s.gauge);
    const ap = APERTURES.find((a) => a.in === s.aperture);
    const coat = coatingById(s.coating);
    lines.push(`*Gauge:* ${s.gauge} SWG (${mm} mm)`);
    if (ap) lines.push(`*Mesh:* ${ap.label} (${ap.mm} mm)`);
    if (coat) lines.push(`*Coating:* ${coat.full}`);
    if (s.height) lines.push(`*Height:* ${s.height}`);
  }

  const qty = String(s.qty || '').trim();
  lines.push(`*Quantity:* ${qty ? `${qty} ${s.unit}` : '(to be confirmed)'}`);
  lines.push(`*Delivery to:* ${s.town.trim() || '(to be confirmed)'}`);
  if (s.name.trim()) lines.push(`*Name:* ${s.name.trim()}`);

  lines.push(RULE, '_Sent from the Naga Steels website_');

  let msg = lines.join('\n');
  if (msg.length > WA_MAX) msg = `${msg.slice(0, WA_MAX - 1)}…`;
  return msg;
}

export const waLink = (msg) =>
  `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(msg)}`;

/* ---- Spec fields, rebuilt when the category changes ------------------ */

function renderSpecFields(cat) {
  const host = $('q-specs');
  if (!host) return;

  if (!cat.configurable) {
    host.innerHTML = `<p class="step__hint" style="margin:0">
      ${cat.short} is quoted by ${cat.unit}. Add any size or grade you need in the
      quantity box below, or just send the enquiry and we will call to confirm.</p>`;
    return;
  }

  const opt = (v, sel, label) =>
    `<option value="${v}"${v === sel ? ' selected' : ''}>${label}</option>`;

  // Switching category can leave the stored spec outside what this range
  // actually offers. A 16 SWG carried over from weld mesh into chain
  // link, which is only woven 8-12. Clamp to the nearest valid option and
  // write it back, so the select can never render blank and the WhatsApp
  // message can never carry a spec the yard does not supply.
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
          ${cat.apertures
            .map((a) => {
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
  // equality in the store (and the 3D scene's variant lookup) both miss.
  $('q-gauge').onchange = (e) => store.set({ gauge: Number(e.target.value) });
  $('q-ap').onchange    = (e) => store.set({ aperture: Number(e.target.value) });
  $('q-coat').onchange  = (e) => store.set({ coating: e.target.value });
  $('q-ht').onchange    = (e) => store.set({ height: e.target.value });
}

/* ---- Unit options track the selected category ----------------------- */

const UNITS = ['running feet', 'square feet', 'kilograms', 'rolls', 'pieces', 'tonnes'];

function renderUnits(cat) {
  const sel = $('q-unit');
  if (!sel) return;
  const preferred = cat.unit;
  sel.innerHTML = UNITS
    .map((u) => `<option value="${u}"${u === preferred ? ' selected' : ''}>${u}</option>`)
    .join('');
  store.set({ unit: preferred });
}

/* ---- Wire it up ------------------------------------------------------ */

export function initQuoteBuilder() {
  const form = $('qb-form');
  if (!form) return;

  // Category select
  const catSel = $('q-cat');
  catSel.innerHTML = CATEGORIES
    .map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  catSel.value = store.get().category;
  catSel.onchange = (e) => store.set({ category: e.target.value });

  // Town suggestions from the real delivery corridor
  const dl = $('towns');
  if (dl) dl.innerHTML = AREAS.map((a) => `<option value="${a.name}">`).join('');

  // Free-text fields. 'input' not 'change' so the preview tracks typing.
  $('q-qty').oninput  = (e) => store.set({ qty: e.target.value });
  $('q-town').oninput = (e) => store.set({ town: e.target.value });
  $('q-name').oninput = (e) => store.set({ name: e.target.value });
  $('q-unit').onchange = (e) => store.set({ unit: e.target.value });

  form.addEventListener('submit', (e) => e.preventDefault());

  let lastCategory = null;

  store.subscribe((s, changed) => {
    const cat = byId(s.category);

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
      if (g && Number(g.value) !== s.gauge)   g.value = s.gauge;
      if (a && Number(a.value) !== s.aperture) a.value = s.aperture;
      if (c && c.value !== s.coating)          c.value = s.coating;
      if (h && h.value !== s.height)           h.value = s.height;
    }

    // Re-read rather than using the captured snapshot. renderSpecFields and
    // renderUnits both call store.set() to clamp invalid specs and to switch
    // the default unit, which re-enters this subscriber. Composing from the
    // stale `s` would then overwrite the corrected message with the previous
    // category's values, and the unit would visibly lag one category behind.
    const current = store.get();

    // Mark step 3 complete for the connector styling
    const steps = form.querySelectorAll('.step');
    if (steps[2]) {
      steps[2].dataset.done =
        String(Boolean(String(current.qty).trim() && current.town.trim()));
    }

    // Compose + publish
    const msg = buildMessage(current);
    const link = waLink(msg);

    const pre = $('q-preview');
    // textContent, never innerHTML: this string contains user input.
    if (pre) pre.textContent = msg;

    const send = $('q-send');
    if (send) {
      send.href = link;
      send.target = '_blank';
      send.rel = 'noopener';
    }

    // The hero CTA and the sticky bar send the same composed spec.
    const heroWa = $('hero-wa');
    if (heroWa && changed.some((k) => ['gauge', 'aperture', 'coating', 'category'].includes(k))) {
      heroWa.href = link;
      heroWa.target = '_blank';
      heroWa.rel = 'noopener';
    }
    const abWa = $('ab-wa');
    if (abWa) abWa.href = link;
  });

  // Copy to clipboard, with a graceful fallback for insecure contexts
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
