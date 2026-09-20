/* ============================================================
   NAGA STEELS, Wire material + procedural environment
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';

/* ---- Environment map, generated in code -------------------------------
   No .hdr download. A 64×32 DataTexture: sky gradient, warm horizon
   band, darker ground, run once through PMREMGenerator.

   The horizon band is the whole point: it is the bright linear
   reflection across the wire that makes galvanized steel read as metal.
   Without it, a metalness-0.95 material in a dark scene just looks like
   grey plastic, because there is nothing for it to reflect.           */

export function buildEnvironment(renderer) {
  const W = 64, H = 32;
  const data = new Uint8Array(W * H * 4);

  const lerp = (a, b, t) => a + (b - a) * t;

  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);          // 0 = top (sky), 1 = bottom (ground)
    let r, g, b;

    if (v < 0.45) {                  // upper sky, cool
      const t = v / 0.45;
      r = lerp(28, 74, t); g = lerp(34, 86, t); b = lerp(44, 104, t);
    } else if (v < 0.58) {           // horizon band, warm: the key light
      const t = (v - 0.45) / 0.13;
      const k = Math.sin(t * Math.PI); // brightest in the middle of the band
      r = lerp(74, 255, k); g = lerp(86, 232, k); b = lerp(104, 196, k);
    } else {                         // ground, dark
      const t = (v - 0.58) / 0.42;
      r = lerp(40, 12, t); g = lerp(38, 13, t); b = lerp(36, 15, t);
    }

    for (let x = 0; x < W; x++) {
      // A soft horizontal falloff stops the reflection being a flat band
      // and gives the wire some variation as it curves.
      const u = x / (W - 1);
      const f = 0.78 + 0.22 * Math.sin(u * Math.PI * 2 + 0.6);
      const i = (y * W + x) * 4;
      data[i]     = Math.min(255, r * f);
      data[i + 1] = Math.min(255, g * f);
      data[i + 2] = Math.min(255, b * f);
      data[i + 3] = 255;
    }
  }

  const tex = new THREE.DataTexture(data, W, H, THREE.RGBAFormat);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromEquirectangular(tex).texture;

  pmrem.dispose();
  tex.dispose();
  return env;
}

/* ---- Wire material ----------------------------------------------------
   MeshStandardMaterial, never MeshPhysicalMaterial. Tweening `clearcoat`
   up from 0 crosses the USE_CLEARCOAT define boundary, which forces a
   shader recompile mid-tween, a 100-300 ms hard freeze on a mid-range
   Android, at precisely the moment the user is dragging a control.

   The onBeforeCompile injection is the trick that makes the gauge change
   free: a tube's vertex normal IS its unit radial offset direction, and
   that direction is independent of radius. So with the geometry baked at
   radius 1.0, displacing each vertex along its own normal changes the
   wire's thickness while leaving the spine untouched.

   Cost per gauge change: one float. No rebuild, no reallocation, no GC. */

export function createWireMaterial(env) {
  const uniforms = { uWireRadius: { value: 0.1625 } }; // 3.25 mm Ø / 2

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B9BEC4'),
    metalness: 0.95,
    roughness: 0.28,
    envMap: env || null,
    envMapIntensity: 1.6,
  });

  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWireRadius = uniforms.uWireRadius;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        '#include <common>\nuniform float uWireRadius;',
      )
      .replace(
        '#include <begin_vertex>',
        'vec3 transformed = position + normal * (uWireRadius - 1.0);',
      );
  };

  // Without this, three.js treats the patched program as a separate
  // variant per material instance and compiles it more than once.
  mat.customProgramCacheKey = () => 'ns-wire';

  return { mat, uniforms };
}

/** Radius is clamped: past roughly 1.8× nominal the knuckles self-intersect
 *  and the weave visibly breaks apart. */
export function clampRadius(r, nominal = 0.1625) {
  return Math.min(Math.max(r, nominal * 0.4), nominal * 2.0);
}

