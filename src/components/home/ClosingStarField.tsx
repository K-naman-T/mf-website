"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion, type MotionValue } from "motion/react";
import { gsap } from "gsap";
import { STAR_LEFT_D, STAR_RIGHT_D } from "@/components/brand/OfyShortLogo";
import styles from "./ofy-art-home.module.css";

const LOGO_SRC = "/brand/ofy-short-logo.svg";
const VIEWBOX_W = 700, VIEWBOX_H = 280, SAMPLE_W = 175, SAMPLE_H = 70;
// Eyelid blink, same as the intro. The pause is the gap between double squints.
const BLINK_DOUBLE_GAP_MS = 260;
// One-shot convergence at 90%: the field lands with the zipper's full split,
// runs ~1.4s, and resets well before the reveal reverses.
const CONVERGENCE_START = 0.9, CONVERGENCE_RESET = 0.85, CONVERGENCE_MS = 1400;
// Cells furthest from the star box center start a third of the ramp late, so
// the inward sweep closes exactly at conv = 1.
const CONVERGENCE_STAGGER = 0.3;
const REVEAL_RISE_PX = 14;
// ASCII field: one brand letter per 16px cell. The interference pattern picks
// the band, so the field reads as sparse Y's, mid F's and crests of O's.
const ASCII_CELL = 16;
const ASCII_FONT = `500 ${ASCII_CELL * 0.8}px ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace`;
const GLYPHS = ["Y", "F", "O"] as const;
const BAND_Y = 0.35, BAND_F = 0.6, BAND_O = 0.85, CONVERGED_LIFT = 0.85;
// Five alpha levels shared by every glyph: 0.28 + brightness * 0.72 quantized.
const ALPHA_BUCKETS = [0.28, 0.46, 0.64, 0.82, 1];
const ALPHA_STEP = (1 - ALPHA_BUCKETS[0]) / (ALPHA_BUCKETS.length - 1);

const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from || 1)));
  return t * t * (3 - 2 * t);
};

/** Rasterize the mark once; its alpha bytes are the field's silhouette mask. */
function sampleLogo(image: HTMLImageElement): Uint8ClampedArray | null {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_W; canvas.height = SAMPLE_H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(image, 0, 0, SAMPLE_W, SAMPLE_H);
  const { data } = ctx.getImageData(0, 0, SAMPLE_W, SAMPLE_H);
  const alpha = new Uint8ClampedArray(SAMPLE_W * SAMPLE_H);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3];
  return alpha;
}

