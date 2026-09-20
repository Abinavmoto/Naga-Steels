/* ============================================================
   NAGA STEELS, the six showcase products
   ------------------------------------------------------------
   Every product is procedural. No downloaded models.

   Each builder returns:
     { meshes, pose, motion }

   `pose` varies the camera per product, which matters more than it
   sounds. Four of these are "thin galvanized wire at the same scale
   in the same material"; rendered from one fixed camera they read as
   a single object rearranging itself rather than as six ranges. The
   coil is seen whole, the weld mesh rakes away, the sheet runs along
   its length, the fasteners are seen from above.

   `motion` is the four-number weighting for the dispersal transition.
   Chain link collapses like fabric; the coil unwinds rather than
   shatters; the sheet does not explode at all.
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';
import { SpiralCurve, MM } from './weave.js';
import { unitWire, unitNode, unitRing, unitSpike, unitHex, setWire, setUniform, rand }
  from './primitives.js';

const TAU = Math.PI * 2;

/* ---- 01 Chain link ---------------------------------------------------- */

export function buildChainLink(tier, mat) {
  const aperture = 50 * MM;
  const turns = 3;
  const depth = Math.max(aperture * 0.09, 4.1 * MM);
  const seg = tier.segsPerTurn * turns;

  const mk = (phase) => new THREE.TubeGeometry(
    new SpiralCurve(aperture, depth, turns, phase), seg, 1.0, tier.radial, false);

  const geoA = mk(0);
  const geoB = mk(Math.PI);
  const cols = tier.cols;
  const rows = Math.max(2, Math.round(tier.rows * 0.6));
  const rowH = aperture * 2 * turns;

  const a = new THREE.InstancedMesh(geoA, mat, Math.ceil(cols / 2) * rows);
  const b = new THREE.InstancedMesh(geoB, mat, Math.floor(cols / 2) * rows);
  let ia = 0, ib = 0;
  const totalW = (cols - 1) * aperture;
  const totalH = (rows - 1) * rowH;

  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const x = c * aperture - totalW / 2;
      const y = totalH / 2 - r * rowH;
      const m = new THREE.Matrix4().makeTranslation(x, y, 0);
      if (c % 2 === 0) a.setMatrixAt(ia++, m); else b.setMatrixAt(ib++, m);
    }
  }
  a.count = ia; b.count = ib;

  return {
    meshes: [a, b],
    radius: 1.625 * MM,
    pose: { fov: 38, z: 30, rot: [0.07, -0.2, 0.02] },
    motion: [0.8, 2.4, 4.0, 6.0],
  };
}

/* ---- 02 Welded mesh ---------------------------------------------------
   An orthogonal grid of straight wires plus a bead at each crossing.
   The beads are 90% of the triangles and invisible below ~3 CSS px, so
   Tier 1 skips them entirely.                                          */

export function buildWeldMesh(tier, mat) {
  const pitch = 42 * MM;
  const n = Math.min(9, Math.max(5, Math.round(tier.cols * 0.6)));
  const span = pitch * (n - 1);
  const wire = unitWire(tier.radial);

  const bars = new THREE.InstancedMesh(wire, mat, n * 2);
  let i = 0;
  for (let k = 0; k < n; k++) {
    const o = k * pitch - span / 2;
    // Horizontals: rotate the Y-axis cylinder onto X.
    setWire(bars, i++, 0, o, 0, 0, 0, Math.PI / 2, span * 1.06);
    // Verticals sit one diameter behind, which is what welded mesh does.
    setWire(bars, i++, o, 0, -3.2 * MM, 0, 0, 0, span * 1.06);
  }
  bars.count = i;

  const meshes = [bars];

  if (tier.radial >= 6) {
    const node = unitNode(tier.radial);
    const beads = new THREE.InstancedMesh(node, mat, n * n);
    let j = 0;
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        setUniform(beads, j++, c * pitch - span / 2, r * pitch - span / 2,
                   -1.6 * MM, 0, 0, 0, 2.0);
      }
    }
    beads.count = j;
    meshes.push(beads);
  }

  return {
    meshes,
    radius: 1.32 * MM,
    // Raking angle so a flat panel does not read as wallpaper, and so it is
    // visually distinct from the chain link that preceded it.
    pose: { fov: 34, z: 34, rot: [0.34, -0.62, 0.06] },
    motion: [0.4, 1.2, 1.0, 14.0],
  };
}

