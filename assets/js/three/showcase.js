/* ============================================================
   NAGA STEELS, showcase scene
   ------------------------------------------------------------
   Mirrors scene.js: one renderer, one ticker, IntersectionObserver
   pause, debounced resize that ignores the Android URL bar, a full
   destroy(), and a frame probe that can give up.

   Two material slots ping-pong so the outgoing product can be
   dispersing while the incoming one assembles. Both return the same
   customProgramCacheKey, so three.js refcounts them onto a single
   compiled program and nothing recompiles mid-scroll.
   ============================================================ */

import * as THREE from '../../vendor/three.module.min.js';
import { buildEnvironment, createShowcaseMaterial } from './materials.js';
import { BUILDERS, overridesFor } from './products.js';
import { createFrameProbe } from '../capability.js';
import { loadGsap } from '../gsap-loader.js';

const BG = 0x0b0d10;
const ORDER = ['chain-link', 'weld-mesh', 'barbed-wire', 'gi-wire',
               'sheets', 'roofing', 'hardware'];

export async function createShowcaseScene({ canvas, tier, stage, initial, onGiveUp }) {
  const gsapMod = await loadGsap();
  const gsap = gsapMod?.gsap;

  // The showcase is decorative and full-bleed; the configurator is a
  // precision tool at a fraction of the size. Give the showcase one notch
  // less DPR so two live contexts do not fight for fill rate.
  const dpr = Math.max(1, (tier.dpr || 1) - 0.5);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: tier.antialias,
    alpha: false,
    powerPreference: tier.power,
    stencil: false,
  });
  renderer.setClearColor(BG, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.28;

  const scene = new THREE.Scene();
  // Fog colour MUST equal the clear colour. That identity is what lets the
  // transition fade pieces out with no transparency and no sorting.
  scene.fog = new THREE.Fog(BG, 34, 88);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
  camera.position.set(0, 0, 30);

  const env = tier.env ? buildEnvironment(renderer) : null;
  if (env) scene.environment = env;

  const key = new THREE.DirectionalLight(0xffffff, env ? 2.4 : 3.4);
  key.position.set(-6, 9, 12);
  const rim = new THREE.DirectionalLight(0xf59e0b, env ? 1.9 : 2.6);
  rim.position.set(9, -5, -6);
  // A cool fill from the opposite side. Without it, solid products (the
  // fastener heads especially) go almost black on their shadow side and the
  // only thing catching light is the amber rim.
  const fill = new THREE.DirectionalLight(0x9fb4cc, env ? 0.9 : 1.4);
  fill.position.set(4, 3, -9);
  scene.add(key, rim, fill,
            new THREE.HemisphereLight(0x8fa3bd, 0x141a22, env ? 1.0 : 1.5));

  /* ---- Two material slots ---- */
  const slotA = createShowcaseMaterial(env);
  const slotB = createShowcaseMaterial(env);
  const slots = [slotA, slotB];

  const groups = new Map();   // id -> { group, spec, slot }
  let activeId = null;
  let outgoing = null;
  let slotFlip = 0;

  function build(id, slotIndex) {
    const build0 = BUILDERS[id];
    if (!build0) return null;
    const slot = slots[slotIndex];
    const spec = build0(tier, slot.mat);
    const ov = overridesFor(id);
    if (ov) Object.assign(spec, ov);

    const group = new THREE.Group();
    spec.meshes.forEach((m) => {
      m.frustumCulled = false;
      m.instanceMatrix.setUsage(THREE.StaticDrawUsage);
      group.add(m);
    });
    group.visible = false;
    group.rotation.set(...spec.pose.rot);
    scene.add(group);
    return { group, spec, slot: slotIndex };
  }

  function applySlotLook(slotIndex, spec) {
    const { mat, uniforms } = slots[slotIndex];
    mat.color.set(spec.colour || '#B9BEC4');
    mat.metalness = spec.metalness ?? 0.92;
    mat.roughness = spec.roughness ?? 0.3;
    uniforms.uWireRadius.value = spec.radius ?? 1.0;
    uniforms.uCorrugate.value = spec.corrugate ?? 0.0;
    // The z-push has to clear the far fog plane or the product never fades.
    // Cameras sit between 17 and 44 units out depending on the product, so a
    // fixed push works for one of them and leaves the rest fully visible.
    const [thr, grav, spin, push] = spec.motion;
    uniforms.uMotion.value.set(thr, grav, spin, Math.max(push, spec.pose.z * 1.7));
  }

  /* ---- Build order: the first two now, the rest when idle ------------
     Constructing all seven synchronously is a 10-18ms long task on a
     Redmi. The user has to scroll a full viewport to reach product 2, so
     there is plenty of runway.                                          */

  const firstId = ORDER.includes(initial) ? initial : ORDER[0];
  groups.set(firstId, build(firstId, 0));

  const queue = ORDER.filter((id) => id !== firstId);
  const buildRest = () => {
    const id = queue.shift();
    if (!id) return;
    if (!groups.has(id)) groups.set(id, build(id, 1));
    if (queue.length) {
      if ('requestIdleCallback' in window) requestIdleCallback(buildRest, { timeout: 1200 });
      else setTimeout(buildRest, 60);
    }
  };

  /* ---- Warm-up --------------------------------------------------------
     compileAsync links programs but does NOT upload attribute buffers, so
     a pre-built geometry still hitches on its first real draw. Rendering
     once into a 1x1 target runs the vertex stage with near-zero fragment
     cost and uploads everything. */
  async function warmUp() {
    try {
      const all = [...groups.values()];
      all.forEach((g) => { g.group.visible = true; });
      if (renderer.compileAsync) await renderer.compileAsync(scene, camera);
      const rt = new THREE.WebGLRenderTarget(1, 1);
      renderer.setRenderTarget(rt);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      rt.dispose();
      // Restore the ACTIVE group, do not blanket-hide. Warm-up runs a moment
      // after setProduct() has already shown the first range, so hiding
      // everything here left Range 01 invisible until the user scrolled to
      // another range and back.
      const current = activeId ? groups.get(activeId) : null;
      all.forEach((g) => { g.group.visible = g === current; });
    } catch { /* warm-up is an optimisation, never a requirement */ }
  }

  /* ---- Product switching ---- */

  function setProduct(id) {
    if (id === activeId) return;
    if (!groups.has(id)) {
      const g = build(id, (slotFlip + 1) % 2);
      if (!g) return;
      groups.set(id, g);
    }
    const next = groups.get(id);
    const prev = activeId ? groups.get(activeId) : null;

    slotFlip = (slotFlip + 1) % 2;
    next.slot = slotFlip;
    next.spec.meshes.forEach((m) => { m.material = slots[slotFlip].mat; });
    applySlotLook(slotFlip, next.spec);

    next.group.visible = true;
    activeId = id;

    // Camera varies per product. Without this, four wire products from one
    // fixed camera read as a single object rearranging itself.
    const pose = next.spec.pose;

    // Fog has to track the camera. It is what fades dispersing pieces out,
    // and a fixed near/far tuned for a distant camera does nothing at all
    // once the camera moves in to 19 units: the outgoing product just sits
    // there fully lit instead of dissolving.
    const fogNear = pose.z * 0.85;
    const fogFar = pose.z * 2.4;

    if (gsap) {
      gsap.to(scene.fog, { near: fogNear, far: fogFar, duration: 0.9, ease: 'power2.inOut' });
    } else {
      scene.fog.near = fogNear; scene.fog.far = fogFar;
    }

    if (gsap) {
      gsap.to(camera, {
        fov: pose.fov, duration: 0.9, ease: 'power2.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      });
      gsap.to(camera.position, { z: pose.z, duration: 0.9, ease: 'power2.inOut' });
      gsap.to(next.group.rotation,
        { x: pose.rot[0], y: pose.rot[1], z: pose.rot[2], duration: 0.9, ease: 'power2.out' });

      gsap.fromTo(slots[slotFlip].uniforms.uD,
        { value: 1 }, { value: 0, duration: 0.85, ease: 'power2.out' });
    } else {
      camera.fov = pose.fov; camera.position.z = pose.z;
      camera.updateProjectionMatrix();
      slots[slotFlip].uniforms.uD.value = 0;
    }

    if (prev && prev !== next) {
      const outSlot = prev.slot;
      if (gsap) {
        gsap.killTweensOf(slots[outSlot].uniforms.uD);
        gsap.to(slots[outSlot].uniforms.uD, {
          value: 1, duration: 0.7, ease: 'power2.in',
          onComplete: () => {
            // Unconditionally hide, unless this group has since become the
            // active one again (a fast scroll back). An earlier version had
            // a tangle of guards here that could leave the outgoing product
            // on screen at uD=1, sitting fully assembled behind the new one.
            if (groups.get(activeId) !== prev) prev.group.visible = false;
          },
        });
      } else {
        prev.group.visible = false;
      }
    }
  }

  /* ---- Sizing ---------------------------------------------------------
     svh keeps the stage height constant while the URL bar moves, so this
     should never fire mid-scroll. The 120px guard stays as belt-and-braces. */

  let lastW = 0, lastH = 0;
  function resize(force = false) {
    const w = Math.round(canvas.clientWidth);
    const h = Math.round(canvas.clientHeight);
    if (!w || !h) return;
    if (!force && w === lastW && Math.abs(h - lastH) < 120) return;
    lastW = w; lastH = h;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize(true);

  let rt;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => resize(false), 150); };
  window.addEventListener('resize', onResize, { passive: true });

  /* ---- Pointer parallax, with decay ----------------------------------
     On a sticky full-viewport canvas the cursor is over the canvas almost
     always, so without a decay the object stays locked wherever the mouse
     happened to stop, permanently tilted. */

  const base = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let lastMove = 0;
  const fine = window.matchMedia('(pointer: fine)').matches;

  const onPointer = (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    target.x = ny * 0.1;
    target.y = nx * 0.16;
    lastMove = performance.now();
  };
  if (fine) window.addEventListener('pointermove', onPointer, { passive: true });

  /* ---- Loop ---- */

  let running = false;
  let probe = null;
  const tilt = { x: 0, y: 0 };

  const render = () => {
    if (fine && performance.now() - lastMove > 1200) {
      target.x = base.x; target.y = base.y;
    }
    tilt.x += (target.x - tilt.x) * 0.05;
    tilt.y += (target.y - tilt.y) * 0.05;
    const g = activeId ? groups.get(activeId) : null;
    if (g) {
      g.group.position.x = tilt.y * 2.2;
      g.group.position.y = -tilt.x * 2.2;
    }
    renderer.render(scene, camera);
    if (probe) probe();
  };

  let rafId = 0;
  const rafLoop = () => { if (running && !gsap) { render(); rafId = requestAnimationFrame(rafLoop); } };
  const start = () => {
    if (running) return;
    running = true;
    if (gsap) gsap.ticker.add(render); else rafLoop();
  };
  const stop = () => {
    if (!running) return;
    running = false;
    if (gsap) gsap.ticker.remove(render);
  };

  // 50% margin, not 100px. The first product needs runway to assemble
  // before the stage is on screen, and stopping mid-transition would
  // freeze a half-dispersed product until the user scrolls back.
  const io = new IntersectionObserver(
    ([e]) => (e.isIntersecting ? start() : stop()),
    { rootMargin: '50% 0px', threshold: 0 },
  );
  io.observe(stage || canvas);

  const onVis = () => { if (document.hidden) stop(); else start(); };
  document.addEventListener('visibilitychange', onVis);

  const onLost = (e) => { e.preventDefault(); stop(); onGiveUp?.(); };
  canvas.addEventListener('webglcontextlost', onLost);

  /* ---- Teardown ---- */
  let dead = false;
  function destroy() {
    if (dead) return;
    dead = true;
    stop();
    cancelAnimationFrame(rafId);
    io.disconnect();
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onPointer);
    document.removeEventListener('visibilitychange', onVis);
    canvas.removeEventListener('webglcontextlost', onLost);
    groups.forEach(({ spec }) => spec.meshes.forEach((m) => m.geometry.dispose()));
    slots.forEach((s) => s.mat.dispose());
    env?.dispose();
    renderer.dispose();
    renderer.forceContextLoss?.();
  }

  probe = createFrameProbe({
    samples: 60,
    warmup: 12,
    onVerdict: (verdict) => {
      probe = null;
      if (verdict === 'hold') return;
      if (verdict === 'abort') { destroy(); onGiveUp?.(); return;
      }
      if (gsap) gsap.ticker.fps(30);
    },
  });

  setProduct(firstId);
  if (gsap) { gsap.ticker.fps(tier.fps); gsap.ticker.lagSmoothing(500, 33); }
  start();

  // Queue the remaining products, then warm every buffer up.
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => { buildRest(); setTimeout(warmUp, 400); }, { timeout: 1500 });
  } else {
    setTimeout(() => { buildRest(); setTimeout(warmUp, 400); }, 300);
  }

  return { setProduct, destroy };
}
