/* ============================================================
   NAGA STEELS, Deferred GSAP loader
   ------------------------------------------------------------
   GSAP ships UMD, not ESM, so it cannot be `import`ed directly in a
   no-build setup. Injecting the script tags after first paint keeps
   ~40 KB gzipped off the critical path, which is the whole point.

   Deduped: every caller shares one promise, so the scroll module and
   the 3D scene can both await it without racing.

   Licence note: GSAP 3.13+ is free for commercial use including every
   plugin (ScrollTrigger, SplitText and the rest). No Club tier needed.
   ============================================================ */

let promise = null;

const inject = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src;
  s.async = false;      // preserve execution order: core before plugin
  s.onload = resolve;
  s.onerror = () => reject(new Error(`Failed to load ${src}`));
  document.head.appendChild(s);
});

// Resolved from this module's own URL, so it is correct from the landing
// page and from a product page one directory deeper, with no base config
// and nothing to keep in sync when a page moves.
const vendor = (file) => new URL(`../vendor/${file}`, import.meta.url).href;

/**
 * @returns {Promise<{gsap: object, ScrollTrigger: object}|null>}
 *          null if GSAP could not load. Callers must degrade, never throw.
 */
export function loadGsap() {
  if (promise) return promise;

  promise = (async () => {
    try {
      await inject(vendor('gsap.min.js'));
      await inject(vendor('ScrollTrigger.min.js'));
      const { gsap, ScrollTrigger } = window;
      if (!gsap) return null;
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    } catch {
      return null;
    }
  })();

  return promise;
}
