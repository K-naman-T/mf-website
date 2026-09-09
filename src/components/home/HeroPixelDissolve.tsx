"use client";

import { useEffect, useRef } from "react";
import styles from "./hero-pixel-dissolve.module.css";

/**
 * HeroPixelDissolve — Phase 1 of the hero → work transition.
 *
 * Model: the deck is a snap scroller whose scenes are in-flow full-viewport
 * blocks, so the whole hero (plate + headline, both absolute within it) scrolls
 * up as a unit when moving to the work scene. This component FREEZES the hero:
 *
 *   - On mount it clones the resting `.hero` scene into a full-viewport
 *     snapshot and holds it as a fixed, opaque layer. Because it arms at the
 *     very start of the hop (scroll progress p ≈ 0, hero still ~full-screen),
 *     overlaying the resting snapshot is visually seamless.
 *   - The live `.hero` scene is hidden while armed, so as pixels are deleted
 *     the holes reveal the WORK plate rising beneath — never a live copy of
 *     the hero.
 *   - As `progress` scrolls 0 → 1, pixels are deleted through an ordered-dither
 *     threshold map (Bayer 8×8 + small noise + a scroll-direction ripple).
 *   - At p ≈ 1 the snapshot is fully erased; the deck transitions to "done",
 *     unmounting this layer and revealing the settled work section for Phase 2.
 *
 * Reverse-safe: `progress` is a pure function of scroll, so scrolling back
 * repaints deleted pixels and the hero is restored seamlessly.
 *
 * Reduced motion: render nothing (the deck falls back to an instant cut).
 */

interface HeroPixelDissolveProps {
  /** 0..1 scroll progress across the hero→work hop. */
  progress: number;
  theme: "red" | "dark";
  reducedMotion?: boolean;
}

// Deletion window: pixels start dropping just after the hero begins leaving and
// are fully gone just before the work scene rests.
const START_T = 0.1;
const END_T = 0.94;

// The dissolve canvas renders at 1/RENDER_SCALE the viewport, and each canvas
// pixel is one dither cell (~3 display px). ImageData passes run over a small
// buffer regardless of DPR; the canvas is upscaled with pixelated smoothing.
const RENDER_SCALE = 6;
const CELL_PX = 3;

// Ordered Bayer 8×8 threshold map, normalized 0..1.
const BAYER_8: number[] = (() => {
  const raw = [
    0, 32, 8, 40, 2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44, 4, 36, 14, 46, 6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
    3, 35, 11, 43, 1, 33, 9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47, 7, 39, 13, 45, 5, 37,
    63, 31, 55, 23, 61, 29, 53, 21,
  ];
  return raw.map((v) => (v + 0.5) / 64);
})();

// Deterministic per-cell jitter so the ordered grid has subtle organic fuzz.
function hash2(x: number, y: number): number {
  let h = x * 374761393 + y * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  h = h ^ (h >> 16);
  return ((h >>> 0) % 1000) / 1000;
}

