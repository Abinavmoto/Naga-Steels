/* ============================================================
   NAGA STEELS, product showcase
   ------------------------------------------------------------
   REMOVED in the 2026 revamp.

   This module drove a 600svh sticky WebGL canvas that rotated
   through seven product blueprints as the user scrolled. It has
   been replaced by the static six-family catalogue grid on the
   homepage (`.catalog__grid`), which:

     · is real crawlable HTML rather than a canvas
     · shows all six families at once instead of serialising
       them behind 600svh of scrolling
     · costs nothing on a budget Android phone
     · lets someone click straight through to the range they
       came for, which the scroll sequence actively prevented

   The export is kept as a no-op so that any stale cached copy of
   main.js importing it fails soft rather than throwing and
   taking the whole entry point, including the quote builder,
   down with it.

   SAFE TO DELETE once you are confident no cached HTML is in the
   wild. Nothing in the current codebase imports this.
   ============================================================ */

export function initShowcase() {
  /* intentionally empty */
}
