"use client";

import { useEffect } from "react";
import type { SceneApi } from "@/lib/scene";

type Anchor = { el: HTMLElement; progress: number; dim: number; x: number };

const smooth = (a: number, b: number, v: number) => {
  const t = Math.min(1, Math.max(0, (v - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export default function Effects() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const root = document.documentElement;
    const cleanups: Array<() => void> = [];
    let api: SceneApi | null = null;
    let disposed = false;

    // 0) Il nome si "decifra": parte da caratteri casuali e si compone da sinistra a destra.
    if (!reduced) {
      const GLYPHS = "01<>/{}[]#$%&@ABCDEFXYZ";
      const scramble = (len: number) => Array.from({ length: len }, () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]).join("");
      document.querySelectorAll<HTMLElement>("[data-decipher]").forEach((el, idx) => {
        const final = (el.dataset.final ??= el.textContent ?? "");
        const begin = performance.now() + 120 + idx * 140;
        const dur = 700 + final.length * 70;
        let timer: ReturnType<typeof setTimeout> | undefined;
        el.textContent = scramble(final.length);
        // Con i timer (non con requestAnimationFrame) il testo finale torna sempre, anche se la scheda è in background o a un crawler.
        const step = () => {
          const t = (performance.now() - begin) / dur;
          if (t >= 1) {
            el.textContent = final;
            return;
          }
          const done = Math.max(0, Math.floor(t * final.length));
          el.textContent = final.slice(0, done) + scramble(final.length - done);
          timer = setTimeout(step, 45);
        };
        timer = setTimeout(step, 45);
        const hard = setTimeout(() => (el.textContent = final), dur + 600 + idx * 140);
        cleanups.push(() => {
          clearTimeout(timer);
          clearTimeout(hard);
          el.textContent = final;
        });
      });
    }

    // 1) Comparsa degli elementi con lo scroll. Se JS non parte, tutto resta visibile.
    if (!reduced && "IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add("is-in");
              io.unobserve(e.target);
            }
          }
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.06 },
      );
      for (const el of document.querySelectorAll<HTMLElement>("[data-reveal]")) {
        if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
          el.classList.add("pre");
          io.observe(el);
        }
      }
      cleanups.push(() => io.disconnect());
    }

    // 2) Voce di menu attiva
    const links = new Map<string, HTMLAnchorElement>();
    for (const a of document.querySelectorAll<HTMLAnchorElement>('nav[aria-label] a[href^="#"]')) links.set(a.hash.slice(1), a);
    if ("IntersectionObserver" in window && links.size) {
      const spy = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (!e.isIntersecting) continue;
            for (const [id, a] of links) {
              if (id === e.target.id) a.setAttribute("aria-current", "true");
              else a.removeAttribute("aria-current");
            }
          }
        },
        { rootMargin: "-45% 0px -50% 0px" },
      );
      for (const id of links.keys()) {
        const sec = document.getElementById(id);
        if (sec) spy.observe(sec);
      }
      cleanups.push(() => spy.disconnect());
    }

    // 3) Scena 3D: ogni sezione indica "forma", "luminosità" e "spostamento" della nuvola di punti
    const anchors: Anchor[] = Array.from(document.querySelectorAll<HTMLElement>("[data-scene]")).map((el) => ({
      el,
      progress: parseFloat(el.dataset.scene ?? "0"),
      dim: parseFloat(el.dataset.dim ?? "1"),
      x: parseFloat(el.dataset.x ?? "0"),
    }));
    const readout = document.getElementById("signal-value");
    const stage = document.getElementById("hero-stage");
    const photoEl = stage?.querySelector<HTMLElement>(".hero-photo") ?? null;
    let ticking = false;

    // Barra di avanzamento e contatore di sezione (HUD)
    const sections = Array.from(document.querySelectorAll<HTMLElement>("main > section"));
    const hudText = document.getElementById("hud-text");
    const pad = (v: number) => String(v).padStart(2, "0");
    const names = sections.map((sec) => {
      const l = sec.querySelector(".label")?.textContent ?? "";
      return l.replace(/^\d+\s*[—-]\s*/, "").trim() || (document.documentElement.lang === "it" ? "Inizio" : "Start");
    });
    let hudIdx = -1;
    function hud() {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      root.style.setProperty("--p", Math.min(1, window.scrollY / maxScroll).toFixed(4));
      let k = 0;
      for (let i = 0; i < sections.length; i++) if (sections[i].getBoundingClientRect().top <= window.innerHeight * 0.45) k = i;
      if (k !== hudIdx && hudText && sections.length) {
        hudIdx = k;
        hudText.textContent = `${pad(k + 1)} / ${pad(sections.length)} · ${names[k]}`;
      }
    }

    function compute() {
      ticking = false;
      hud();
      if (!anchors.length) return;
      const y = window.scrollY + window.innerHeight * 0.5;
      const centers = anchors.map((a) => {
        const r = a.el.getBoundingClientRect();
        return window.scrollY + r.top + r.height / 2;
      });
      let k = 0;
      while (k < anchors.length - 1 && y > centers[k + 1]) k++;
      const a = anchors[k];
      const b = anchors[Math.min(k + 1, anchors.length - 1)];
      const span = Math.max(1, centers[Math.min(k + 1, anchors.length - 1)] - centers[k]);
      const t = k === anchors.length - 1 ? 0 : smooth(0.2, 0.8, (y - centers[k]) / span);
      const progress = a.progress + (b.progress - a.progress) * t;
      const dim = a.dim + (b.dim - a.dim) * t;
      const x = a.x + (b.x - a.x) * t;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);

      root.style.setProperty("--scene-dim", dim.toFixed(3));
      if (readout) readout.textContent = `${Math.round((progress / 3) * 100)}%`;
      api?.update({ progress, offsetX: x, scroll: window.scrollY / max });
      // posizione della foto nell'hero: gli anelli 3D la seguono mentre scorri
      if (stage) {
        const r = stage.getBoundingClientRect();
        const size = Math.min(r.width, r.height);
        const pr = photoEl?.getBoundingClientRect();
        api?.hero({ cx: r.left + r.width / 2, cy: r.top + r.height / 2, size, photo: pr && size > 0 ? pr.width / size : undefined });
      }
    }

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(compute);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    cleanups.push(() => window.removeEventListener("scroll", onScroll));

    const onResize = () => {
      api?.resize();
      onScroll();
    };
    window.addEventListener("resize", onResize);
    cleanups.push(() => window.removeEventListener("resize", onResize));

    if (finePointer && !reduced) {
      const onMove = (e: PointerEvent) =>
        api?.pointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1));
      const onLeave = () => api?.pointer(99, 99);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      cleanups.push(() => {
        window.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerleave", onLeave);
      });
    }

    // Card inclinate verso il mouse, pulsanti "magnetici" e onda luminosa al clic
    if (finePointer && !reduced) {
      let tilted: HTMLElement | null = null;
      const resetTilt = (el: HTMLElement | null) => {
        if (!el) return;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      };
      const magnets = Array.from(document.querySelectorAll<HTMLElement>(".cta .btn, .mega a"));
      const onTilt = (e: PointerEvent) => {
        const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".project-link, .row") ?? null;
        if (el !== tilted) {
          resetTilt(tilted);
          tilted = el;
        }
        if (el) {
          const r = el.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          el.style.setProperty("--rx", `${(-py * 7).toFixed(2)}deg`);
          el.style.setProperty("--ry", `${(px * 9).toFixed(2)}deg`);
        }
        for (const m of magnets) {
          const r = m.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const reach = Math.max(r.width, r.height) * 0.8 + 40;
          const dist = Math.hypot(dx, dy);
          if (dist < reach) {
            const k = 0.18 * (1 - dist / reach) + 0.06;
            const cl = (v: number) => Math.max(-14, Math.min(14, v));
            m.style.setProperty("--tx", `${cl(dx * k).toFixed(1)}px`);
            m.style.setProperty("--ty", `${cl(dy * k).toFixed(1)}px`);
          } else {
            m.style.removeProperty("--tx");
            m.style.removeProperty("--ty");
          }
        }
      };
      const onDown = (e: PointerEvent) => {
        const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn");
        if (!btn) return;
        const r = btn.getBoundingClientRect();
        const wave = document.createElement("span");
        wave.className = "ripple";
        wave.style.left = `${e.clientX - r.left}px`;
        wave.style.top = `${e.clientY - r.top}px`;
        btn.appendChild(wave);
        setTimeout(() => wave.remove(), 800);
      };
      document.addEventListener("pointermove", onTilt, { passive: true });
      document.addEventListener("pointerdown", onDown, { passive: true });
      cleanups.push(() => {
        document.removeEventListener("pointermove", onTilt);
        document.removeEventListener("pointerdown", onDown);
        resetTilt(tilted);
      });
    }

    // Alone luminoso sulle card dei progetti che segue il mouse
    if (finePointer) {
      const onCard = (e: PointerEvent) => {
        const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".project-link");
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      document.addEventListener("pointermove", onCard, { passive: true });
      cleanups.push(() => document.removeEventListener("pointermove", onCard));
    }

    const start = async () => {
      if (disposed) return;
      const canvas = document.getElementById("scene") as HTMLCanvasElement | null;
      if (!canvas) return;
      try {
        // I caratteri servono alle etichette disegnate nel 3D: aspetta che siano pronti.
        try {
          await document.fonts.ready;
        } catch {
          /* se non disponibile si usa il carattere di ripiego */
        }
        // Import dinamico: Three.js non pesa sul primo caricamento della pagina.
        const mod = await import("@/lib/scene");
        if (disposed) return;
        const small = window.innerWidth < 768;
        const font = getComputedStyle(root).getPropertyValue("--font-sans").trim() || "system-ui, sans-serif";
        const created = await mod.createScene(canvas, { count: small ? 2200 : 7500, reduced, maxDpr: small ? 1.25 : 2, font });
        if (disposed) {
          created.dispose();
          return;
        }
        api = created;
        root.classList.add("scene-on");
        compute();
        // Quando la foto è disegnata anche nella scena (con le icone che le passano davanti e dietro), si nasconde quella HTML.
        void created.photoReady.then((ok) => {
          if (!ok || disposed) return;
          const id = setTimeout(() => root.classList.add("photo-3d"), 1600);
          cleanups.push(() => clearTimeout(id));
        });
      } catch {
        // WebGL non disponibile: resta lo sfondo CSS, il sito funziona uguale.
      }
    };

    // La scena parte alla PRIMA INTERAZIONE (mouse, scroll, tocco, tastiera) o al più tardi dopo 8 secondi,
    // e solo quando il browser è libero. Così il primo caricamento resta leggero e veloce (LCP, TBT).
    const run = () => {
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(start, { timeout: 1500 });
        cleanups.push(() => window.cancelIdleCallback(id));
      } else {
        const id = setTimeout(start, 400);
        cleanups.push(() => clearTimeout(id));
      }
    };
    let triggered = false;
    const triggers = ["pointermove", "scroll", "touchstart", "keydown", "wheel", "click"] as const;
    const fire = () => {
      if (triggered) return;
      triggered = true;
      for (const t of triggers) window.removeEventListener(t, fire);
      clearTimeout(fallback);
      if (document.readyState === "complete") run();
      else window.addEventListener("load", run, { once: true });
    };
    const fallback = setTimeout(fire, 8000);
    for (const t of triggers) window.addEventListener(t, fire, { passive: true });
    cleanups.push(() => {
      clearTimeout(fallback);
      for (const t of triggers) window.removeEventListener(t, fire);
      window.removeEventListener("load", run);
    });

    compute();

    return () => {
      disposed = true;
      for (const c of cleanups) c();
      api?.dispose();
      root.classList.remove("scene-on");
    };
  }, []);

  return null;
}
