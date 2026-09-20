/* ============================================================
   NAGA STEELS, Tiny shared store
   ------------------------------------------------------------
   The hero configurator, the quote builder, the readout overlay
   and the 3D scene all read the same specification. Without a
   shared store they drift, and a user who sets 8 SWG in the hero
   would find 10 SWG in the WhatsApp message, which destroys
   trust in exactly the moment we are trying to earn it.

   ~30 lines, no dependency. Subscribers are called with the full
   state plus the list of keys that actually changed, so the 3D
   scene can skip a geometry rebuild when only the coating moved.
   ============================================================ */

const state = {
  category: 'chain-link',
  gauge: 10,
  aperture: 1,
  coating: 'gi',
  height: '5 ft',
  qty: '',
  unit: 'running feet',
  town: '',
  name: '',
};

const subscribers = new Set();

export const get = () => ({ ...state });

export function set(patch) {
  const changed = [];
  for (const [k, v] of Object.entries(patch)) {
    if (state[k] !== v) { state[k] = v; changed.push(k); }
  }
  if (!changed.length) return;
  const snapshot = get();
  subscribers.forEach((fn) => fn(snapshot, changed));
}

/** Returns an unsubscribe function. Called immediately so subscribers
 *  render their initial state without a separate bootstrap step. */
export function subscribe(fn) {
  subscribers.add(fn);
  fn(get(), Object.keys(state));
  return () => subscribers.delete(fn);
}
