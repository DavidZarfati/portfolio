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
    let ticking = false;

    function compute() {
      ticking = false;
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
        // Import dinamico: Three.js non pesa sul primo caricamento della pagina.
        const mod = await import("@/lib/scene");
        if (disposed) return;
        const small = window.innerWidth < 768;
        api = mod.createScene(canvas, { count: small ? 2600 : 7500, reduced, maxDpr: small ? 1.5 : 2 });
        root.classList.add("scene-on");
        compute();
      } catch {
        // WebGL non disponibile: resta lo sfondo CSS, il sito funziona uguale.
      }
    };

    // La scena parte solo quando il browser è libero e la pagina è già caricata.
    const run = () => {
      if ("requestIdleCallback" in window) {
        const id = window.requestIdleCallback(start, { timeout: 2000 });
        cleanups.push(() => window.cancelIdleCallback(id));
      } else {
        const id = setTimeout(start, 800);
        cleanups.push(() => clearTimeout(id));
      }
    };
    if (document.readyState === "complete") run();
    else {
      window.addEventListener("load", run, { once: true });
      cleanups.push(() => window.removeEventListener("load", run));
    }

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
