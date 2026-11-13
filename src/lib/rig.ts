// Anelli inclinati con le tue tecnologie che orbitano attorno al centro (dove sta la foto).
// Tutto in 3D vero: gli anelli passano davanti e dietro, le etichette sfumano con la profondità.
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  DynamicDrawUsage,
  Float32BufferAttribute,
  Group,
  LineBasicMaterial,
  LineLoop,
  Points,
  PointsMaterial,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
  Vector3,
} from "three";

const SKILLS = ["Python", "React", "Next.js", "Node.js", "TypeScript", "Supabase", "Claude API", "MCP", "Three.js", "SEO", "GA4", "Selenium"];

const RINGS = [
  { r: 1.0, tx: 1.1, tz: 0.25, speed: 0.2 },
  { r: 1.32, tx: -0.55, tz: 0.9, speed: -0.15 },
  { r: 1.62, tx: 0.25, tz: -1.05, speed: 0.11 },
];

/** Raggio esterno del sistema (anello più grande + metà etichetta), in unità del rig. */
export const RIG_OUTER = 2.0;
const RING_MAX = 1.62;

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function dotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.35, "rgba(255,255,255,0.55)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function labelTexture(text: string, font: string) {
  const W = 360;
  const H = 96;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const r = 44;
  g.beginPath();
  g.moveTo(4 + r, 4);
  g.lineTo(W - 4 - r, 4);
  g.arc(W - 4 - r, 4 + r, r, -Math.PI / 2, Math.PI / 2);
  g.lineTo(4 + r, H - 4);
  g.arc(4 + r, 4 + r, r, Math.PI / 2, (Math.PI * 3) / 2);
  g.closePath();
  g.fillStyle = "rgba(10,11,10,0.82)";
  g.fill();
  g.strokeStyle = "rgba(198,255,61,0.6)";
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = "#ecebe4";
  g.font = `500 38px ${font}`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText(text, W / 2, H / 2 + 2);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

type Fade = { m: { opacity: number }; base: number };
type Ring = { spin: Group; sats: Points; satAttr: BufferAttribute; speed: number; radius: number; labels: Sprite[] };

export function createRig(font: string) {
  const group = new Group();
  const dot = dotTexture();
  const textures: Texture[] = [dot];
  const fades: Fade[] = [];

  // alone luminoso dietro la foto
  const halo = new Sprite(new SpriteMaterial({ map: dot, color: 0xc6ff3d, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }));
  halo.scale.setScalar(3.4);
  fades.push({ m: halo.material, base: 0.2 });
  group.add(halo);

  const perRing = SKILLS.length / RINGS.length;
  const rings: Ring[] = RINGS.map((cfg, ri) => {
    const tilt = new Group();
    tilt.rotation.set(cfg.tx, 0, cfg.tz);
    const spin = new Group();
    tilt.add(spin);

    // circonferenza sottile
    const seg = 160;
    const arr = new Float32Array(seg * 3);
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      arr[i * 3] = Math.cos(a) * cfg.r;
      arr[i * 3 + 2] = Math.sin(a) * cfg.r;
    }
    const lineGeo = new BufferGeometry();
    lineGeo.setAttribute("position", new Float32BufferAttribute(arr, 3));
    const lineMat = new LineBasicMaterial({ color: 0xc6ff3d, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false });
    fades.push({ m: lineMat, base: 0.45 });
    spin.add(new LineLoop(lineGeo, lineMat));

    // puntini lungo l'anello
    const nDots = 96;
    const darr = new Float32Array(nDots * 3);
    for (let i = 0; i < nDots; i++) {
      const a = (i / nDots) * Math.PI * 2;
      darr[i * 3] = Math.cos(a) * cfg.r;
      darr[i * 3 + 2] = Math.sin(a) * cfg.r;
    }
    const dotGeo = new BufferGeometry();
    dotGeo.setAttribute("position", new Float32BufferAttribute(darr, 3));
    const dotMat = new PointsMaterial({ size: 0.04, map: dot, color: 0xecebe4, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 });
    fades.push({ m: dotMat, base: 0.55 });
    spin.add(new Points(dotGeo, dotMat));

    // due "satelliti" luminosi che scorrono sull'anello (impulsi di dati)
    const satGeo = new BufferGeometry();
    const satAttr = new Float32BufferAttribute(new Float32Array(2 * 3), 3);
    satAttr.setUsage(DynamicDrawUsage);
    satGeo.setAttribute("position", satAttr);
    const satMat = new PointsMaterial({ size: 0.17, map: dot, color: 0xc6ff3d, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 });
    fades.push({ m: satMat, base: 1 });
    const sats = new Points(satGeo, satMat);
    sats.frustumCulled = false;
    spin.add(sats);

    // etichette delle tecnologie
    const labels: Sprite[] = [];
    for (let k = 0; k < perRing; k++) {
      const tex = labelTexture(SKILLS[ri * perRing + k], font);
      textures.push(tex);
      const sp = new Sprite(new SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
      sp.scale.set(0.78, 0.208, 1);
      const a = (k / perRing) * Math.PI * 2 + ri * 0.7;
      sp.position.set(Math.cos(a) * cfg.r, 0, Math.sin(a) * cfg.r);
      spin.add(sp);
      labels.push(sp);
    }

    group.add(tilt);
    return { spin, sats, satAttr, speed: cfg.speed, radius: cfg.r, labels };
  });

  const wp = new Vector3();
  const center = new Vector3();

  function update(t: number, tiltX: number, tiltY: number, alpha: number) {
    group.visible = alpha > 0.01;
    if (!group.visible) return;

    group.rotation.y = t * 0.1 + tiltX * 0.45;
    group.rotation.x = tiltY * 0.3 + Math.sin(t * 0.5) * 0.04;
    halo.material.opacity = 0.2 * alpha * (0.85 + 0.15 * Math.sin(t * 1.4));

    for (const r of rings) {
      r.spin.rotation.y = t * r.speed;
      // impulsi: due punti che scorrono a velocità diversa
      const dir = r.speed > 0 ? 1 : -1;
      for (let i = 0; i < 2; i++) {
        const a = t * (0.9 + r.radius * 0.5) * dir + i * Math.PI;
        r.satAttr.setXYZ(i, Math.cos(a) * r.radius, 0, Math.sin(a) * r.radius);
      }
      r.satAttr.needsUpdate = true;
    }

    for (const f of fades) if (f.m !== halo.material) f.m.opacity = f.base * alpha;

    // le etichette dietro sono più deboli, quelle davanti più nitide
    group.updateMatrixWorld(true);
    group.getWorldPosition(center);
    const scale = Math.max(1e-4, group.scale.x * RING_MAX);
    for (const r of rings) {
      for (const sp of r.labels) {
        sp.getWorldPosition(wp);
        const zn = (wp.z - center.z) / scale;
        sp.material.opacity = alpha * (0.22 + 0.78 * smooth(-0.85, 0.85, zn));
      }
    }
  }

  function dispose() {
    group.traverse((o) => {
      const m = o as unknown as { geometry?: BufferGeometry; material?: { dispose(): void } };
      m.geometry?.dispose();
      m.material?.dispose();
    });
    for (const t of textures) t.dispose();
  }

  return { group, update, dispose };
}
