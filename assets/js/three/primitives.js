/* ============================================================
   NAGA STEELS, shared unit primitives
   ------------------------------------------------------------
   One cylinder, one sphere, one torus, built once per tier and
   shared by every product in the showcase.

   All three are chosen because their vertex normals are exactly
   unit radial vectors. That is what lets the existing uWireRadius
   displacement in materials.js work unchanged on straight wire,
   on weld beads and on coil wraps, not just on TubeGeometry.

   HARD CONSTRAINT: instance matrices must keep X and Z scale at 1
   and vary only Y (length). The radial displacement happens before
   instanceMatrix is applied, so a non-uniform XZ scale would make
   the wire gauge vary from instance to instance.
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';

const cache = new Map();

function memo(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

/** Open-ended cylinder of radius 1, length 1, centred on the origin,
 *  axis along Y. Open-ended is mandatory: end caps have normals pointing
 *  along the axis, and those vertices would shoot off sideways under the
 *  radial displacement instead of staying on the tube. */
export const unitWire = (radial) =>
  memo(`wire${radial}`, () =>
    new THREE.CylinderGeometry(1, 1, 1, radial, 1, true));

/** Sphere of radius 1. Used for weld beads, which then scale with the
 *  gauge automatically, which is physically what happens. */
export const unitNode = (radial) =>
  memo(`node${radial}`, () =>
    new THREE.SphereGeometry(1, radial, Math.max(3, Math.ceil(radial / 2))));

/** Torus with tube radius 1. One wrap of a wire coil. */
export const unitRing = (ringRadius, radial, tubular) =>
  memo(`ring${ringRadius}:${radial}:${tubular}`, () =>
    new THREE.TorusGeometry(ringRadius, 1, radial, tubular));

/** Tapered open cylinder, for barbs and nail points. */
export const unitSpike = (tipRatio, radial) =>
  memo(`spike${tipRatio}:${radial}`, () =>
    new THREE.CylinderGeometry(tipRatio, 1, 1, radial, 1, true));

/** Hex prism. Six radial segments on a cylinder IS a hexagonal prism,
 *  so there is no reason to build one by hand. Capped, because a bolt
 *  head with a hole through it looks broken. */
export const unitHex = () =>
  memo('hex', () => new THREE.CylinderGeometry(1, 1, 1, 6, 1, false));

export function disposePrimitives() {
  cache.forEach((g) => g.dispose());
  cache.clear();
}

/* ---- Instance helpers -------------------------------------------------
   Every product builds its instance matrices through these, so the
   "never scale X or Z" rule lives in one place instead of six.        */

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();

/** Place a wire segment: position, Euler rotation, and a length along Y. */
export function setWire(mesh, i, x, y, z, rx, ry, rz, length, radiusScale = 1) {
  _p.set(x, y, z);
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _s.set(radiusScale, length, radiusScale);
  _m.compose(_p, _q, _s);
  mesh.setMatrixAt(i, _m);
}

/** Uniform-scale placement, for beads, spikes and fasteners. */
export function setUniform(mesh, i, x, y, z, rx, ry, rz, scale) {
  _p.set(x, y, z);
  _e.set(rx, ry, rz);
  _q.setFromEuler(_e);
  _s.set(scale, scale, scale);
  _m.compose(_p, _q, _s);
  mesh.setMatrixAt(i, _m);
}

/** Deterministic pseudo-random in [0,1). Seeded so a reload produces the
 *  identical scatter: a heap of bolts that rearranges itself on every
 *  visit reads as a bug, not as variety. */
export function rand(seed) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}
