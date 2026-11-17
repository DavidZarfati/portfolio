// Icone-immagine delle tecnologie che orbitano attorno alla foto, come "carte" 3D con spessore.
// Ogni icona guarda verso l'esterno: di fronte si legge, ai lati si vede di taglio, dietro passa nascosta dalla foto.
// La foto è disegnata dentro la scena, così le icone le passano davvero davanti e dietro.
import {
  AdditiveBlending,
  CanvasTexture,
  CircleGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Sprite,
  SpriteMaterial,
  Texture,
} from "three";

type Tech = { slug: string; bg: string };

// Colori ufficiali dei marchi come sfondo dell'icona (logo bianco sopra).
const TECHS: Tech[] = [
  { slug: "python", bg: "#3776AB" },
  { slug: "react", bg: "#087EA4" },
  { slug: "nextdotjs", bg: "#16181d" },
  { slug: "nodedotjs", bg: "#4d8a3f" },
  { slug: "typescript", bg: "#3178C6" },
  { slug: "supabase", bg: "#1f9e6a" },
  { slug: "claude", bg: "#C4623F" },
  { slug: "threedotjs", bg: "#16181d" },
  { slug: "selenium", bg: "#43B02A" },
  { slug: "googleanalytics", bg: "#E37400" },
];

/** Raggio esterno del sistema, in unità del rig (la scena lo scala sulle dimensioni dell'hero). */
export const RIG_OUTER = 1.9;
const ORBIT_R = 1.45;
const TILE = 0.58;
const SPEED = 0.42; // radianti al secondo
const TILT = 0.3; // inclinazione dell'orbita verso chi guarda

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(0.4, "rgba(255,255,255,0.4)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function tileTexture(img: HTMLImageElement, bg: string) {
  const S = 256;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  roundRect(g, 6, 6, S - 12, S - 12, 58);
  g.fillStyle = bg;
  g.fill();
  // riflesso morbido in alto, come un'icona lucida
  g.save();
  g.clip();
  const gl = g.createLinearGradient(0, 0, 0, S);
  gl.addColorStop(0, "rgba(255,255,255,0.32)");
  gl.addColorStop(0.5, "rgba(255,255,255,0.04)");
  gl.addColorStop(1, "rgba(0,0,0,0.22)");
  g.fillStyle = gl;
  g.fillRect(0, 0, S, S);
  g.restore();
  roundRect(g, 6, 6, S - 12, S - 12, 58);
  g.lineWidth = 6;
  g.strokeStyle = "rgba(255,255,255,0.45)";
  g.stroke();
  const L = 138;
  g.drawImage(img, (S - L) / 2, (S - L) / 2, L, L);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function photoTexture(img: HTMLImageElement) {
  const S = 512;
  const c = document.createElement("canvas");
  c.width = c.height = S;
  const g = c.getContext("2d")!;
  const m = 14;
  g.save();
  g.beginPath();
  g.arc(S / 2, S / 2, S / 2 - m, 0, Math.PI * 2);
  g.clip();
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  g.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, m, m, S - 2 * m, S - 2 * m);
  g.restore();
  g.beginPath();
  g.arc(S / 2, S / 2, S / 2 - m / 2, 0, Math.PI * 2);
  g.lineWidth = m;
  g.strokeStyle = "rgba(77,124,255,0.95)";
  g.stroke();
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

type Tile = { holder: Group; planes: Mesh<PlaneGeometry, MeshBasicMaterial>[]; glow: Sprite; phase: number; lift: number };

export function createRig() {
  const group = new Group();
  const orbit = new Group();
  group.add(orbit);
  const textures: Texture[] = [];
  const glowTex = glowTexture();
  textures.push(glowTex);
  const planeGeo = new PlaneGeometry(TILE, TILE);

  // alone dietro la foto
  const halo = new Sprite(new SpriteMaterial({ map: glowTex, color: 0x4d7cff, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.22 }));
  halo.scale.setScalar(3.0);
  halo.position.z = -0.6;
  group.add(halo);

  // foto al centro (si accende appena l'immagine è caricata)
  const photoGeo = new CircleGeometry(1, 64);
  const photoMat = new MeshBasicMaterial({ transparent: true, alphaTest: 0.02 });
  const photo = new Mesh(photoGeo, photoMat);
  photo.visible = false;
  group.add(photo);
  let photoOk = false;
  const photoReady = loadImage("/david.jpg")
    .then((img) => {
      const t = photoTexture(img);
      textures.push(t);
      photoMat.map = t;
      photoMat.needsUpdate = true;
      photo.visible = true;
      photoOk = true;
      return true;
    })
    .catch(() => false);

  // icone
  const tiles: Tile[] = TECHS.map((tech, i) => {
    const holder = new Group();
    holder.visible = false;
    const planes: Tile["planes"] = [];
    const layers = [0.035, 0.012, -0.012, -0.035];
    layers.forEach((z, k) => {
      const inner = k !== 0 && k !== layers.length - 1;
      const mat = new MeshBasicMaterial({ transparent: false, alphaTest: 0.5, side: inner ? DoubleSide : undefined });
      const m = new Mesh(planeGeo, mat);
      m.position.z = z;
      if (k === 0) m.rotation.y = 0;
      if (k === layers.length - 1) m.rotation.y = Math.PI; // il retro è leggibile, non speculare
      holder.add(m);
      planes.push(m);
    });
    const glow = new Sprite(new SpriteMaterial({ map: glowTex, color: 0x6f9bff, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0 }));
    glow.scale.setScalar(TILE * 2.1);
    holder.add(glow);
    orbit.add(holder);
    const tile: Tile = { holder, planes, glow, phase: (i / TECHS.length) * Math.PI * 2, lift: Math.sin(i * 1.9) * 0.3 };
    loadImage(`/tech/${tech.slug}.svg`)
      .then((img) => {
        const t = tileTexture(img, tech.bg);
        textures.push(t);
        planes.forEach((p, k) => {
          p.material.map = t;
          const inner = k !== 0 && k !== planes.length - 1;
          p.material.color.setScalar(inner ? 0.42 : 1);
          p.material.needsUpdate = true;
        });
        holder.visible = true;
      })
      .catch(() => {});
    return tile;
  });

  const MAX_FRONT = ORBIT_R;

  /**
   * t: secondi; tiltX/tiltY: puntatore (-1..1); alpha: visibilità delle icone;
   * photoFrac: diametro della foto come frazione del riquadro dell'hero.
   */
  function update(t: number, tiltX: number, tiltY: number, alpha: number, photoFrac: number) {
    group.visible = true;
    group.rotation.y = tiltX * 0.18;
    group.rotation.x = -tiltY * 0.1;
    orbit.rotation.x = TILT;
    orbit.visible = alpha > 0.01;
    halo.material.opacity = 0.22 * alpha * (0.88 + 0.12 * Math.sin(t * 1.4));
    photo.scale.setScalar(Math.max(0.05, photoFrac * RIG_OUTER));
    if (!orbit.visible) return;

    for (const tile of tiles) {
      const a = tile.phase + t * SPEED;
      const x = Math.cos(a) * ORBIT_R;
      const z = Math.sin(a) * ORBIT_R;
      tile.holder.position.set(x, tile.lift + Math.sin(t * 1.1 + tile.phase * 2) * 0.07, z);
      tile.holder.rotation.y = Math.PI / 2 - a;
      // davanti = 1, dietro = 0: le icone lontane sono più scure e sfumano
      const front = smooth(-MAX_FRONT, MAX_FRONT, z);
      const lum = 0.5 + 0.5 * front;
      tile.planes.forEach((p, k) => {
        const inner = k !== 0 && k !== tile.planes.length - 1;
        p.material.color.setScalar((inner ? 0.42 : 1) * lum);
      });
      tile.glow.material.opacity = alpha * (0.1 + 0.32 * front);
      tile.holder.scale.setScalar(0.86 + 0.22 * front);
    }
  }

  function dispose() {
    group.traverse((o) => {
      const m = o as unknown as { geometry?: { dispose(): void }; material?: { dispose(): void } | { dispose(): void }[] };
      m.geometry?.dispose();
      if (Array.isArray(m.material)) m.material.forEach((x) => x.dispose());
      else m.material?.dispose();
    });
    for (const tx of textures) tx.dispose();
  }

  return { group, update, dispose, photoReady, hasPhoto: () => photoOk };
}
