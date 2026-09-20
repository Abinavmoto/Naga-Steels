# Naga Steels, website

Static marketing site for Naga Steels, Madurai. Fencing, wire mesh, roofing sheets and steel
hardware. Conversion goal: a pre-filled WhatsApp quote.

**No build step.** Plain HTML, hand-written CSS and vanilla ES modules. Edit a file, push, done.
There is no Node, no npm, no bundler and no CI to keep working, which is the point: changing a
phone number in eighteen months should not require a toolchain that still resolves.

---

## Running it locally

Any static server will do. ES modules need a real HTTP origin, so opening `index.html`
directly from the filesystem will **not** work.

```sh
python -m http.server 8000
# then open http://localhost:8000
```

---

## Deploying

GitHub Pages, serving the repository root:

1. **Settings → Pages → Source** = *Deploy from a branch*
2. Branch `main`, folder `/ (root)`
3. Push. It is live in about a minute.

`.nojekyll` is present so GitHub serves the files as-is instead of running them through Jekyll.

### If you add a custom domain

Currently every canonical URL, `og:image` and `sitemap.xml` entry points at
`https://nagasteels.github.io/`. Those are absolute by necessity, search engines and WhatsApp
link previews both require a full URL.

So when the domain changes, find and replace `https://nagasteels.github.io` across all `.html`
files and `sitemap.xml`. Nothing else needs touching: **every internal link and asset path on
the site is relative**, so the site works unchanged at a subpath or at a domain root.

---

## Layout

```
index.html                      landing page: hero configurator, brands, 3D showcase,
                                quote builder, calculator, applications, FAQ
chain-link-fencing/index.html   ┐
welded-wire-mesh/index.html     │
barbed-wire/index.html          │
gi-wire/index.html              ├ seven product pages, each targeting its own intent
steel-sheets/index.html         │
roofing-sheets/index.html       │
steel-hardware/index.html       ┘
service-areas/index.html        delivery corridor, ONE page, see note below
404.html                        uses root-absolute paths (served at any depth)

assets/
  css/      tokens → fonts → base → components → sections   (load in that order)
  js/
    main.js            entry point
    store.js           shared spec state; keeps configurator and quote builder in sync
    data/products.js   ⭐ SINGLE SOURCE OF TRUTH: specs, contact details, brands,
                          applications. Edit HERE, not in the HTML.
    nav.js             mobile menu (focus trap, Escape, scrim)
    quote-builder.js   composes the WhatsApp message
    calculator.js      rolls / posts / area estimator
    configurator.js    hero controls + gated 3D boot
    showcase.js        sticky product showcase controller + SVG blueprints
    capability.js      device tiering
    open-now.js        live open/closed, computed in Asia/Kolkata
    scroll.js          reveals; GSAP where available
    three/
      weave.js         chain-link spiral curve
      primitives.js    shared unit cylinder / sphere / torus
      products.js      the seven showcase models, all procedural
      materials.js     the onBeforeCompile injections (gauge, dispersal, corrugation)
      scene.js         hero configurator scene
      showcase.js      showcase scene
  vendor/   three.js + GSAP, committed rather than loaded from a CDN
  fonts/    self-hosted woff2, latin subset
  img/      favicon, apple touch icon, OG cards, application photography
```

---

## Making changes

**Phone number, address, hours, GST → [`assets/js/data/products.js`](assets/js/data/products.js)**
for anything JavaScript renders. Note that the same details are also written directly into the
HTML (footer, JSON-LD, `tel:` links) so they are present without JavaScript, search for the old
number across `*.html` too.

**Product specs, gauges, apertures, coatings, delivery towns** → `products.js` only. The
configurator, the quote builder, the on-page tables and the structured data all read from it, so
a spec can never disagree with itself across the site.

---

## Things that look like mistakes but are deliberate

**The WhatsApp button is an `<a href>`, not a click handler.** iOS Safari blocks
programmatic `window.open()` calls that are not inside a synchronous user gesture, the common
"build the message on click, then open the window" pattern silently fails there and the lead is
lost with no error. The message is composed on every keystroke and written into a real anchor, so
navigation is genuinely user-initiated.

**Three.js is loaded with `await import()`, never a static import.** That one line is the
entire performance strategy: a low-end phone or a reduced-motion user never downloads the ~90 KB
chunk at all. A stray static `import` at the top of `configurator.js` would quietly pull it onto
the critical path and undo it. Check the network tab after touching that file.

**The poster is an inline SVG, not the canvas.** The 3D canvas must never be the LCP element.
The SVG paints instantly with zero requests; the canvas cross-fades over it after load, and only
on devices that pass the capability check.

**There is no price anywhere on the site.** Steel is a commodity and rates move weekly with zinc
and HR coil. A hardcoded price would be wrong within a month, and quoting a figure the yard will
not honour destroys trust on the first phone call. The material calculator gives the same "this
site is useful" feeling with no liability.

**One `/service-areas/` page, not one page per town.** Templated `/fencing-{city}/` pages are
the textbook definition of a doorway page. Google judges them near-duplicate, they never rank,
and they drag down the whole site's quality signal. Do not add them.

**No `aggregateRating` in the structured data.** Self-serving review markup on your own
LocalBusiness violates Google's guidelines. The 5.0 rating is shown visually instead.

**`html { overflow-x: clip }`, not `body { overflow-x: hidden }`.** Whether `hidden` on body
leaves body as a scroll container (which silently breaks `position: sticky` on every
descendant) depends on propagation rules browsers have not always agreed on. `clip` never
creates a scroll container. The showcase depends on sticky working, so do not move this back.

**The showcase panels are hand-written HTML, not injected like the old `#cards` grid.**
Seven screens of sticky canvas with no crawlable text would be a serious SEO regression.
If you add a range, add the panel markup too.

**The showcase collapses by removing `min-height`, not by JS.** The panels create the section
height, so Tier 0, reduced-motion and no-JS users get a normal card grid with zero JavaScript.
A hard-coded spacer height would leave them scrolling seven empty screens.

**No partner logos in the brands strip.** The Tata Wiron and VNC marks are built for light
backgrounds and render as grey boxes on a dark strip, and reproducing a third party's logo
wants their permission. The role label is the claim doing the work.

**The application photographs carry a disclaimer, deliberately.** They came from the client's
previous site, where each was labelled "conceptual application visual". They are not Naga
Steels' own projects and must never be captioned as though they are.

---

## Before launch

See [`OWNER-CHECKLIST.md`](OWNER-CHECKLIST.md), product specs and the map pin still need
confirming by the owner.

---

## Licences

Three.js (MIT) and GSAP are vendored in `assets/vendor/`. GSAP 3.13+ is free for commercial
use including every plugin. Fonts are Inter, Space Grotesk and JetBrains Mono, all SIL Open
Font License.
