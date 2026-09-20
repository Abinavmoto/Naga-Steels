/* ============================================================
   NAGA STEELS, Device capability tiering
   ------------------------------------------------------------
   The audience is farmers and contractors in South Tamil Nadu on
   budget Android phones over 4G. A beautiful 3D site that janks
   on a ₹9,000 phone is worse than no 3D at all.

   So the tier is decided BEFORE three.js is requested, and the
   import is gated behind it. A Tier 0 device downloads zero 3D
   bytes. Not a smaller scene: none at all.

   No UA sniffing: it is unreliable, it is actively being frozen
   by browsers, and it tells you about the browser rather than the
   GPU. Every static signal below is treated as a prior; the only
   thing trusted as a verdict is the live frame-time probe.
   ============================================================ */

export const TIERS = {
  0: { id: 0, name: 'static',  webgl: false },
  1: { id: 1, name: 'low',     webgl: true, dpr: 1.0, antialias: false,
       power: 'low-power',        cols: 6,  rows: 4, radial: 4, segsPerTurn: 14,
       env: false, fps: 30 },
  2: { id: 2, name: 'mid',     webgl: true, dpr: 1.5, antialias: false,
       power: 'default',          cols: 10, rows: 6, radial: 6, segsPerTurn: 20,
       env: 128, fps: 60 },
  3: { id: 3, name: 'desktop', webgl: true, dpr: 2.0, antialias: true,
       power: 'high-performance', cols: 14, rows: 8, radial: 8, segsPerTurn: 24,
       env: 256, fps: 60 },
};

const CACHE_KEY = 'ns.tier.v1';

/** Cheap one-off WebGL2 probe. The context is released immediately, because
 *  leaving it alive costs a GPU context on devices that only allow a few. */
function hasWebGL2() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2');
    if (!gl) return false;
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

export function detectTier() {
  // 1. Reduced motion is a user instruction, not a hint. Non-negotiable.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 0;

  // 2. No WebGL2 → static. A WebGL1 fallback path is not worth maintaining.
  if (!hasWebGL2()) return 0;

  const conn = navigator.connection || {};

  // 3. Data Saver on means the user has explicitly asked for fewer bytes.
  if (conn.saveData === true) return 0;

  // 4. Slow connection → don't spend 90 KB on decoration.
  if (['slow-2g', '2g'].includes(conn.effectiveType)) return 0;
  if (conn.effectiveType === '3g') return 1;

  let tier = 3;

  // 5-6. Memory and core count. Absent on Safari, so only ever demote.
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) tier = 1;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) {
    tier = Math.min(tier, 1);
  }

  // 7. Small touch screens are phones. Cap them regardless of reported specs:
  //    a phone that claims 8 cores is still a phone thermally.
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse && Math.min(screen.width, screen.height) < 500) tier = Math.min(tier, 1);
  else if (coarse) tier = Math.min(tier, 2);

  return tier;
}

export function getTier() {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached !== null) {
      const n = Number(cached);
      if (n >= 0 && n <= 3) return n;
    }
  } catch { /* storage blocked, just re-detect */ }

  const tier = detectTier();
  try { sessionStorage.setItem(CACHE_KEY, String(tier)); } catch { /* ignore */ }
  return tier;
}

export function demoteTier(current) {
  const next = Math.max(0, current - 1);
  try { sessionStorage.setItem(CACHE_KEY, String(next)); } catch { /* ignore */ }
  return next;
}

/* ---- Frame-time probe -------------------------------------------------
   The static signals above are guesses. This is the measurement.

   Median, not mean: a single GC pause or a shader compile would drag a
   mean over the threshold and wrongly demote a perfectly capable device.  */

export function createFrameProbe({ samples = 60, warmup = 10, onVerdict }) {
  const deltas = [];
  let last = performance.now();
  let done = false;

  return function sample() {
    if (done) return;
    const now = performance.now();
    deltas.push(now - last);
    last = now;

    if (deltas.length < samples) return;
    done = true;

    // Discard warm-up frames: shader compilation and the first texture
    // upload both land in there and are not representative.
    const usable = deltas.slice(warmup).sort((a, b) => a - b);
    const median = usable[Math.floor(usable.length / 2)];

    onVerdict(median <= 18 ? 'hold' : median <= 30 ? 'demote' : 'abort', median);
  };
}