/* ---- Showcase material -----------------------------------------------
   The same trick as above, carrying three more terms in one injection:

   uD        0 assembled, 1 fully dispersed
   uMotion   xyz = throw / gravity / spin, w = push into the fog
   uCorrugate  roll-forms the roofing sheet, 0 for every other product

   instanceMatrix is already declared in three.js's vertex prefix under
   USE_INSTANCING, and <begin_vertex> runs before <project_vertex>, so
   instanceMatrix[3].xyz gives a free per-instance pivot with no extra
   attribute and no extra bytes.

   The fog does the fading. scene.fog matches the clear colour exactly,
   so pieces pushed into -Z dissolve into the background with no
   transparency, no depth sorting and no second pass. Nothing here
   touches a #define, so there is no recompile mid-scroll.              */

export function createShowcaseMaterial(env) {
  const uniforms = {
    uWireRadius: { value: 1.0 },
    uD:          { value: 0.0 },
    uMotion:     { value: new THREE.Vector4(0.8, 2.4, 4.0, 6.0) },
    uCorrugate:  { value: 0.0 },
  };

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color('#B9BEC4'),
    metalness: 0.92,
    roughness: 0.3,
    envMap: env || null,
    envMapIntensity: 1.5,
  });

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);

    // FREQ and AMP must stay identical in both replacements below, or the
    // lighting will describe a different surface from the one being drawn.
    const PROFILE = `
#define CORR_FREQ 4.2
#define CORR_AMP  0.42`;

    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
uniform float uWireRadius;
uniform float uD;
uniform vec4  uMotion;
uniform float uCorrugate;
${PROFILE}

// Roll-formed profile. A clamped sine gives flat crowns and valleys with
// rounded shoulders, which is what a trapezoidal sheet actually is, rather
// than a decorative wave. The form term presses it in from left to right as
// uD falls, which is literally how the product is made.
float corrForm(float x, float d) {
  return clamp((1.0 - d) * 1.6 - (x * 0.07 + 0.45), 0.0, 1.0);
}`)

      .replace('#include <begin_vertex>', `
vec3 transformed = position + normal * (uWireRadius - 1.0);

if (uCorrugate > 0.001) {
  float f  = corrForm(position.x, uD);
  float sn = sin(position.x * CORR_FREQ);
  transformed.z += uCorrugate * f * clamp(sn * 1.7, -1.0, 1.0) * CORR_AMP;
}

#ifdef USE_INSTANCING
  vec3  ip = instanceMatrix[3].xyz;
  float h  = fract(sin(dot(ip, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float e  = uD * uD;                       // slow release, fast exit
  vec3  dir = normalize(ip + vec3(0.0, 0.0, 0.6) + (h - 0.5) * 1.7);
  transformed += dir * (e * uMotion.x);
  transformed.y -= e * e * uMotion.y;        // material falling, not a loot burst
  transformed.z -= e * uMotion.w;            // into the fog
  float a = e * (h - 0.5) * uMotion.z;
  float cs = cos(a), sn2 = sin(a);
  transformed.xy = mat2(cs, -sn2, sn2, cs) * transformed.xy;
#endif`)

      .replace('#include <beginnormal_vertex>', `
vec3 objectNormal = vec3( normal );

// Without this the corrugation is invisible: the vertices move but the
// surface still lights as a flat plane, so the sheet reads as a slab with
// a jagged edge. Analytic derivative, so no computeVertexNormals and no
// CPU work.
if (uCorrugate > 0.001) {
  float nf  = corrForm(position.x, uD);
  float nsn = sin(position.x * CORR_FREQ);
  float inr = step(abs(nsn * 1.7), 1.0);     // zero on the flat crowns
  float ddz = inr * 1.7 * CORR_FREQ * cos(position.x * CORR_FREQ) * CORR_AMP;
  objectNormal = normalize(vec3(-uCorrugate * nf * ddz, 0.0, 1.0));
}

#ifdef USE_INSTANCING
  vec3  np = instanceMatrix[3].xyz;
  float nh = fract(sin(dot(np, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
  float ne = uD * uD;
  float na = ne * (nh - 0.5) * uMotion.z;
  float nc = cos(na), ns = sin(na);
  objectNormal.xy = mat2(nc, -ns, ns, nc) * objectNormal.xy;
#endif`);
  };

  // Every material returning this key must inject BYTE-IDENTICAL source, or
  // three.js hands back the wrong compiled program with no warning.
  mat.customProgramCacheKey = () => 'ns-showcase';

  return { mat, uniforms };
}
