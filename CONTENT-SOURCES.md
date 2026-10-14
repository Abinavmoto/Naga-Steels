# Content, imagery and asset provenance

Every visual asset on this site, where it came from, and what still needs replacing.
Kept because "where did that photo come from" is a question that always arrives later,
usually from someone's lawyer.

---

## 1. Brand marks

| File | Origin | Notes |
|---|---|---|
| `assets/img/brand/naga-steels-main-logo.jpeg` | **Redrawn in-house** from the client-supplied raster logo | Vector redraw. The supplied PNG is a 512px gradient-heavy raster: acceptable at 54px in a header, soft at 128px, unusable as a favicon. The redraw keeps the forest field, gold ring, white slab-serif N with weave slats, green S, gold check and magenta flash. The photographic bevel on the ring and the outer chain-link weave are deliberately dropped, because both turn to mud below ~96px. |
| `assets/img/brand/naga-steels-mono.svg` | Derived from the above | White monochrome, for dark footer bands. |
| `assets/img/favicon.svg` | Derived from the above | Simplified to three cues (green field, gold ring, white N). At 16px the slats, S, check and flash are noise. |
| `assets/img/brand/naga-fencing-logo.svg` | **Drawn in-house** | Built from the master mark's vocabulary rather than invented: same field, ring and N, with the chain-link weave at full strength because on the fencing brand the weave is the point. |
| `assets/img/brand/tata-wiron-wordmark.svg` | **Type lockup, in-house** | ⚠ **Not a reproduction of the Tata Wiron logo.** Reproducing a third party's registered mark requires their written permission, which is not on file. A neutral type lockup states the supply relationship without appropriating the identity. |
| `assets/img/brand/vnc-group.svg` | **Type lockup, in-house** | ⚠ Same reasoning. Not the VNC Group logo. |
| VNC sub-brands (Bestfence, Bestwire, Bestarc, Voltwire) | **CSS type lockups**, no image files | Same reasoning again. Rendered via `.vnc-type` in `sections.css`, inside a fixed-size `.vnc-card__mark` box. This also guarantees four consistent tiles instead of four rasters at four different weights and background colours. |

**If written permission is obtained** for the Tata Wiron and VNC marks, the type lockups
can be swapped for the real logos without any layout change: the slots are already the
right dimensions.

---

## 2. Application photography

| File | Status |
|---|---|
| `assets/img/applications/agricultural.webp` | Carried over from the client's previous website |
| `assets/img/applications/industrial.webp` | ″ |
| `assets/img/applications/warehouse.webp` | ″ |
| `assets/img/applications/solar.webp` | ″ |
| `assets/img/applications/residential.webp` | ″ |
| `assets/img/applications/contractor.webp` | ″ |

⚠ **All six are conceptual application visuals. None shows a completed Naga Steels
project.** Every one of them renders with a visible `figcaption` disclaimer saying exactly
that, and there is a second site-level disclaimer under the applications grid on the
homepage.

**This is a hard requirement, not a style choice.** Presenting an illustrative image as
your own completed work is the one thing on this site that would not be true, and it is
also the kind of claim a competitor reports. The captions stay until real yard
photography replaces the images.

The disclaimer strings live in `assets/js/data/applications.js` under `disclaimer`, and
are duplicated into the static markup so they are crawlable and survive JS failure.

---

## 3. Placeholder assets awaiting replacement

| File | What it is | Replace with |
|---|---|---|
| `assets/img/home/*.svg` (24 files) | **Generated vector placeholders** for the homepage blocks. Each is labelled on-canvas with its slot name and target pixel size. | See the slot manifest in §3a. |
| `assets/img/hero/hero-plate.svg` | **Generated vector plate.** Retained but no longer used on the homepage; the three-column hero replaced the single-image hero it was drawn for. Still referenced by nothing — safe to delete once no sub-page picks it up. | — |
| `assets/img/og-*.jpg` (9 files) | Carried over from the previous dark build | Regenerate in the new green/gold identity. They currently render in the retired dark theme, so a shared link looks like a different company. |
| `assets/img/apple-touch-icon.png` | Carried over | Regenerate from `naga-steels-main-logo.jpeg` at 180×180. |

### 3a. Homepage image slot manifest

Generate to these exact filenames and drop them into `assets/img/home/`. Then change the
extension from `.svg` to `.jpg` in two places only: the `--img` custom property or `src`
in `index.html`, and the `<link rel="preload">` in `<head>` for hero column 01.

