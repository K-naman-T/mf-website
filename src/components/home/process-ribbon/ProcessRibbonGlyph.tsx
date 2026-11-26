"use client";

import { useEffect, useRef } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";
import { BAYER_8 } from "@/components/brand/orb-glyph";
import { PROCESS_GLYPHS, type ProcessGlyph } from "@/components/home/ProcessStepIcon";
import styles from "./process-ribbon-home.module.css";

const GRID = 52;
const CELL = 4;
const START = 0.28;
const END = 0.33;
const masks = new Map<ProcessGlyph, Uint8Array>();

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (from: number, to: number, n: number) => {
  const t = clamp((n - from) / (to - from));
  return t * t * (3 - 2 * t);
};

function handoffAt(progress: number, count: number) {
  const slot = clamp(progress) * count;
  const boundary = Math.round(slot);
  const t = (slot - boundary + START) / (START + END);
  if (boundary > 0 && boundary < count && t > 0 && t < 1) return { from: boundary - 1, to: boundary, t };
  const index = Math.min(count - 1, Math.floor(slot));
  return { from: index, to: index, t: 1 };
}

function sampleGlyph(glyph: ProcessGlyph) {
  const cached = masks.get(glyph);
  if (cached) return cached;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = GRID;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const scale = GRID * 0.02 / 512;
  ctx.setTransform(scale, 0, 0, -scale, 0, GRID);
  for (const path of PROCESS_GLYPHS[glyph].paths) ctx.fill(new Path2D(path));

  const { data } = ctx.getImageData(0, 0, GRID, GRID);
  const mask = Uint8Array.from({ length: GRID * GRID }, (_, i) => {
    const threshold = BAYER_8[Math.floor(i / GRID) & 7]![(i % GRID) & 7]!;
    return data[i * 4 + 3]! > 55 + threshold * 2.3 ? 1 : 0;
  });
  masks.set(glyph, mask);
  return mask;
}

type Tile = { x: number; y: number };
type Move = { from: Tile; to: Tile; kind: "fixed" | "move" | "leave" | "arrive" };
const tile = (i: number): Tile => ({ x: i % GRID, y: Math.floor(i / GRID) });

function pairTiles(source: Uint8Array, target: Uint8Array): Move[] {
  const moves: Move[] = [];
  const outgoing: Tile[] = [];
  const incoming: Tile[] = [];

  for (let i = 0; i < source.length; i++) {
    if (source[i] && target[i]) moves.push({ from: tile(i), to: tile(i), kind: "fixed" });
    else if (source[i]) outgoing.push(tile(i));
    else if (target[i]) incoming.push(tile(i));
  }

  // Keep shared ink in register and route every remaining block toward the
  // closest open cell in the new silhouette.
  for (const from of outgoing) {
    let nearest = -1;
    let distance = Infinity;
    for (let j = 0; j < incoming.length; j++) {
      const candidate = incoming[j]!;
      const d = (from.x - candidate.x) ** 2 + (from.y - candidate.y) ** 2;
      if (d >= distance) continue;
      distance = d;
      nearest = j;
    }
    if (nearest === -1) {
      moves.push({ from, to: { x: from.x - 5, y: from.y - 3 }, kind: "leave" });
    } else {
      const [to] = incoming.splice(nearest, 1);
      moves.push({ from, to: to!, kind: "move" });
    }
  }
  for (const to of incoming) {
    moves.push({ from: { x: to.x + 6, y: to.y + 3 }, to, kind: "arrive" });
  }
  return moves;
}

interface GlyphProps {
  glyph: ProcessGlyph;
  index: number;
  count: number;
  progress: MotionValue<number>;
  intro: MotionValue<number>;
}

export function ProcessRibbonGlyph({ glyph, index, count, progress, intro }: GlyphProps) {
  const opacity = useTransform(() => {
    const { from, to, t } = handoffAt(progress.get(), count);
    const ready = smooth(0.82, 0.98, intro.get());
    if (from === to) return index === to ? ready : 0;
    if (index === from) return ready * (1 - smooth(0.02, 0.19, t));
    if (index === to) return ready * smooth(0.81, 0.98, t);
    return 0;
  });

  return (
    <div className={styles.glyphZone} data-process-icon>
      <motion.svg viewBox="0 0 512 512" className={styles.glyph} style={{ opacity }} focusable="false">
        <g transform="translate(0 512) scale(0.02 -0.02)" fill="currentColor">
          {PROCESS_GLYPHS[glyph].paths.map((d, i) => <path key={i} d={d} />)}
        </g>
      </motion.svg>
    </div>
  );
}

