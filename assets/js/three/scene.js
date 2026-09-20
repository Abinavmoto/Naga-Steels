/* ============================================================
   NAGA STEELS, Configurator scene
   ------------------------------------------------------------
   This module is loaded by dynamic import() ONLY after the tier
   check passes. A Tier 0 device never fetches these bytes, nor
   three.js itself.

   The scene is not a rotating screensaver. The camera is close and
   still; the fabric moves in response to input and to a slight
   pointer parallax, nothing else. Motion that responds reads as
   expensive; motion that loops reads as cheap.
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';
import { buildVariants, layoutInstances, countsFor, MM } from './weave.js';
import { buildEnvironment, createWireMaterial, clampRadius } from './materials.js';
import { createFrameProbe } from '../capability.js';
import { loadGsap } from '../gsap-loader.js';

const BG = 0x0d1218;

// How many diamonds to frame at the reference 2" aperture. Deliberately
// low on mobile: on-screen wire must stay >= ~2.5 CSS px or the lattice
// shimmers (moiré) on a 720p panel at DPR 1, which looks broken.
const VISIBLE_COLS = { 1: 3.6, 2: 5, 3: 6 };
const REF_APERTURE_MM = 50;

export async function createScene({ canvas, tier, apertures, initial, onDowngrade, onContextLost }) {
  const gsapMod = await loadGsap();
  const gsap = gsapMod?.gsap;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier.antialias,
    alpha: false,                 // opaque is measurably cheaper to composite
    powerPreference: tier.power,
    stencil: false,
    depth: true,
  });
  renderer.setClearColor(BG, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.32;

  const scene = new THREE.Scene();
  // Fog gives the tilted fabric real depth falloff and, more importantly,
  // dissolves the far lattice before it gets fine enough to alias.
  scene.fog = new THREE.Fog(BG, 44, 96);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 0, 52);

  /* ---- Lighting ---- */
  const env = tier.env ? buildEnvironment(renderer) : null;
  if (env) scene.environment = env;

  const key = new THREE.DirectionalLight(0xffffff, env ? 2.2 : 3.4);
  key.position.set(-6, 9, 12);
  scene.add(key);

  // Amber rim from below-right, matching the brand accent. On a metallic
  // wire this is what separates the near strands from the dark background.
  // without it the weave flattens into a grey grid.
  const rim = new THREE.DirectionalLight(0xf59e0b, env ? 1.8 : 2.6);
  rim.position.set(9, -5, -6);
  scene.add(rim);

  scene.add(new THREE.HemisphereLight(0x8fa3bd, 0x11151b, env ? 0.85 : 1.4));

  /* ---- Fabric ---- */
  const { mat, uniforms } = createWireMaterial(env);
  const variants = buildVariants(apertures, tier);

  const max = countsFor(tier.cols, tier.rows);
  const first = variants.get(initial.apertureMm) || variants.values().next().value;

  const meshA = new THREE.InstancedMesh(first.geoA, mat, max.a);
  const meshB = new THREE.InstancedMesh(first.geoB, mat, max.b);
  meshA.frustumCulled = false;
  meshB.frustumCulled = false;
  meshA.instanceMatrix.setUsage(THREE.StaticDrawUsage);
  meshB.instanceMatrix.setUsage(THREE.StaticDrawUsage);

  const group = new THREE.Group();
  group.add(meshA, meshB);
  // A slight off-axis tilt: head-on, a regular lattice reads as wallpaper.
  group.rotation.set(0.07, -0.2, 0.02);
  scene.add(group);

  let currentAperture = initial.apertureMm;

  function applyAperture(mm) {
    const v = variants.get(mm);
    if (!v) return;
    currentAperture = mm;
    meshA.geometry = v.geoA;
    meshB.geometry = v.geoB;

    // The camera is NOT re-framed per aperture. Holding it fixed is what
    // makes 1" vs 3" an honest comparison. The diamonds must visibly
    // change size on screen, because that is what the buyer is choosing.
    const visCols = VISIBLE_COLS[tier.id] ?? 6;
    const framedWidth = REF_APERTURE_MM * MM * visCols;
    const aspect = Math.max(0.6, canvas.clientWidth / Math.max(1, canvas.clientHeight));
    const framedHeight = framedWidth / aspect;

    const cols = Math.min(tier.cols, Math.ceil(framedWidth / v.pitch) + 3);
    const rows = Math.min(tier.rows, Math.ceil(framedHeight / v.rowHeight) + 2);

    layoutInstances(meshA, meshB, v, cols, rows);
  }

  function frameCamera() {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    const aspect = w / h;
    camera.aspect = aspect;

    const visCols = VISIBLE_COLS[tier.id] ?? 6;
    const framedWidth = REF_APERTURE_MM * MM * visCols;
    const vFov = (camera.fov * Math.PI) / 180;
    // Distance that fits framedWidth horizontally at this aspect ratio.
    camera.position.z = framedWidth / (2 * Math.tan(vFov / 2) * aspect);
    camera.updateProjectionMatrix();
  }

  applyAperture(initial.apertureMm);

  /* ---- Sizing --------------------------------------------------------
     On Android, `resize` fires on every URL-bar collapse/expand during a
     scroll. Undebounced, setPixelRatio reallocates the framebuffer over
     and over mid-scroll. Debounce, and ignore height-only changes under
     120 px because that is almost always just the URL bar.            */

  let lastW = 0, lastH = 0;

  function resize(force = false) {
    const w = Math.round(canvas.clientWidth);
    const h = Math.round(canvas.clientHeight);
    if (!w || !h) return;

    const widthChanged = w !== lastW;
    const heightDelta = Math.abs(h - lastH);
    if (!force && !widthChanged && heightDelta < 120) return;

    lastW = w; lastH = h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier.dpr));
    renderer.setSize(w, h, false);
    frameCamera();
    applyAperture(currentAperture);
  }

  resize(true);

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => resize(false), 150);
  };
  window.addEventListener('resize', onResize, { passive: true });

  /* ---- Pointer parallax ---- */
  const target = { x: group.rotation.x, y: group.rotation.y };
  const base = { x: 0.07, y: -0.2 };

  const onPointer = (e) => {
    const r = canvas.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
    target.y = base.y + nx * 0.22;
    target.x = base.x + ny * 0.14;
  };
  const onLeave = () => { target.x = base.x; target.y = base.y; };

  // Pointer parallax on a touch device would fight the scroll gesture.
  const fine = window.matchMedia('(pointer: fine)').matches;
  if (fine) {
    canvas.addEventListener('pointermove', onPointer, { passive: true });
    canvas.addEventListener('pointerleave', onLeave, { passive: true });
  }

  /* ---- Render loop ---------------------------------------------------
     One loop only. GSAP already owns a requestAnimationFrame, so running
     renderer.setAnimationLoop as well would mean two independent rAF
     callbacks competing every frame.                                   */

  let running = false;
  let probe = null;

  const render = () => {
    // Ease toward the parallax target rather than snapping to it.
    group.rotation.x += (target.x - group.rotation.x) * 0.06;
    group.rotation.y += (target.y - group.rotation.y) * 0.06;
    renderer.render(scene, camera);
    if (probe) probe();
  };

  const start = () => {
    if (running) return;
    running = true;
    if (gsap) gsap.ticker.add(render);
    else rafLoop();
  };
  const stop = () => {
    if (!running) return;
    running = false;
    if (gsap) gsap.ticker.remove(render);
  };

  // Fallback loop if GSAP failed to load. The configurator must still work.
  let rafId = 0;
  function rafLoop() {
    if (!running || gsap) return;
    render();
    rafId = requestAnimationFrame(rafLoop);
  }

  if (gsap) {
    gsap.ticker.fps(tier.fps);
    gsap.ticker.lagSmoothing(500, 33); // no catch-up burst after a tab switch
  }

  /* ---- Pause when not visible ---- */
  const io = new IntersectionObserver(
    ([entry]) => (entry.isIntersecting ? start() : stop()),
    { rootMargin: '100px', threshold: 0 },
  );
  io.observe(canvas);

  const onVisibility = () => {
    if (document.hidden) stop();
    else if (canvas.getBoundingClientRect().top < window.innerHeight) start();
  };
  document.addEventListener('visibilitychange', onVisibility);

  /* ---- Context loss --------------------------------------------------
     A mobile browser will drop the WebGL context whenever it is under
     memory pressure, or when a page holds more contexts than the device
     allows and the oldest gets evicted. Without this handler the canvas
     keeps its last frame and then goes black, and because the poster has
     already faded to opacity 0 the user is left staring at a black box
     with no way back. preventDefault() is what makes the loss
     recoverable; telling the caller is what puts the poster back. */

  const onLost = (e) => {
    e.preventDefault();
    stop();
    onContextLost?.();
  };
  canvas.addEventListener('webglcontextlost', onLost);

  /* ---- Teardown ---- */
  let destroyed = false;
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    stop();
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', onResize);
    document.removeEventListener('visibilitychange', onVisibility);
    canvas.removeEventListener('webglcontextlost', onLost);
    canvas.removeEventListener('pointermove', onPointer);
    canvas.removeEventListener('pointerleave', onLeave);
    variants.forEach((v) => { v.geoA.dispose(); v.geoB.dispose(); });
    mat.dispose();
    env?.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
  }

  /* ---- Live frame-time verdict ---------------------------------------
     The static signals in capability.js are priors. This is the only
     measurement that actually knows how this device performs. */

  probe = createFrameProbe({
    samples: 60,
    warmup: 10,
    onVerdict: (verdict, median) => {
      probe = null;
      if (verdict === 'hold') return;
      if (verdict === 'abort') {
        destroy();
        onDowngrade?.('abort', median);
        return;
      }
      // 'demote': shed pixels first. DPR is worth roughly an order of
      // magnitude more than instance count: a full-screen canvas at DPR 3
      // is ~9x the fragment work of the same canvas at DPR 1.
      const reduced = Math.max(1, tier.dpr - 0.5);
      if (reduced < tier.dpr) {
        tier.dpr = reduced;
        resize(true);
      }
      if (gsap) gsap.ticker.fps(30);
      onDowngrade?.('demote', median);
    },
  });

  start();

  /* ---- Public API ---- */
  return {
    setGauge(mm) {
      const r = clampRadius(mm * MM * 0.5);
      if (gsap) gsap.to(uniforms.uWireRadius, { value: r, duration: 0.45, ease: 'power2.out' });
      else uniforms.uWireRadius.value = r;
    },

    setAperture(mm) {
      applyAperture(mm);
    },

    setCoating({ hex, metalness, roughness }) {
      const to = new THREE.Color(hex);
      if (gsap) {
        // GSAP animates the Color object's r/g/b directly. None of these
        // properties touch a shader define, so there is no recompile.
        gsap.to(mat.color, { r: to.r, g: to.g, b: to.b, duration: 0.45, ease: 'power2.out' });
        gsap.to(mat, { metalness, roughness, duration: 0.45, ease: 'power2.out' });
      } else {
        mat.color.copy(to);
        mat.metalness = metalness;
        mat.roughness = roughness;
      }
    },

    destroy,
  };
}
