/* ============================================================
   NAGA STEELS, device capability
   ------------------------------------------------------------
   This module previously held a four-tier device-capability
   system: a WebGL2 probe, deviceMemory / hardwareConcurrency
   heuristics, connection-type checks and a median frame-time
   sampler, all to decide how much three.js to load.

   The three.js stack is gone (see assets/js/three/README.md),
   so all of that went with it. What remains is the one signal
   that is still a genuine user instruction rather than a guess.
   ============================================================ */

/**
 * `prefers-reduced-motion` is an accessibility setting the user has
 * deliberately chosen, not a hint to weigh against others. Every animation
 * on the site already collapses via the token override in tokens.css; this
 * is for the JS paths that need to opt out entirely.
 */
export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Data Saver, or a 2G connection. Used to skip anything genuinely optional.
 * Absent on Safari and Firefox, so it can only ever return true on Chromium
 * and must never gate essential content.
 */
export const prefersLessData = () => {
  const conn = navigator.connection;
  if (!conn) return false;
  return conn.saveData === true || ['slow-2g', '2g'].includes(conn.effectiveType);
};