interface PressProps {
  glyphs: readonly ProcessGlyph[];
  progress: MotionValue<number>;
  intro: MotionValue<number>;
  redInk: boolean;
  reduced: boolean | null;
}

export function DitherPress({ glyphs, progress, intro, redInk, reduced }: PressProps) {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const canvas = canvasRef.current;
    const deck = layer?.parentElement;
    if (reduced || !layer || !canvas || !deck || !glyphs.length) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const slots = [...deck.querySelectorAll<HTMLElement>("[data-process-icon]")];
    const maps = new Map<number, Move[]>();
    const ink = redInk ? "#f00" : "#000";
    let bounds: { x: number; y: number; width: number; height: number }[] = [];

    const draw = () => {
      const { from, to, t } = handoffAt(progress.get(), glyphs.length);
      const opening = intro.get();
      const firstPrint = from === 0 && from === to && opening < 0.98;
      const alpha = firstPrint
        ? smooth(0.34, 0.5, opening) * (1 - smooth(0.82, 0.98, opening))
        : from === to ? 0 : smooth(0, 0.16, t) * (1 - smooth(0.84, 1, t));
      canvas.style.opacity = String(alpha);
      const a = bounds[from];
      const b = bounds[to];
      if (!alpha || !a || !b) return;

      const source = sampleGlyph(glyphs[from]!);
      const target = sampleGlyph(glyphs[to]!);
      if (!source || !target) return;
      const alignment = firstPrint ? 0 : smooth(0, 1, t);
      canvas.style.transform = `translate(${mix(a.x, b.x, alignment)}px, ${mix(a.y, b.y, alignment)}px)`;
      canvas.style.width = `${mix(a.width, b.width, alignment)}px`;
      canvas.style.height = `${mix(a.height, b.height, alignment)}px`;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = ink;
      if (firstPrint) {
        const pressure = smooth(0.34, 0.85, opening);
        for (let i = 0; i < source.length; i++) {
          if (!source[i]) continue;
          const { x, y } = tile(i);
          const edge = (x * 0.69 + y * 0.19) / GRID + BAYER_8[y & 7]![x & 7]! / 860;
          const size = CELL * smooth(edge - 0.05, edge + 0.1, pressure);
          ctx.fillRect(x * CELL + (CELL - size) / 2, y * CELL + (CELL - size) / 2, size, size);
        }
        return;
      }

      let moves = maps.get(from);
      if (!moves) {
        moves = pairTiles(source, target);
        maps.set(from, moves);
      }
      for (const move of moves) {
        // Groups register in bands, with the horizontal stroke leading the
        // vertical one. Finished blocks hold while the next band advances.
        const column = (move.from.x + move.to.x) / 2;
        const band = Math.floor((column * 0.8 + move.from.y * 0.2) / 6);
        const beat = 0.08 + clamp(band / 8) * 0.51;
        const horizontal = smooth(beat, beat + 0.24, t);
        const vertical = smooth(beat + 0.045, beat + 0.31, t);
        const x = mix(move.from.x, move.to.x, horizontal);
        const y = mix(move.from.y, move.to.y, vertical);
        const solid = move.kind === "arrive" ? vertical : move.kind === "leave" ? 1 - vertical : 1;
        const seam = Math.sin(t * Math.PI) * (move.kind === "fixed" ? 0.25 : 0.8);
        const size = (CELL - seam) * solid;
        ctx.fillRect(Math.round(x * CELL + (CELL - size) / 2), Math.round(y * CELL + (CELL - size) / 2), size, size);
      }
    };

    const measure = () => {
      const base = layer.getBoundingClientRect();
      bounds = slots.map((slot) => {
        const box = slot.getBoundingClientRect();
        return { x: box.left - base.left, y: box.top - base.top, width: box.width, height: box.height };
      });
      draw();
    };

    const observer = new ResizeObserver(measure);
    observer.observe(layer);
    slots.forEach((slot) => observer.observe(slot));
    measure();
    const stopProgress = progress.on("change", draw);
    const stopIntro = intro.on("change", draw);
    return () => {
      observer.disconnect();
      stopProgress();
      stopIntro();
      canvas.style.opacity = "0";
    };
  }, [glyphs, progress, intro, redInk, reduced]);

  return (
    <div ref={layerRef} className={styles.pressLayer} aria-hidden="true">
      <canvas ref={canvasRef} className={styles.glyphPixels} width={GRID * CELL} height={GRID * CELL} />
    </div>
  );
}
