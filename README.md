# Naga Steels

Static website for **Naga Steels**, a steel distributor, wholesaler, metal
supplier and fencing manufacturer in Madurai, Tamil Nadu, trading since 2002.
**Naga Fencing** is the dedicated fencing sub-brand.

Live at **https://nagasteels.github.io**

---

## What this is

A hand-built static site. No framework, no client-side router, no hydration.
Plain HTML, CSS and ES modules, served directly by GitHub Pages.

There *is* a small Node build step (`build/`), but it only generates shared page
chrome at author time and **the output is committed**. Nothing about the
deployed site depends on Node at runtime.

---

## Running it

Any static server will do. There is no install step for the site itself.

```
npx serve .
```

To regenerate the pages that use shared chrome:

```
npm run build
```

Node 18+ is required for the build only.

---

## Structure

```
index.html                  Homepage, hand-authored
404.html                    Root-absolute paths: served at any depth
sitemap.xml                 Generated. ~24 indexable URLs
robots.txt

assets/
  css/
    tokens.css              Design tokens. Start here.
    fonts.css               Three self-hosted faces
    base.css                Reset, typography, editorial furniture
    components.css          Buttons, nav, cards, tables, forms, footer
    sections.css            Page-section composition
  fonts/                    Inter 400/600, JetBrains Mono 400 (woff2)
  img/
    brand/                  Logos. All SVG, all drawn in-house
    applications/           Six conceptual application photographs
    hero/                   Hero plate (placeholder, see below)
    og-*.jpg                Social cards (need regenerating, see below)
  js/
    main.js                 Entry point
    data/                   Single source of truth, see below
    weave-svg.js            SVG chain-link renderer
    configurator.js         Fence configurator + planner tabs
    calculator.js           Material estimator
    quote-builder.js        Composes the WhatsApp enquiry
    nav.js                  Mega-menu + mobile drawer
    open-now.js             Live open/closed state in IST
    scroll.js               Reveals + GSAP ScrollTrigger
    store.js                ~30-line shared state
  vendor/
    gsap.min.js             GSAP 3.13+, free for commercial use
    ScrollTrigger.min.js

build/
  build.js                  Page generator
  partials.js               Shared head / header / footer
  pages.js                  Per-page copy and metadata

Reference themes/           Client reference material. Excluded in robots.txt
```

### Product and content pages

Nine product pages, six application pages, three brand pages, plus
`products/`, `services-delivery/`, `about/`, `contact/` and `privacy/`.

Eight retired short slugs (`chain-link-fencing/`, `steel-sheets/`, …) remain as
`noindex` meta-refresh stubs. GitHub Pages cannot issue a 301, so each stub
carries a canonical, a refresh and a visible link.

---

## The data layer

Everything factual lives in `assets/js/data/` and is imported, never duplicated:

| File | Holds |
|---|---|
| `business.js` | Name, GSTIN, phone, email, address, hours, origin, 19 delivery areas |
| `brands.js` | Naga Steels, Naga Fencing, Tata Wiron, VNC + four VNC product brands |
| `products.js` | Nine categories, six families, SWG table, apertures, coatings, zinc grades |
| `services.js` | Four services, three delivery tiers, four-step process |
| `applications.js` | Six applications with images and **mandatory disclaimers** |
| `content.js` | Trust figures, standards explainers, 16-item FAQ, buying guide |

**The rule:** if a number appears twice on the site, it is imported twice from
here. A spec that is wrong should be wrong in exactly one place.

To change the phone number, the GSTIN or the address, edit `business.js` and
re-run the build. (The hand-authored pages listed in `HAND_AUTHORED` in
`build/build.js` need the edit applied directly.)

---

## Design system

Light, editorial, premium. Derived from the logo: forest-green field, gold ring.

| Token | Value | Role |
|---|---|---|
| `--green` | `#006837` | Brand, CTAs, dark bands, footer |
| `--gold` | `#CDA535` | Rules, numerals, medallion ring |
| `--yellow` | `#FDEA56` | Eyebrows on dark, focus ring |
| `--off` | `#F2F1EC` | Page base |
| `--ink` | `#101410` | Text |

**Gold never carries body text.** `#CDA535` on white is roughly 2.1:1 and fails
WCAG AA. It is restricted to rules, icons, numerals and dark-background accents.
Links are green.

Display type is Inter 600 at `-0.052em` tracking with `line-height: 1`. No
second display family is loaded; the tracking does the work.

---

## Deliberate omissions

**No three.js.** The previous build shipped ~600 KB of WebGL plus a four-tier
device-capability system to show wire thickness, mesh opening and coating
colour. `assets/js/weave-svg.js` does the same in about 2 KB. See
`assets/js/three/README.md`.

**No prices.** Steel rates move weekly with zinc and HR coil. A stale price that
Google surfaces and the yard will not honour is worse than no price. The
calculator is explicitly a *material* estimator, and says so on the page.

**No analytics, no cookies, no third-party requests.** Fonts are self-hosted
specifically so that loading a page sends nothing to anyone else.

**No backend.** The quote builder composes a WhatsApp message in the browser and
writes it into a real `<a href>`. It is an anchor rather than `window.open()`
because iOS Safari blocks programmatic popups from async handlers, which
silently loses the lead.

---

## Before launch

Two files need attention:

- **`OWNER-CHECKLIST.md`** — specifications, claims and the address spelling
  that only the owner can confirm. Several figures on the site are
  industry-standard assumptions, not verified values.
- **`CONTENT-SOURCES.md`** — asset provenance, and the list of placeholders
  still to be replaced.

Specifically outstanding:

1. The homepage hero uses a **generated vector plate**, not a photograph.
2. The nine `og-*.jpg` social cards are still in the **retired dark theme**.
3. All six application images are **conceptual visuals** carrying visible
   disclaimers. They stay until real yard photography replaces them.
4. The Tata Wiron and VNC relationships are **unverified in writing**. Wording
   is "dealer supply" / "distributor supply" throughout, never "authorised".

---

## Moving to nagasteels.com

The site is built for this. Page addresses already match the slugs the `.com`
build used, so it is a host swap rather than a URL migration.

1. Update `BUSINESS.origin` in `assets/js/data/business.js`.
2. Find-and-replace `https://nagasteels.github.io` across the HTML.
3. Add a `CNAME` file at the repo root.
4. Re-run `npm run build`.
5. On a host that can issue real 301s, replace the eight meta-refresh stubs
   with server redirects.

---

## Contact

Naga Steels, 124 Chitrakara Street, Madurai, Tamil Nadu 625001
+91 99436 06823 · nagasteelsindia@gmail.com
GSTIN 33DGWPK4434F1Z7
