/* ============================================================
   NAGA STEELS, Material calculator
   ------------------------------------------------------------
   Deliberately NOT a price estimator. Steel is a commodity and rates
   move weekly with zinc and HR coil, so a hardcoded price would be
   wrong within a month, and quoting a number the yard won't honour
   destroys trust on the first phone call.

   This does the procurement arithmetic instead: rolls, posts,
   struts and area. Same "this site is useful" effect, zero
   liability, and it stays correct forever.
   ============================================================ */

import * as store from './store.js';

const $ = (id) => document.getElementById(id);
const fmt = (n) => n.toLocaleString('en-IN');

export function computeMaterial({ length, height, rollLength, spacing, corners }) {
  // Rolls: always round up. You cannot buy 4.3 rolls.
  const rolls = Math.ceil(length / rollLength);

  // Line posts: one every `spacing` feet, plus one to close the run.
  const linePosts = Math.ceil(length / spacing) + 1;

  // Corners and gates each need two struts to brace against wire tension.
  const struts = corners * 2;

  const area = length * height;

  // Tie wire: roughly 0.06 kg per running foot at standard spacing.
  const tieWire = Math.ceil(length * 0.06);

  return { rolls, linePosts, struts, area, tieWire };
}

export function initCalculator() {
  const form = $('calc-form');
  if (!form) return;

  const read = () => ({
    length: Math.max(1, Number($('c-len').value) || 0),
    height: Number($('c-ht').value),
    rollLength: Number($('c-roll').value),
    spacing: Number($('c-spacing').value),
    corners: Math.max(0, Number($('c-corners').value) || 0),
  });

  function render() {
    const input = read();
    const r = computeMaterial(input);

    $('c-rolls').textContent = fmt(r.rolls);
    $('c-posts').textContent = fmt(r.linePosts);
    $('c-struts').textContent = fmt(r.struts);
    $('c-area').innerHTML = `${fmt(r.area)} <small>sq ft</small>`;

    const supplied = r.rolls * input.rollLength;
    const spare = supplied - input.length;

    $('calc-note').innerHTML =
      `${fmt(r.rolls)} rolls at ${input.rollLength} ft supplies <strong>${fmt(supplied)} ft</strong>` +
      (spare > 0
        ? `, about <strong>${fmt(spare)} ft</strong> spare, which is normal and useful for gate returns and corner wraps.`
        : ', an exact fit, with nothing spare for corner wraps.') +
      ` Allow roughly <strong>${fmt(r.tieWire)} kg</strong> of 16 SWG tie wire.`;

    // Push the result into the quote builder so "Quote this quantity"
    // carries the calculated figure rather than making them retype it.
    store.set({
      category: 'chain-link',
      qty: String(input.length),
      unit: 'running feet',
      height: `${input.height} ft`,
    });
  }

  form.addEventListener('input', render);
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => e.preventDefault());
  render();

  // Scroll the user to the builder with their numbers already in place.
  const send = $('calc-send');
  if (send) {
    send.addEventListener('click', () => {
      const qty = $('q-qty');
      if (qty) qty.value = String(read().length);
    });
  }
}