/* ---- 03 Barbed wire ---------------------------------------------------
   Two strands twisted around a common axis, with 4-point barbs.

   A helix's Frenet normal always points at the axis, so the frame at
   t=0 and t=1 is identical and one turn tiles seamlessly by instancing.
   The second strand is the same geometry rotated PI about the run axis,
   so both strands come from a single InstancedMesh.                    */

class TwistCurve extends THREE.Curve {
  constructor(radius, len, phase) {
    super();
    this.r = radius; this.len = len; this.phase = phase;
  }
  getPoint(t, target = new THREE.Vector3()) {
    const th = t * TAU + this.phase;
    return target.set(t * this.len - this.len / 2,
                      this.r * Math.cos(th),
                      this.r * Math.sin(th));
  }
}

export function buildBarbedWire(tier, mat) {
  const wireR = 2.4 * MM;
  // The helix radius must EQUAL the wire radius so the two strands touch.
  // Any gap and it stops being a cable and becomes a DNA model.
  const turnLen = 11 * MM;
  const turns = Math.min(22, Math.max(12, tier.cols * 2));

  // Built at TRUE radius, not at 1.0. This product mixes strands, spikes and
  // collars in one material, and uWireRadius is a single uniform shared by
  // all of them, so only one of the three could use it. The strands are the
  // ones that would look worst if scaled, so they carry their real size and
  // the uniform is left inert (radius: 1.0 below).
  const geo = new THREE.TubeGeometry(
    new TwistCurve(wireR, turnLen, 0),
    Math.max(8, tier.segsPerTurn), wireR, tier.radial, false);

  const strands = new THREE.InstancedMesh(geo, mat, turns * 2);
  const runLen = turnLen * turns;
  let i = 0;
  for (let t = 0; t < turns; t++) {
    const x = t * turnLen - runLen / 2 + turnLen / 2;
    setUniform(strands, i++, x, 0, 0, 0, 0, 0, 1);
    // Second strand: same turn, rolled half a revolution about the run axis.
    setUniform(strands, i++, x, 0, 0, Math.PI, 0, 0, 1);
  }
  strands.count = i;

  const meshes = [strands];

  // Barbs every ~4 inches, the middle of the IS 278 range.
  const barbGap = 96 * MM;
  const barbs = Math.max(3, Math.floor(runLen / barbGap));
  const spikeR = 1.15 * MM;
  const spike = unitSpike(0.22, Math.max(5, tier.radial - 1));
  const spikes = new THREE.InstancedMesh(spike, mat, barbs * 4);

  let s = 0;
  for (let b = 0; b < barbs; b++) {
    const x = (b + 0.5) * barbGap - runLen / 2;
    // Real barbs rotate along the coil rather than all pointing the same way.
    // One hash per barb is what stops the run looking machined in CAD.
    const roll = rand(b * 3.7) * TAU;
    for (let k = 0; k < 4; k++) {
      const a = roll + (k * Math.PI) / 2;
      const lean = k < 2 ? 0.42 : -0.42;         // two forward, two back
      const len = (15 + rand(b * 7.1 + k) * 3.6) * MM;  // hand-cut variation
      const reach = wireR * 1.15 + len * 0.5;
      // Euler XYZ applies Z first then X, so `lean` tips the spike along the
      // run and `a` then swings it to its radial angle. An earlier version
      // added PI/2 here, which pointed every barb along the cable instead of
      // away from it.
      setWire(spikes, s++,
              x + lean * 3 * MM, Math.cos(a) * reach, Math.sin(a) * reach,
              a, 0, lean, len, spikeR);
    }
  }
  spikes.count = s;
  meshes.push(spikes);

  // Collar: one wrap of wire seating each barb onto the cable. Without it the
  // spikes look stuck on rather than wound on. True dimensions, scale 1.
  const collarGeo = new THREE.TorusGeometry(
    wireR * 1.9, spikeR * 0.85, Math.max(5, tier.radial - 1), 18);
  const collars = new THREE.InstancedMesh(collarGeo, mat, barbs);
  for (let b = 0; b < barbs; b++) {
    const x = (b + 0.5) * barbGap - runLen / 2;
    // Torus lies in XY with its hole along Z; one PI/2 about Y puts the hole
    // along the run axis so it rings the cable.
    setUniform(collars, b, x, 0, 0, 0, Math.PI / 2, 0, 1);
  }
  collars.count = barbs;
  meshes.push(collars);

  return {
    meshes,
    radius: 1.0,   // tube already at true radius; keep the wire term inert
    pose: { fov: 30, z: 20, rot: [0.16, 0.0, -0.08] },
    motion: [1.4, 3.0, 6.0, 4.0],
  };
}

