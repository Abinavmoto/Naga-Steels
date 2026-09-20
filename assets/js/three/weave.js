/* ============================================================
   NAGA STEELS, Procedural chain-link geometry
   ------------------------------------------------------------
   No GLTF, no downloaded models. The fabric is generated in code.

   Scale convention: 1 world unit = 10 mm.
     50 mm aperture      → 5.0 units
     3.25 mm wire (Ø)    → 0.1625 units radius
   A ~30:1 ratio between aperture and wire, which is what real
   fabric looks like. Getting this ratio wrong is the fastest way
   to make a 3D fence look like a cartoon.
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';

export const MM = 0.1; // world units per millimetre

/* ---- The wire spine --------------------------------------------------
   A chain-link "spiral" is a flattened helix. Modelled here as a
   serpentine curve:

     x  triangle wave: straight 45° legs with a rounded knuckle
     y  linear descent
     z  sine: the small over/under that lets adjacent
                         spirals pass each other

   The x term is a triangle wave (via asin·sin), NOT a plain sine: real
   chain link has straight diagonal legs meeting at a sharp knuckle,
   whereas a sine gives a continuously curving squiggle that reads as
   rope rather than steel. A little sine is blended back in to round the
   knuckle so it doesn't look like folded card.                        */

export class SpiralCurve extends THREE.Curve {
  /**
   * @param {number} aperture  diamond opening, world units
   * @param {number} depth     out-of-plane amplitude (must be >= wire Ø)
   * @param {number} turns     full cycles in this curve
   * @param {number} phase     0 or Math.PI, alternating phase interlocks
   */
  constructor(aperture, depth, turns, phase) {
    super();
    this.A = aperture * 0.52;  // slight overlap at the knuckle reads as interlocked
    this.L = aperture * 2;     // vertical pitch per full cycle (45° legs)
    this.B = depth;
    this.turns = turns;
    this.phase = phase;
  }

  getPoint(t, target = new THREE.Vector3()) {
    const th = Math.PI * 2 * this.turns * t + this.phase;
    const tri = Math.asin(Math.sin(th)) / (Math.PI / 2); // exact triangle wave
    const x = this.A * (0.82 * tri + 0.18 * Math.sin(th));
    const y = -this.L * this.turns * t;
    const z = this.B * Math.sin(th);
    return target.set(x, y, z);
  }
}

/* ---- Building one aperture variant -----------------------------------
   Geometry is baked at radius 1.0 so the vertex normals are exact unit
   radial vectors. The shader then offsets along the normal to set the
   real wire radius at runtime; see materials.js. That is what makes the
   gauge slider free.

   Two separate geometries rather than one mirrored one: mirroring would
   mean negating Z on positions AND normals AND reversing the index
   winding, or losing backface culling. Building the phase-π curve
   directly costs ~1 ms at init and sidesteps all of that.              */

const BASE_RADIUS = 1.0;

export function buildVariant(apertureMm, tier) {
  const aperture = apertureMm * MM;
  const turns = 3;

  // Depth must stay >= one wire diameter. Below that the curve's torsion
  // approaches zero and TubeGeometry's Frenet frames flip at the
  // inflection points, and the tube visibly twists 180° at every knuckle.
  const depth = Math.max(aperture * 0.09, 4.1 * MM);

  const tubular = tier.segsPerTurn * turns;

  const mk = (phase) => new THREE.TubeGeometry(
    new SpiralCurve(aperture, depth, turns, phase),
    tubular, BASE_RADIUS, tier.radial, false,
  );

  return {
    geoA: mk(0),
    geoB: mk(Math.PI),
    pitch: aperture,            // horizontal spacing between spirals
    rowHeight: aperture * 2 * turns,
    aperture,
  };
}

/** Build every aperture the configurator can select, up front.
 *  Changing the aperture is a change to the spine and genuinely requires
 *  different geometry. Faking it by scaling the instance grid would put
 *  a false aperture on screen, and a contractor comparing 1" against 2"
 *  will notice immediately. ~1-3 ms each, so cache them all at init. */
export function buildVariants(aperturesMm, tier) {
  const map = new Map();
  for (const mm of aperturesMm) map.set(mm, buildVariant(mm, tier));
  return map;
}

/* ---- Instance placement ----------------------------------------------
   Even columns take the phase-0 geometry, odd columns phase-π, so
   neighbours interlock. Matrices are written once and marked static, so
   any drift in the fabric is done by rotating the parent Group, which
   is one matrix per frame rather than one per spiral.                  */

export function layoutInstances(meshA, meshB, variant, cols, rows) {
  const m = new THREE.Matrix4();
  const { pitch, rowHeight } = variant;

  const totalW = (cols - 1) * pitch;
  const totalH = (rows - 1) * rowHeight;

  let ia = 0;
  let ib = 0;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * pitch - totalW / 2;
      const y = totalH / 2 - r * rowHeight;
      m.makeTranslation(x, y, 0);
      if (c % 2 === 0) meshA.setMatrixAt(ia++, m);
      else meshB.setMatrixAt(ib++, m);
    }
  }

  meshA.count = ia;
  meshB.count = ib;
  meshA.instanceMatrix.needsUpdate = true;
  meshB.instanceMatrix.needsUpdate = true;
}

export const countsFor = (cols, rows) => ({
  a: Math.ceil(cols / 2) * rows,
  b: Math.floor(cols / 2) * rows,
});
