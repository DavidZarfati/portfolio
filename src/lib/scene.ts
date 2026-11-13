// Scena Three.js: UNA nuvola di punti che cambia forma con lo scroll.
//   0 rumore  ->  1 rete (AI)  ->  2 grafico in crescita (marketing)  ->  3 globo (stack/contatti)
// Un solo contesto WebGL, una sola draw call. Caricata dopo il contenuto (import dinamico) per non pesare su LCP e SEO.
import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";

export type SceneOptions = { count: number; reduced: boolean; maxDpr: number };
export type SceneState = { progress: number; offsetX: number; scroll: number };
export type SceneApi = {
  update(state: SceneState): void;
  pointer(nx: number, ny: number): void;
  resize(): void;
  dispose(): void;
};

// ---------- utilità ----------
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gauss(r: () => number) {
  const u = Math.max(r(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

function inSphere(r: () => number, radius: number, out: number[]) {
  const u = r() * 2 - 1;
  const th = r() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  const rad = radius * Math.cbrt(r());
  out[0] = rad * s * Math.cos(th);
  out[1] = rad * u;
  out[2] = rad * s * Math.sin(th);
}

// ---------- le quattro forme ----------
function shapeNoise(n: number, r: () => number) {
  const a = new Float32Array(n * 3);
  const p = [0, 0, 0];
  for (let i = 0; i < n; i++) {
    inSphere(r, 8, p);
    a[i * 3] = p[0] * 1.15;
    a[i * 3 + 1] = p[1] * 0.85;
    a[i * 3 + 2] = p[2] * 0.7;
  }
  return a;
}

function shapeNetwork(n: number, r: () => number) {
  const hubs: Vector3[] = [];
  const tmp = [0, 0, 0];
  let guard = 0;
  while (hubs.length < 42 && guard++ < 4000) {
    inSphere(r, 4.4, tmp);
    const v = new Vector3(tmp[0], tmp[1] * 0.9, tmp[2]);
    if (hubs.every((h) => h.distanceTo(v) > 1.15)) hubs.push(v);
  }
  const edges: [Vector3, Vector3][] = [];
  for (const h of hubs) {
    const near = hubs
      .filter((o) => o !== h)
      .sort((x, y) => x.distanceTo(h) - y.distanceTo(h))
      .slice(0, 3);
    for (const o of near) edges.push([h, o]);
  }
  const a = new Float32Array(n * 3);
  const hubN = Math.floor(n * 0.3);
  const edgeN = Math.floor(n * 0.58);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < hubN) {
      const h = hubs[Math.floor(r() * hubs.length)];
      x = h.x + gauss(r) * 0.16;
      y = h.y + gauss(r) * 0.16;
      z = h.z + gauss(r) * 0.16;
    } else if (i < hubN + edgeN) {
      const [p, q] = edges[Math.floor(r() * edges.length)];
      const t = r();
      x = p.x + (q.x - p.x) * t + gauss(r) * 0.025;
      y = p.y + (q.y - p.y) * t + gauss(r) * 0.025;
      z = p.z + (q.z - p.z) * t + gauss(r) * 0.025;
    } else {
      inSphere(r, 5.4, tmp);
      [x, y, z] = tmp;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function shapeChart(n: number, r: () => number) {
  const bars = 10;
  const base = -2.6;
  const heights = Array.from({ length: bars }, (_, i) => 0.7 + i * 0.36 + Math.sin(i * 1.7) * 0.3);
  const xAt = (i: number) => -4.5 + i * 1.0;
  const a = new Float32Array(n * 3);
  const barN = Math.floor(n * 0.54);
  const lineN = Math.floor(n * 0.3);
  const arrowN = Math.floor(n * 0.03);
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < barN) {
      const b = Math.floor(r() * bars);
      x = xAt(b) + (r() - 0.5) * 0.55;
      y = base + r() * heights[b];
      z = (r() - 0.5) * 0.7;
    } else if (i < barN + lineN) {
      // linea di tendenza che segue la cima delle barre
      const t = r() * (bars - 1);
      const k = Math.floor(t);
      const f = t - k;
      const y0 = base + heights[k] + 0.45;
      const y1 = base + heights[Math.min(k + 1, bars - 1)] + 0.45;
      x = xAt(k) + f;
      y = y0 + (y1 - y0) * f + gauss(r) * 0.02;
      z = gauss(r) * 0.03;
    } else if (i < barN + lineN + arrowN) {
      // punta di freccia in cima alla linea
      const tipX = xAt(bars - 1) + 0.7;
      const tipY = base + heights[bars - 1] + 0.95;
      const s = r();
      const t = r();
      x = tipX - (s + t * 0.2) * 0.55;
      y = tipY - (s * 0.5 + (t - 0.5) * 0.55) * 0.9;
      z = 0;
    } else {
      // assi
      if (r() < 0.5) {
        x = -5.2 + r() * 10.4;
        y = base - 0.02;
      } else {
        x = -5.2;
        y = base + r() * 5.2;
      }
      z = gauss(r) * 0.02;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

function shapeGlobe(n: number, r: () => number) {
  const a = new Float32Array(n * 3);
  const sphereN = Math.floor(n * 0.82);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rings = [
    { rad: 4.7, tx: 1.15, tz: 0.2 },
    { rad: 5.3, tx: -0.55, tz: 0.9 },
    { rad: 4.1, tx: 0.2, tz: -1.1 },
  ];
  for (let i = 0; i < n; i++) {
    let x: number, y: number, z: number;
    if (i < sphereN) {
      const k = i / sphereN;
      y = 1 - 2 * k;
      const rad = Math.sqrt(1 - y * y);
      const th = golden * i;
      x = Math.cos(th) * rad * 3.5;
      z = Math.sin(th) * rad * 3.5;
      y *= 3.5;
    } else {
      const ring = rings[i % rings.length];
      const th = r() * Math.PI * 2;
      let rx = Math.cos(th) * ring.rad;
      let ry = 0;
      let rz = Math.sin(th) * ring.rad;
      // inclina l'anello
      const cy = Math.cos(ring.tx);
      const sy = Math.sin(ring.tx);
      [ry, rz] = [ry * cy - rz * sy, ry * sy + rz * cy];
      const cz = Math.cos(ring.tz);
      const sz = Math.sin(ring.tz);
      [rx, ry] = [rx * cz - ry * sz, rx * sz + ry * cz];
      x = rx + gauss(r) * 0.02;
      y = ry + gauss(r) * 0.02;
      z = rz + gauss(r) * 0.02;
    }
    a[i * 3] = x;
    a[i * 3 + 1] = y;
    a[i * 3 + 2] = z;
  }
  return a;
}

// ---------- shader ----------
const vertexShader = /* glsl */ `
  attribute vec3 aP1;
  attribute vec3 aP2;
  attribute vec3 aP3;
  attribute vec4 aR;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2 uPointer;
  uniform float uPixelRatio;
  varying float vAlpha;
  varying float vTint;

  void main() {
    // Ogni punto parte con un piccolo ritardo diverso: la trasformazione è organica, non rigida.
    float pr = clamp(uProgress + (aR.x - 0.5) * 0.45, 0.0, 2.999);
    float i = floor(pr);
    float f = pr - i;
    float e = f * f * (3.0 - 2.0 * f);

    vec3 a = position;
    vec3 b = aP1;
    if (i > 0.5) { a = aP1; b = aP2; }
    if (i > 1.5) { a = aP2; b = aP3; }
    vec3 p = mix(a, b, e);

    float turb = sin(3.14159265 * f);
    float calm = 1.0 - smoothstep(0.0, 1.0, uProgress);
    float t = uTime * (0.25 + aR.y * 0.25) + aR.z * 6.2831853;
    vec3 drift = vec3(sin(t + p.y * 0.6), cos(t * 1.1 + p.x * 0.5), sin(t * 0.9 + p.z * 0.7));
    p += drift * (0.045 + 0.55 * calm + 0.8 * turb * aR.y);

    // il mouse respinge i punti vicini
    vec2 d = p.xy - uPointer;
    float dist = length(d);
    p.xy += normalize(d + vec2(0.0001)) * smoothstep(2.8, 0.0, dist) * 0.95;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (1.25 + aR.y * 2.1) * uPixelRatio * (30.0 / -mv.z);

    vAlpha = (0.6 + 0.4 * aR.y) * clamp(1.4 - (-mv.z - 8.0) / 11.0, 0.4, 1.0);
    vTint = aR.w;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColA;
  uniform vec3 uColB;
  uniform vec3 uColC;
  varying float vAlpha;
  varying float vTint;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.04, d);
    if (a < 0.01) discard;
    vec3 col = mix(uColA, uColB, smoothstep(0.55, 1.0, vTint));
    col = mix(col, uColC, step(0.97, vTint));
    gl_FragColor = vec4(col, a * vAlpha);
  }
`;

// ---------- API ----------
export function createScene(canvas: HTMLCanvasElement, opts: SceneOptions): SceneApi {
  const renderer = new WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);

  const r = rng(20261113);
  const n = opts.count;
  const s0 = shapeNoise(n, r);
  const s1 = shapeNetwork(n, r);
  const s2 = shapeChart(n, r);
  const s3 = shapeGlobe(n, r);
  const rand = new Float32Array(n * 4);
  for (let i = 0; i < n * 4; i++) rand[i] = r();

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(s0, 3));
  geometry.setAttribute("aP1", new Float32BufferAttribute(s1, 3));
  geometry.setAttribute("aP2", new Float32BufferAttribute(s2, 3));
  geometry.setAttribute("aP3", new Float32BufferAttribute(s3, 3));
  geometry.setAttribute("aR", new Float32BufferAttribute(rand, 4));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: 0 },
    uPointer: { value: new Vector2(99, 99) },
    uPixelRatio: { value: 1 },
    // colori sRGB "grezzi": acido (accento), carta, arancio segnale
    uColA: { value: new Vector3(0.776, 1.0, 0.239) },
    uColB: { value: new Vector3(0.925, 0.922, 0.894) },
    uColC: { value: new Vector3(1.0, 0.353, 0.122) },
  };

  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });

  const points = new Points(geometry, material);
  points.frustumCulled = false;
  scene.add(points);

  // stato corrente (smussato) e di destinazione
  const cur = { progress: 0, offsetX: 0, scroll: 0 };
  const target = { progress: 0, offsetX: 0, scroll: 0 };
  const ptr = { x: 99, y: 99 };
  const ptrTarget = { x: 99, y: 99 };
  let halfW = 8;
  let halfH = 5;
  let aspect = 1;
  let raf = 0;
  let disposed = false;

  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    aspect = w / h;
    uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, opts.maxDpr);
    renderer.setPixelRatio(uniforms.uPixelRatio.value);
    renderer.setSize(w, h, false);
    camera.aspect = aspect;
    camera.position.z = aspect < 1 ? 12 + (1 - aspect) * 9 : 12;
    camera.updateProjectionMatrix();
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    halfH = halfHeight;
    halfW = halfHeight * aspect;
    schedule();
  }

  function frame(now: number) {
    raf = 0;
    if (disposed) return;
    if (document.hidden) {
      schedule();
      return;
    }
    const k = opts.reduced ? 1 : 0.07;
    cur.progress += (target.progress - cur.progress) * k;
    cur.offsetX += (target.offsetX - cur.offsetX) * k;
    cur.scroll += (target.scroll - cur.scroll) * k;
    ptr.x += (ptrTarget.x - ptr.x) * 0.15;
    ptr.y += (ptrTarget.y - ptr.y) * 0.15;

    uniforms.uProgress.value = cur.progress;
    uniforms.uTime.value = opts.reduced ? 0 : now / 1000;

    const narrow = aspect < 0.9;
    points.position.x = narrow ? 0 : cur.offsetX;
    points.scale.setScalar(narrow ? 0.82 : 1);
    points.rotation.y = cur.scroll * 0.55 + (opts.reduced ? 0 : Math.sin(now / 9000) * 0.12);
    points.rotation.x = Math.sin(cur.scroll * 0.9) * 0.12;

    // posizione del mouse nello spazio dell'oggetto (z = 0)
    uniforms.uPointer.value.set(ptr.x * halfW - points.position.x, ptr.y * halfH - points.position.y);

    renderer.render(scene, camera);

    const converging =
      Math.abs(target.progress - cur.progress) > 0.0008 ||
      Math.abs(target.offsetX - cur.offsetX) > 0.002 ||
      Math.abs(target.scroll - cur.scroll) > 0.0008 ||
      Math.abs(ptrTarget.x - ptr.x) > 0.001 ||
      Math.abs(ptrTarget.y - ptr.y) > 0.001;
    if (!opts.reduced || converging) schedule();
  }

  function schedule() {
    if (!raf && !disposed) raf = requestAnimationFrame(frame);
  }

  const onLost = (e: Event) => {
    e.preventDefault();
    canvas.style.display = "none";
  };
  canvas.addEventListener("webglcontextlost", onLost);

  resize();
  schedule();

  return {
    update(s) {
      target.progress = s.progress;
      target.offsetX = s.offsetX;
      target.scroll = s.scroll;
      schedule();
    },
    pointer(nx, ny) {
      ptrTarget.x = nx;
      ptrTarget.y = ny;
      schedule();
    },
    resize,
    dispose() {
      disposed = true;
      if (raf) cancelAnimationFrame(raf);
      canvas.removeEventListener("webglcontextlost", onLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