/* ---- 04 GI wire coil --------------------------------------------------
   A trade coil is a torus of wound wire, not a spool on a reel.
   Consecutive wraps genuinely ARE rotated copies of one another, so
   instancing a torus is exact rather than a cheat.                     */

export function buildCoil(tier, mat) {
  const wireR = 2.6 * MM;
  const coilR = 52 * MM;
  const wraps = Math.min(26, Math.max(12, tier.cols * 2));
  const ring = unitRing(coilR / wireR, Math.max(6, tier.radial),
                        Math.max(26, tier.segsPerTurn * 2));

  const wrapsMesh = new THREE.InstancedMesh(ring, mat, wraps);
  const spread = 26 * MM;

  for (let i = 0; i < wraps; i++) {
    const t = wraps === 1 ? 0.5 : i / (wraps - 1);
    // Lay every wrap in the SAME plane (torus lies in XY, so one PI/2 about
    // X puts the hole along Y) and step it through the bundle width.
    // An earlier version also rotated each wrap about Y by a cumulative
    // amount, which tipped every ring into a different plane and turned the
    // coil into a ball of hoops.
    const tilt = (rand(i * 3.1) - 0.5) * 0.09;   // hand-wound, not machined
    const jx = (rand(i * 5.7) - 0.5) * 3 * MM;
    const jz = (rand(i * 7.3) - 0.5) * 3 * MM;
    // +/-4% radius variation fills the bundle cross-section. It varies the
    // tube radius by the same 4%, which is imperceptible.
    const s = wireR * (0.97 + rand(i * 9.1) * 0.06);
    setUniform(wrapsMesh, i, jx, (t - 0.5) * spread, jz,
               Math.PI / 2 + tilt, 0, tilt * 0.7, s);
  }
  wrapsMesh.count = wraps;

  // One loose end escaping the bundle. A perfect torus reads as CAD; a
  // single wire end sticking out reads as a coil sitting in a godown.
  const tail = new THREE.CatmullRomCurve3([
    new THREE.Vector3(coilR * 0.99, spread * 0.42, 0),
    new THREE.Vector3(coilR * 1.20, spread * 0.30, 14 * MM),
    new THREE.Vector3(coilR * 1.24, spread * -0.10, 32 * MM),
    new THREE.Vector3(coilR * 0.96, spread * -0.34, 44 * MM),
  ]);
  const tailGeo = new THREE.TubeGeometry(tail, 28, wireR, Math.max(6, tier.radial), false);
  const tailMesh = new THREE.InstancedMesh(tailGeo, mat, 1);
  setUniform(tailMesh, 0, 0, 0, 0, 0, 0, 0, 1);
  tailMesh.count = 1;

  return {
    meshes: [wrapsMesh, tailMesh],
    radius: 1.0,   // the tail is already at true radius; leave the term inert
    // Seen whole and from slightly above, so it is unmistakably one object
    // rather than another field of wire.
    pose: { fov: 36, z: 19, rot: [0.5, -0.22, 0.0] },
    motion: [0.2, 0.4, 0.0, 10.0],
  };
}

/* ---- 05 Roofing sheet -------------------------------------------------
   A plane whose corrugation is pressed in by the vertex shader, left to
   right, as uD falls. That is literally roll-forming, which is how the
   product is actually made.

   It does not explode: a single-sided plane shows black from behind, and
   side: DoubleSide would set a shader define and cost a second program.
   It un-forms and slides into the fog instead.                          */