export function HeroPixelDissolve({
  progress,
  theme,
  reducedMotion = false,
}: HeroPixelDissolveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snapshotRef = useRef<HTMLCanvasElement | null>(null);
  const capturedRef = useRef(false);
  const progressRef = useRef(progress);
  progressRef.current = progress;

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let disposed = false;

    const captureHero = () => {
      if (capturedRef.current) return;
      const hero = document.querySelector<HTMLElement>("#top[data-home-scene]");
      if (!hero) return;
      const vw = Math.max(1, Math.round(window.innerWidth));
      const vh = Math.max(1, Math.round(window.innerHeight));
      const srcW = Math.max(1, Math.round(vw / CELL_PX));
      const srcH = Math.max(1, Math.round(vh / CELL_PX));

      // Clone the resting hero and lay it out at its in-flow top-of-scroller
      // position, full viewport, animations stripped, so the snapshot is a
      // clean resting frame regardless of the live scene's scroll state.
      const clone = hero.cloneNode(true) as HTMLElement;
      clone.style.transform = "none";
      clone.style.animation = "none";
      clone.style.transition = "none";
      clone.style.position = "fixed";
      clone.style.top = "0";
      clone.style.left = "0";
      clone.style.width = `${vw}px`;
      clone.style.height = `${vh}px`;
      clone.style.margin = "0";
      clone.style.overflow = "hidden";
      clone.style.pointerEvents = "none";
      clone.style.opacity = "1";
      clone.style.visibility = "visible";
      clone.querySelectorAll<HTMLElement>("*").forEach((el) => {
        const s = el.style;
        if (s.position === "fixed") s.position = "absolute";
        s.animation = "none";
        s.transition = "none";
        s.opacity = "";
        s.visibility = "";
      });

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", String(vw));
      svg.setAttribute("height", String(vh));
      svg.setAttribute("viewBox", `0 0 ${vw} ${vh}`);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const fo = document.createElementNS("http://www.w3.org/2000/svg", "foreignObject");
      fo.setAttribute("width", String(vw));
      fo.setAttribute("height", String(vh));
      fo.setAttribute("x", "0");
      fo.setAttribute("y", "0");
      fo.appendChild(clone);
      svg.appendChild(fo);

      const xml = new XMLSerializer().serializeToString(svg);
      const url = URL.createObjectURL(
        new Blob([xml], { type: "image/svg+xml;charset=utf-8" }),
      );
      const img = new Image();
      img.onload = () => {
        if (disposed) {
          URL.revokeObjectURL(url);
          return;
        }
        const off = document.createElement("canvas");
        off.width = srcW;
        off.height = srcH;
        const offCtx = off.getContext("2d", { willReadFrequently: true });
        if (offCtx) {
          offCtx.drawImage(img, 0, 0, srcW, srcH);
          snapshotRef.current = off;
          capturedRef.current = true;
          draw();
        }
        URL.revokeObjectURL(url);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        capturedRef.current = false;
        // No fallback snapshot: if capture fails the layer stays transparent
        // and the work plate is revealed directly.
      };
      img.src = url;
    };

    const draw = () => {
      const snap = snapshotRef.current;
      if (!snap || disposed) return;

      const raw = Math.min(1, Math.max(0, progressRef.current));
      const t =
        raw <= START_T
          ? 0
          : Math.min(1, Math.max(0, (raw - START_T) / (END_T - START_T)));

      if (t <= 0) {
        ctx.clearRect(0, 0, w, h);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(snap, 0, 0, w, h);
        return;
      }
      if (t >= 1) {
        ctx.clearRect(0, 0, w, h);
        return;
      }

      const imgData = ctx.getImageData(0, 0, w, h);
      const data = imgData.data;
      const total = w + h;
      // Softstep the deletion so it accelerates through the middle.
      const easeT = t * t * (3 - 2 * t);

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const bayer = BAYER_8[(y & 7) * 8 + (x & 7)]!;
          const jitter = (hash2(x, y) - 0.5) * 0.16;
          const ripple = 0.1 * easeT * ((x + y) / total);
          const cellThreshold = Math.min(1, Math.max(0, bayer + jitter + ripple));
          if (cellThreshold < easeT) {
            const idx = (y * w + x) * 4;
            const keep = Math.max(0, 1 - (easeT - cellThreshold) / 0.07);
            data[idx] = Math.round(data[idx] * keep);
            data[idx + 1] = Math.round(data[idx + 1] * keep);
            data[idx + 2] = Math.round(data[idx + 2] * keep);
            data[idx + 3] = Math.round(data[idx + 3] * keep);
          }
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };

    const render = () => {
      if (disposed) return;
      const hostW = canvas.parentElement?.clientWidth ?? window.innerWidth;
      const hostH = canvas.parentElement?.clientHeight ?? window.innerHeight;
      const targetW = Math.max(1, Math.round((hostW / RENDER_SCALE) * dpr));
      const targetH = Math.max(1, Math.round((hostH / RENDER_SCALE) * dpr));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
        w = targetW;
        h = targetH;
      }
      draw();
      raf = requestAnimationFrame(render);
    };

    captureHero();
    raf = requestAnimationFrame(render);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      capturedRef.current = false;
      snapshotRef.current = null;
    };
  }, [reducedMotion, theme]);

  if (reducedMotion) return null;

  return (
    <div className={styles.dissolveRoot} aria-hidden="true">
      <canvas
        ref={canvasRef}
        className={styles.dissolveCanvas}
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
