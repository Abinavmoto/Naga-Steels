/* ============================================================
   NAGA STEELS, Live "Open now" indicator
   ------------------------------------------------------------
   Computed in Asia/Kolkata, never in the visitor's local time.
   A contractor checking from Dubai or Singapore at 2 AM their
   time still needs to know whether the Madurai yard is open, and
   using the device clock would tell them the opposite.
   ============================================================ */

import { BUSINESS } from './data/products.js';

const IST = 'Asia/Kolkata';

/** Current weekday (0 = Sunday) and decimal hour in Madurai. */
export function nowInIST(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const get = (t) => parts.find((p) => p.type === t)?.value;
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

  // Intl renders midnight as "24" in some engines; normalise to 0.
  const h = Number(get('hour')) % 24;
  const m = Number(get('minute'));

  return { day: days[get('weekday')] ?? 0, hour: h + m / 60 };
}

export function getStatus(date = new Date()) {
  const { day, hour } = nowInIST(date);
  const { open, close, closedDays } = BUSINESS.hours;

  if (closedDays.includes(day)) {
    return { open: false, text: 'Closed, opens Monday 10 AM' };
  }
  if (hour < open) {
    return { open: false, text: `Closed, opens ${open} AM` };
  }
  if (hour >= close) {
    const tomorrowClosed = closedDays.includes((day + 1) % 7);
    return {
      open: false,
      text: tomorrowClosed ? 'Closed, opens Monday 10 AM' : 'Closed, opens 10 AM',
    };
  }
  // Within the last hour, say so. It changes whether they call now or later.
  if (close - hour <= 1) {
    return { open: true, text: 'Open, closing at 8 PM' };
  }
  return { open: true, text: 'Open now' };
}

export function initOpenNow() {
  // Every element marked [data-open-pill], not a single id: the header pill is
  // hidden below 900px (it is long enough to push the Get Quote button off a
  // 360px screen), so the footer carries a second one on mobile.
  const pills = [...document.querySelectorAll('[data-open-pill]')];
  if (!pills.length) return;

  const tick = () => {
    const s = getStatus();
    pills.forEach((pill) => {
      const label = pill.querySelector('[data-open-text]');
      pill.dataset.open = String(s.open);
      if (label) label.textContent = s.text;
      pill.hidden = false;
    });
  };

  tick();
  // One minute is plenty. This only ever crosses a boundary on the hour.
  setInterval(tick, 60_000);
}
