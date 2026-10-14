# Removed: the WebGL weave

This folder previously held six modules (`scene.js`, `weave.js`, `showcase.js`,
`materials.js`, `primitives.js`, `products.js`) that rendered the chain-link
weave and the product showcase in three.js.

**All six are gone, along with `capability.js`'s tiering system and the
frame-time probe.** You can delete this folder entirely.

## Why

The 3D stack was technically the most interesting code in the project and
commercially the least defensible:

- **~600 KB of vendor code** (three.js module + core) to communicate three
  facts: wire thickness, mesh opening and coating colour.
- It required an entire **device-tiering apparatus** — a WebGL2 probe, a
  `deviceMemory` / `hardwareConcurrency` heuristic, a median frame-time
  sampler and a demotion ladder — purely to avoid janking on the budget
  Android phones that are most of this audience.
- On a Tier 0 device the whole thing degraded to a static SVG poster, which
  means the fallback was already doing the job for a meaningful share of real
  visitors.
- Visually it read as a tech demo. The 2026 revamp moves deliberately toward a
  premium editorial register, and a spinning WebGL canvas is the single
  loudest signal in the opposite direction.

## What replaced it

`assets/js/weave-svg.js` — an SVG `<pattern>` that maps:

| Spec | Rendering |
|---|---|
| gauge | stroke width |
| aperture | pattern tile size |
| coating | stroke colour |

About 2 KB, works everywhere, scales perfectly, prints, and cannot lose a GL
context. The over/under crossing is drawn explicitly with a dark shadow stroke
under one diagonal, because that alternation is what makes it read as *woven*
rather than as a grid.

## If you want 3D back

Do not restore the showcase. If a single moment of 3D is wanted, the defensible
place is one lazy-loaded scene on `/chain-link-fencing-madurai/` only, behind
an explicit user action, with the SVG weave as the default state.