export function buildSheet(tier, mat) {
  const w = 150 * MM;
  const h = 95 * MM;
  const segX = Math.max(48, tier.segsPerTurn * 3);
  const geo = new THREE.PlaneGeometry(w, h, segX, 6);

  const mesh = new THREE.InstancedMesh(geo, mat, 3);
  for (let i = 0; i < 3; i++) {
    setUniform(mesh, i, i * 3.5 * MM, -i * 5 * MM, -i * 7 * MM, 0, 0, 0, 1);
  }
  mesh.count = 3;

  return {
    meshes: [mesh],
    radius: 1.0,            // solid product: leaves the wire term inert
    corrugate: 1.0,
    // PPGI in this market is brick red or sea green. One coloured product
    // breaks six screens of grey instantly.
    colour: '#8C3B2E',
    roughness: 0.5,
    metalness: 0.15,
    // Narrow fov compresses the sheet and makes it run away along its length.
    pose: { fov: 26, z: 44, rot: [0.22, -0.78, 0.05] },
    motion: [0.0, 0.0, 0.0, 18.0],
  };
}

/* ---- 06 Fasteners -----------------------------------------------------
   The risk here is composition, not triangles. Five neat bolts is
   clipart. Thirty overlapping ones in a shallow heap is a product.      */

export function buildFasteners(tier, mat) {
  const count = Math.min(46, Math.max(18, tier.cols * 3));
  const hex = unitHex();
  const wire = unitWire(Math.max(5, tier.radial));

  const heads = new THREE.InstancedMesh(hex, mat, count);
  const shanks = new THREE.InstancedMesh(wire, mat, count);

  const R = 52 * MM;
  for (let i = 0; i < count; i++) {
    // Shallow disc scatter. sqrt keeps the density even instead of
    // clumping everything into the middle.
    const a = rand(i * 1.7) * TAU;
    const r = Math.sqrt(rand(i * 2.9)) * R;
    const x = Math.cos(a) * r;
    const z = Math.sin(a) * r * 0.62;
    const y = -14 * MM + rand(i * 4.3) * 9 * MM;

    // Lie them DOWN. The shank geometry runs along Y, so without the PI/2
    // about X every bolt stands on its head like a field of tent pegs. A
    // heap is horizontal, with the heading randomised about Y.
    const lie = Math.PI / 2 + (rand(i * 5.1) - 0.5) * 0.7;
    const spin = rand(i * 6.7) * TAU;
    const roll = (rand(i * 3.3) - 0.5) * 0.5;
    const size = (3.2 + rand(i * 8.3) * 1.6) * MM;
    const len = (18 + rand(i * 9.9) * 18) * MM;

    // Head sits at one end of the shank, displaced along the shank's own
    // direction rather than straight up.
    const dy = Math.cos(lie) * len * 0.5;
    const dz = Math.sin(lie) * len * 0.5 * Math.cos(spin);
    const dx = Math.sin(lie) * len * 0.5 * Math.sin(spin);

    setUniform(heads, i, x + dx, y + dy, z + dz, lie, spin, roll, size);
    setWire(shanks, i, x, y, z, lie, spin, roll, len, size * 0.4);
  }
  heads.count = count;
  shanks.count = count;

  return {
    meshes: [heads, shanks],
    radius: 1.0,            // capped hex normals are not radial: keep inert
    // Wide fov seen from above exaggerates the heap and separates it from
    // every other product in the set.
    pose: { fov: 48, z: 17, rot: [0.78, 0.22, 0.0] },
    motion: [2.2, 4.5, 9.0, 3.0],
  };
}

export const BUILDERS = {
  'chain-link': buildChainLink,
  'weld-mesh': buildWeldMesh,
  'barbed-wire': buildBarbedWire,
  'gi-wire': buildCoil,
  sheets: buildSheet,
  roofing: buildSheet,     // same geometry, recoloured below
  hardware: buildFasteners,
};

/* Roofing and sheets share a builder but must not share an appearance:
   one is coated colour, the other is bare galvanized plate. */
export function overridesFor(id) {
  if (id === 'sheets') {
    return { colour: '#AEB6BF', metalness: 0.85, roughness: 0.33,
             pose: { fov: 28, z: 42, rot: [0.3, -0.55, 0.03] } };
  }
  return null;
}
