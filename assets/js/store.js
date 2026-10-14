/* ============================================================
   NAGA STEELS, Tiny shared store
   ------------------------------------------------------------
   The configurator, the calculator, the quote builder, the
   readout overlay and the SVG weave all read the same
   specification. Without a shared store they drift, and a user
   who sets 8 SWG in the configurator would find 10 SWG in the
   WhatsApp message, which destroys trust in exactly the moment
   we are trying to earn it.

   ~30 lines, no dependency. Subscribers are called with the full
   state plus the list of keys that actually changed, so a
   subscriber can skip expensive work when only an unrelated
   field moved.
   ============================================================ */

const state = {
  category: 'chain-link',
  gauge: 10,
  aperture: 2,          // 2" is the most commonly stocked size, so it is the
                        // honest default rather than the narrowest option
  coating: 'gi',
  height: '5 ft',
  // Free-text specification for the ranges that are not configurable
  // (sheet thickness, coil weight, roofing profile, fastener size).
  spec: '',
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
