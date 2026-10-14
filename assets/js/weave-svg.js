/* ============================================================
   NAGA STEELS, SVG chain-link weave
   ------------------------------------------------------------
   Replaces the three.js scene that used to render this.

   The 3D version was technically impressive and cost roughly
   600 KB of vendor code, a WebGL context, a device-tiering
   system and a frame-time probe, to communicate exactly three
   facts: wire thickness, mesh opening and coating colour.

   An SVG <pattern> communicates the same three facts, in about
   two kilobytes, on every device including the ₹9,000 Android
   phones this audience actually uses. It also scales perfectly,
   prints, and cannot lose its context.

     gauge   → stroke width
     aperture→ pattern tile size
     coating → stroke colour

   Geometry note: a real chain-link picket is a zig-zag whose
   diagonals cross at the tile centre, with the over/under
   alternating. That alternation is what makes it read as woven
   rather than as a grid, so it is drawn explicitly with a dark
   "shadow" stroke under one diagonal rather than faked.
   ============================================================ */

const NS = 'http://www.w3.org/2000/svg';

/* Millimetre-to-pixel scale. Chosen so a 50 mm aperture (the most
   commonly stocked 2") renders at a comfortable tile size, and so the
   extremes (25 mm and 75 mm) both stay legible in the same viewport. */
const MM_PX = 1.55;

/* Wire renders thicker than true scale. At true scale a 3.25 mm wire in
   a 50 mm opening is a 5 px line in a 78 px tile, which is technically
   accurate and visually anaemic. 2.6× keeps the relative difference
   between 8 / 10 / 12 SWG honest while staying readable. */
const WIRE_EXAGGERATION = 2.6;

export function createWeave(host) {
  if (!host) return null;

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 480 400');
  svg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
  svg.setAttribute('role', 'img');

  const defs = document.createElementNS(NS, 'defs');

  // Wire gradient: a lit top-left edge and a shaded bottom-right, which is
  // what makes a flat stroke read as a round wire.
  const grad = document.createElementNS(NS, 'linearGradient');
  grad.setAttribute('id', 'ns-wire-grad');
  grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
  grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
  const stops = [
    ['0%', 'var(--w-hi)'],
    ['45%', 'var(--w-mid)'],
    ['100%', 'var(--w-lo)'],
  ];
  stops.forEach(([offset, color]) => {
    const s = document.createElementNS(NS, 'stop');
    s.setAttribute('offset', offset);
    s.setAttribute('stop-color', color);
    grad.appendChild(s);
  });
  defs.appendChild(grad);

  const pattern = document.createElementNS(NS, 'pattern');
  pattern.setAttribute('id', 'ns-weave');
  pattern.setAttribute('patternUnits', 'userSpaceOnUse');
  defs.appendChild(pattern);

  // Vignette, so the weave reads as a lit panel rather than wallpaper.
  const vig = document.createElementNS(NS, 'radialGradient');
  vig.setAttribute('id', 'ns-vig');
  vig.setAttribute('cx', '50%'); vig.setAttribute('cy', '44%'); vig.setAttribute('r', '66%');
  [['50%', '#000', '0'], ['100%', '#10251A', '0.92']].forEach(([o, c, op]) => {
    const s = document.createElementNS(NS, 'stop');
    s.setAttribute('offset', o);
    s.setAttribute('stop-color', c);
    s.setAttribute('stop-opacity', op);
    vig.appendChild(s);
  });
  defs.appendChild(vig);

  svg.appendChild(defs);

  const bg = document.createElementNS(NS, 'rect');
  bg.setAttribute('width', '480'); bg.setAttribute('height', '400');
  bg.setAttribute('fill', '#10251A');
  svg.appendChild(bg);

  const fill = document.createElementNS(NS, 'rect');
  fill.setAttribute('width', '480'); fill.setAttribute('height', '400');
  fill.setAttribute('fill', 'url(#ns-weave)');
  svg.appendChild(fill);

  const vigRect = document.createElementNS(NS, 'rect');
  vigRect.setAttribute('width', '480'); vigRect.setAttribute('height', '400');
  vigRect.setAttribute('fill', 'url(#ns-vig)');
  vigRect.setAttribute('pointer-events', 'none');
  svg.appendChild(vigRect);

  host.replaceChildren(svg);

  /**
   * @param {{wireMm:number, apertureMm:number, coating:{hex:string,full:string},
   *          gauge:number, apertureLabel:string}} spec
   */
  function render(spec) {
    const { wireMm, apertureMm, coating } = spec;

    // One pattern tile = one full zig-zag period, so the tile is the
    // aperture doubled. Clamped so neither extreme degenerates.
    const tile = Math.max(28, Math.min(180, apertureMm * MM_PX * 2));
    const half = tile / 2;
    const w = Math.max(2, wireMm * MM_PX * WIRE_EXAGGERATION);

    pattern.setAttribute('width', String(tile));
    pattern.setAttribute('height', String(tile));

    // Three shades derived from the coating swatch, driven through CSS
    // custom properties so the gradient stays declarative.
    const { hi, mid, lo } = shades(coating.hex);
    svg.style.setProperty('--w-hi', hi);
    svg.style.setProperty('--w-mid', mid);
    svg.style.setProperty('--w-lo', lo);

    const stroke = 'url(#ns-wire-grad)';
    const common =
      `fill="none" stroke="${stroke}" stroke-width="${w}" ` +
      `stroke-linecap="round" stroke-linejoin="round"`;

    /* Two interlocking pickets per tile.
       A: descends left-to-right through the centre.
       B: ascends left-to-right through the centre.
       The dark segment under B's lower half is the over/under crossing. */
    pattern.innerHTML =
      `<path d="M0 0 L${half} ${half} L0 ${tile}" ${common}/>` +
      `<path d="M${tile} 0 L${half} ${half} L${tile} ${tile}" ${common}/>` +
      `<path d="M${half} ${half} L${tile} ${tile}" fill="none" stroke="#06150D" ` +
        `stroke-width="${w * 1.4}" stroke-linecap="round" opacity="0.5"/>` +
      `<path d="M${tile} 0 L${half} ${half}" ${common}/>`;

    svg.setAttribute(
      'aria-label',
      `Chain link weave at ${spec.gauge} SWG, ${spec.apertureLabel} mesh, ${coating.full}`,
    );
  }

  return { render, el: svg };
}

/* Derive a lit / base / shaded triple from one swatch hex. Done in sRGB
   rather than a perceptual space: the difference is invisible at these
   deltas and it avoids pulling in a colour library for three lines. */
function shades(hex) {
  const n = parseInt(hex.replace('#', ''), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const mix = (c, t, amt) => Math.round(c + (t - c) * amt);
  const toHex = (rr, gg, bb) =>
    `#${[rr, gg, bb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  return {
    hi:  toHex(mix(r, 255, 0.55), mix(g, 255, 0.55), mix(b, 255, 0.55)),
    mid: toHex(r, g, b),
    lo:  toHex(mix(r, 0, 0.45), mix(g, 0, 0.45), mix(b, 0, 0.45)),
  };
}