export function ClosingStarField({ formation }: { formation: MotionValue<number> }) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [field, setField] = useState<Element | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const registeredRef = useRef<HTMLSpanElement>(null);
  const animated = mounted && !reduced;

  useEffect(() => {
    setMounted(true);
    // The star box only marks the target; the field must reach the rail seam.
    setField(boxRef.current?.closest("section") ?? null);
  }, []);

  useEffect(() => {
    const box = boxRef.current, element = field, canvas = canvasRef.current;
    const mark = markRef.current, registered = registeredRef.current;
    if (!animated || !box || !element || !canvas || !mark || !registered) return;
    const stars = Array.from(box.querySelectorAll<SVGGElement>("[data-closing-star]"));
    if (stars.length !== 2) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    let width = 0, height = 0, dpr = 1, cols = 0, rows = 0, cellCount = 0;
    let frame = 0, running = false, disposed = false;
    let cellX = new Float32Array(0), cellY = new Float32Array(0);
    let cellMask = new Float32Array(0), cellDist = new Float32Array(0);
    let cellGlyph = new Uint8Array(0), cellBucket = new Uint8Array(0);
    let raster: Uint8ClampedArray | null = null;

    // CTA + footer rise as the last bright cell lands; the blink never touches them.
    const reveals = element.querySelectorAll<HTMLElement>("[data-closing-reveal]");
    const applyReveal = (value: number) => {
      const opacity = value.toFixed(3);
      const transform = `translateY(${(REVEAL_RISE_PX * (1 - value)).toFixed(2)}px)`;
      for (const node of reveals) { node.style.opacity = opacity; node.style.transform = transform; }
    };
    applyReveal(0);

    // The logo mask: the star box is letterboxed exactly like the crisp mark,
    // and each cell samples the raster's 3x3 alpha neighborhood. The same
    // mapping yields the center distance that staggers the inward sweep.
    const rebuildMask = () => {
      if (!cellCount) return;
      const fr = element.getBoundingClientRect(), br = box.getBoundingClientRect();
      const scale = Math.min(br.width / VIEWBOX_W, br.height / VIEWBOX_H);
      if (!(scale > 0)) return;
      const ox = br.left - fr.left + (br.width - VIEWBOX_W * scale) / 2;
      const oy = br.top - fr.top + (br.height - VIEWBOX_H * scale) / 2;
      const bw = VIEWBOX_W * scale, bh = VIEWBOX_H * scale;
      const cx = ox + bw / 2, cy = oy + bh / 2;
      for (let i = 0; i < cellCount; i++) {
        const dx = (cellX[i] - cx) / Math.max(1, bw / 2), dy = (cellY[i] - cy) / Math.max(1, bh / 2);
        cellDist[i] = Math.min(1, Math.hypot(dx, dy) / Math.SQRT2);
        const nx = (cellX[i] - ox) / bw, ny = (cellY[i] - oy) / bh;
        let mask = 0;
        if (raster && nx >= 0 && nx < 1 && ny >= 0 && ny < 1) {
          const px = Math.min(SAMPLE_W - 1, Math.floor(nx * SAMPLE_W));
          const py = Math.min(SAMPLE_H - 1, Math.floor(ny * SAMPLE_H));
          let hits = 0;
          for (let sy = py - 1; sy <= py + 1; sy++) for (let sx = px - 1; sx <= px + 1; sx++)
            if (sx >= 0 && sx < SAMPLE_W && sy >= 0 && sy < SAMPLE_H && raster[sy * SAMPLE_W + sx] >= 128) hits++;
          mask = hits / 9;
        }
        cellMask[i] = mask;
      }
    };

    const build = () => {
      cols = Math.ceil(width / ASCII_CELL); rows = Math.ceil(height / ASCII_CELL); cellCount = cols * rows;
      cellX = new Float32Array(cellCount); cellY = new Float32Array(cellCount);
      cellMask = new Float32Array(cellCount); cellDist = new Float32Array(cellCount);
      cellGlyph = new Uint8Array(cellCount); cellBucket = new Uint8Array(cellCount);
      // Fit the ~16px grid inside the canvas so the outermost glyph centers
      // never fall past the edge (their ink has to reach the full-bleed seam).
      const stepX = width / cols, stepY = height / rows;
      for (let i = 0; i < cellCount; i++) {
        cellX[i] = ((i % cols) + 0.5) * stepX;
        cellY[i] = (((i / cols) | 0) + 0.5) * stepY;
      }
      rebuildMask();
    };

    const resize = () => {
      const rect = element.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return;
      if (Math.abs(rect.width - width) < 0.5 && Math.abs(rect.height - height) < 0.5) { rebuildMask(); return; }
      width = rect.width; height = rect.height; dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(element);
    resizeObserver.observe(box);

    const image = new Image(); image.decoding = "async";
    image.onload = () => { if (!disposed) { raster = sampleLogo(image); rebuildMask(); } };
    image.src = LOGO_SRC;

    let latest = formation.get();
    const unsubscribe = formation.on("change", (value) => { latest = value; });

    let last = performance.now(), time = 0;
    let conv = 0, convStartedAt: number | null = null, convDoneAt: number | null = null, nextBlinkAt = Infinity;
    let blinkTween: gsap.core.Tween | null = null, blinkTimer: number | null = null;
    let lastReveal = 0, lastMark = -1, lastRegistered = -1;

    // The intro's eyelid blink, verbatim: both pieces squint to 0.6 and return.
    const startBlink = (double: boolean) => {
      blinkTween = gsap.to(stars, {
        scaleY: 0.6, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.inOut",
        onComplete: () => {
          blinkTween = null;
          if (!double) { nextBlinkAt = performance.now() + 2800 + Math.random() * 3700; return; }
          blinkTimer = window.setTimeout(() => { blinkTimer = null; startBlink(false); }, BLINK_DOUBLE_GAP_MS);
        },
      });
    };
    const resetBlink = () => {
      blinkTween?.kill(); blinkTween = null;
      if (blinkTimer !== null) { window.clearTimeout(blinkTimer); blinkTimer = null; }
      gsap.set(stars, { scaleY: 1 }); nextBlinkAt = Infinity;
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000));
      last = now; time += dt;

      // Trigger at 90% with hysteresis back down to 85%.
      if (raster && latest >= CONVERGENCE_START) {
        if (convStartedAt === null) convStartedAt = now;
      } else if (latest < CONVERGENCE_RESET && convStartedAt !== null) {
        convStartedAt = null; convDoneAt = null; resetBlink();
      }
      const elapsed = convStartedAt === null ? 0 : now - convStartedAt;
      conv = convStartedAt === null ? 0 : Math.min(1, elapsed / CONVERGENCE_MS);

      // CTA + footer wait for the mark, then rise.
      const reveal = smoothstep(0.72, 1, conv);
      if (reveal !== lastReveal) applyReveal(lastReveal = reveal);

      // Blink only after convergence, and only the two star pieces.
      if (conv >= 1) {
        if (convDoneAt === null) { convDoneAt = now; nextBlinkAt = now + 1200; }
        if (!blinkTween && blinkTimer === null && now >= nextBlinkAt) startBlink(Math.random() < 0.35);
      } else if (blinkTween || blinkTimer !== null) resetBlink();

      // The mark fades in as the bright cells dissolve; the ® settles last.
      const markValue = Math.round(smoothstep(0.62, 0.92, conv) * 1000) / 1000;
      if (markValue !== lastMark) mark.style.opacity = (lastMark = markValue).toFixed(3);
      const registeredValue = Math.round(smoothstep(0.75, 1, conv) * 1000) / 1000;
      if (registeredValue !== lastRegistered) registered.style.opacity = (lastRegistered = registeredValue).toFixed(3);

      context.clearRect(0, 0, width, height);
      const dissolve = 1 - smoothstep(0.70, 0.97, conv);
      // Fully converged: no glyph pixel may survive, so skip the pass outright.
      if (conv >= 1 || dissolve <= 0) return;

      context.font = ASCII_FONT;
      context.textAlign = "center";
      context.textBaseline = "middle";
      const outsideDim = 1 - smoothstep(0.35, 0.9, conv);

      for (let i = 0; i < cellCount; i++) {
        const col = i % cols, row = (i - col) / cols;
        // Three slow sine terms: calm interference of broad crests and troughs.
        const wave = 0.5
          + 0.25 * Math.sin(col * 0.9 + time * 0.32) * Math.sin(row * 0.75 - time * 0.21)
          + 0.15 * Math.sin((col + row) * 0.45 + time * 0.13);
        const mask = cellMask[i];
        const local = Math.max(0, Math.min(1, (conv - cellDist[i] * CONVERGENCE_STAGGER) / (1 - CONVERGENCE_STAGGER)));
        let brightness = wave + mask * local * CONVERGED_LIFT;
        if (mask === 0) brightness *= outsideDim;
        brightness = Math.min(1, brightness);
        // Brand-letter bands: space, Y, F, then O at the crests.
        const glyph = brightness < BAND_Y ? 3 : brightness < BAND_F ? 0 : brightness < BAND_O ? 1 : 2;
        cellGlyph[i] = glyph;
        const alpha = Math.min(1, ALPHA_BUCKETS[0] + brightness * (1 - ALPHA_BUCKETS[0]));
        cellBucket[i] = Math.min(ALPHA_BUCKETS.length - 1, Math.round((alpha - ALPHA_BUCKETS[0]) / ALPHA_STEP));
      }

      // 3 glyphs x 5 alpha buckets: one fillStyle change per level.
      for (let bucket = 0; bucket < ALPHA_BUCKETS.length; bucket++) {
        const fill = `rgba(255,0,0,${(ALPHA_BUCKETS[bucket] * dissolve).toFixed(3)})`;
        let styled = false;
        for (let glyph = 0; glyph < GLYPHS.length; glyph++) {
          const char = GLYPHS[glyph];
          for (let i = 0; i < cellCount; i++) {
            if (cellGlyph[i] !== glyph || cellBucket[i] !== bucket) continue;
            if (!styled) { context.fillStyle = fill; styled = true; }
            context.fillText(char, cellX[i], cellY[i]);
          }
        }
      }
    };

    const loop = (now: number) => { if (!running) return; draw(now); frame = requestAnimationFrame(loop); };
    const start = () => { if (running) return; running = true; last = performance.now(); frame = requestAnimationFrame(loop); };
    const stop = () => { running = false; cancelAnimationFrame(frame); };

    const intersection = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) start(); else stop();
    }, { threshold: 0.01 });
    intersection.observe(element);

    return () => {
      disposed = true; stop();
      intersection.disconnect(); resizeObserver.disconnect();
      unsubscribe(); image.onload = null;
      // Hand the CTA/footer back to the stylesheet (reduced motion, remount).
      for (const node of reveals) { node.style.opacity = ""; node.style.transform = ""; }
      resetBlink();
    };
  }, [animated, field, formation]);

  return (
    <>
      {animated && field && createPortal(
        <canvas ref={canvasRef} className={styles.starCanvas} data-closing-stars aria-hidden="true" />,
        field,
      )}
      <div ref={boxRef} className={styles.starField}>
        {animated ? (
          <>
            <svg ref={markRef} data-closing-mark viewBox="0 0 700 275" preserveAspectRatio="xMidYMid meet"
              aria-hidden="true" style={{ display: "block", width: "100%", height: "100%", overflow: "visible", opacity: 0 }}>
              <g data-closing-star="left" className={styles.closingStarPiece}><path d={STAR_LEFT_D} fill="#FF0000" fillRule="evenodd" transform="translate(12 28)" /></g>
              <g data-closing-star="right" className={styles.closingStarPiece}><path d={STAR_RIGHT_D} fill="#FF0000" fillRule="evenodd" transform="translate(362 36)" /></g>
            </svg>
            <span ref={registeredRef} className={styles.closingRegistered} data-brand-registered style={{ opacity: 0 }}>®</span>
          </>
        ) : (
          <>
            <img className={styles.starFieldLogo} src={LOGO_SRC} alt="" aria-hidden="true" />
            <span className={styles.closingRegistered} data-brand-registered>®</span>
          </>
        )}
      </div>
    </>
  );
}