| # | Filename | Ratio | Target px | Subject and constraints |
|---|---|---|---|---|
| 1 | `hero-01-fencing` | **2:3** | 1200 × 1800 | Chain-link perimeter / weaving. **Subject must sit in the top 55%** — the bottom 40% is covered by the scrim and the headline block. |
| 2 | `hero-02-steel` | 2:3 | 1200 × 1800 | Sheet stack, coil or roofing profile. Same top-55% rule. |
| 3 | `hero-03-contractor` | 2:3 | 1200 × 1800 | Site staging, loaded lorry or BOQ-led dispatch. Same top-55% rule. |
| 4 | `focus-feature` | **7:5** | 1680 × 1200 | Works floor / chain-link being woven. Copy overlays the lower third. |
| 5 | `focus-small-1` | **3:2** | 1480 × 990 | Tata Wiron wire coils. |
| 6 | `focus-small-2` | 3:2 | 1480 × 990 | VNC product stack. |
| 7–9 | `update-1` … `update-3` | **1.53:1** | 1200 × 782 | Yard stock · chain-link roll · delivery lorry. |
| 10–24 | `range-01` … `range-15` | **1:1** | 800 × 800 | **Product cut-outs on white or transparent.** These render with `object-fit: contain`, so a scene photograph will letterbox and look wrong. One product, centred, no background clutter. Order matches the carousel: 01 GI chain link · 02 PVC coated chain link · 03 barbed wire · 04 weld mesh · 05 woven mesh · 06 GI wire · 07 binding wire · 08 wire rope · 09 GI plain sheet · 10 MS sheet · 11 shutter sheet · 12 colour coated sheet · 13 GI corrugated · 14 wire nails · 15 GI bolts. |

The four "Why Naga Steels?" icons are **inline SVG in the markup**, not image files, so
they are crisp at any DPR, recolour from `--gold`, and cost no requests. No action needed.

### Photograph sourcing brief

If stock is used rather than owner photography, source only from Unsplash, Pexels or
Pixabay (all CC0-equivalent, commercial use permitted, no attribution required). Log the
URL and the photographer here when added. **Do not** use Google Images results, IndiaMart
listings or competitor sites.

Processing pipeline for any photograph added:

- AVIF + WebP + JPEG fallback via `<picture>`
- `srcset` at 480 / 768 / 1200 / 1920 / 2560
- Explicit `width` and `height` on every `<img>` to hold CLS at zero
- `loading="lazy"` everywhere **except** the hero, which takes
  `fetchpriority="high"` plus a `<link rel="preload">`
- Descriptive `alt`, or `alt=""` if the image is purely decorative

---

## 4. Fonts

| Family | Weights | Origin | Licence |
|---|---|---|---|
| Inter | 400, 600 | Self-hosted `assets/fonts/` | SIL Open Font License 1.1 |
| JetBrains Mono | 400 | Self-hosted | SIL Open Font License 1.1 |

Self-hosted rather than served from the Google Fonts CDN: one fewer DNS lookup and TLS
handshake on an Indian mobile connection, no third-party request, and the files cannot
change under us.

**Space Grotesk 700 was removed** in the revamp. It reads "tech startup", which is
precisely the register this rebuild moves away from. Display type is now Inter 600 set at
`-0.052em` tracking with `line-height: 1`, which is the same construction the premium
editorial references use. Weight 700 is mapped to the 600 file and synthesised, which at
display sizes with that much negative tracking is imperceptible and saves a font request.

---

## 5. Third-party code

| Library | Version | Licence | Why |
|---|---|---|---|
| GSAP + ScrollTrigger | 3.13+ | Free for commercial use including all plugins | Scroll reveals and count-ups. Injected after first paint, never on the critical path. |

**three.js was removed entirely** in the revamp, along with the six-module WebGL scene,
the device-tiering system and the frame-time probe. It was ~600 KB of vendor code
communicating three facts — wire thickness, mesh opening, coating colour — that an SVG
`<pattern>` communicates in about 2 KB. See `assets/js/weave-svg.js`.

---

## 5a. Homepage layout provenance

The five homepage blocks — updates carousel, three-column cinematic hero, "what's new"
focus mosaic, "Why Naga Steels?" stat band and the range carousel — follow the
**structure and proportions** of the Betafence reference held in `Reference themes/`.
Layout and proportion are not protectable; the implementation here is original.

What was **not** taken, and must never be:

- **No Betafence photography.** Not one file from `Reference themes/www-betafence-com/images/`
  ships. Every slot uses a generated placeholder pending client photography.
- **No Betafence fonts.** The `fonts/` folder there contains Alegreya Sans and Swiss 721,
  both commercially licensed to Betafence. Using them would be a straightforward
  licensing breach, not a grey area.
- **No Betafence logos or brand assets.**
- **None of the implementation.** The reference ships ~1,400 lines of inline
  `!important` CSS inside its HTML with hard-coded hex values and `div[role=link]`
  with `onclick`. This build uses a tokenised stylesheet loaded only by `index.html`,
  and real anchors.

Colour mapping applied: crimson `#930036` → `--green`, slate `#0F1720` → `--green-ink`,
grey band `#D9DEE3` → `--green-tint-2`, Arial 900 uppercase → `--font-display` 600 at
`--track-display`.

---

## 6. Copy

Written in-house. The register is deliberately scope-honest and non-overclaiming:

- No claim of installation, erection or civil work anywhere on the site.
- "Dealer supply" and "Distributor supply", never "authorised", until those
  relationships are confirmed in writing.
- No prices in the copy or in the structured data. Steel rates move weekly with zinc and
  HR coil; a stale price that Google surfaces and the yard will not honour is worse than
  no price at all.
- The material calculator is explicitly **not** a price estimator, and says so on the page.

Source material for the product and service descriptions came from the client's own
previous site build, retained under `Reference themes/naga-steels-base-content/` and
excluded from crawling in `robots.txt`.
