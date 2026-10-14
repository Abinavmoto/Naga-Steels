/* ============================================================
   NAGA STEELS, Image load states
   ------------------------------------------------------------
   Adds a shimmer skeleton to image containers that have not yet
   decoded, and clears it on load or on error.

   Why a skeleton and not a full-page loader:

     A blocking "site is loading" overlay would hide markup that
     has ALREADY painted. It delays LCP rather than improving it,
     it hides crawlable copy behind a script, and on a slow
     connection it shows a spinner for several seconds instead of
     progressively filling content. It also needs a timeout
     fallback, or one 404 hangs the entire page.

     Per-image skeletons have none of those properties. Content
     appears as it arrives, nothing is blocked, and the failure
     mode is "exactly what the page does today".

   Pure enhancement, by design:
     - a container whose image is already complete is skipped
       entirely, so a warm cache produces no skeleton flash;
     - `error` clears the skeleton too, otherwise a single 404
       would leave a card shimmering forever;
     - with JS disabled nothing is added at all.

   The class goes on the CONTAINER, never on the <img>. The
   container already has its box reserved by aspect-ratio or a
   fixed height, so the skeleton is paintable before a single
   byte of image data arrives. An undecoded <img> has nothing to
   paint and could not show anything.
   ============================================================ */

const HOSTS = [
  '.rcard__img',     // range carousel, both the real set and the clone
  '.product-shot',   // product detail pages
  '.update__media',  // supply updates carousel
  '.concept-image',  // application figures
  '.hcol__bg',       // homepage hero columns
  '.fcard',          // focus mosaic
].join(',');

/* .hero__media is deliberately excluded. Its <img> is held at opacity
   .16 as a background plate behind the h1, so a shimmering band there
   would be louder than the image it is standing in for. */

export function initImgLoad() {
  document.querySelectorAll(HOSTS).forEach((host) => {
    const img = host.matches('img') ? host : host.querySelector('img');
    if (!img) return;

    // naturalWidth guards against a cached 404: that also reports
    // complete === true, but has no pixels behind it.
    if (img.complete && img.naturalWidth > 0) return;

    host.classList.add('is-ph');

    const done = () => host.classList.add('is-ready');
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}
