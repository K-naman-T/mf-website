"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { DitheringShader, type WaveMotion } from "@/components/ui/dithering-shader";
import type { HomeContent } from "@/lib/cms/types";
import type { ManifestoHandoff } from "./useManifestoGestures";
import styles from "./ofy-art-home.module.css";

type Beat = HomeContent["manifesto"]["sequence"][number];
type Point = { x: number; y: number };
type GlyphPixel = Point & { word: number };
type Glyphs = { center: Point; pixels: GlyphPixel[]; bottom: number };

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (from: number, to: number, value: number) => {
  const t = clamp((value - from) / (to - from));
  return t * t * (3 - 2 * t);
};

const departAt = (word: number) => 0.03 + word * 0.19;
const arriveAt = (word: number) => 0.62 + word * 0.27;

function statementUnits({ text, mark }: Beat) {
  const at = mark ? text.indexOf(mark) : -1;
  const words = (phrase: string) => phrase.trim().split(/\s+/).filter(Boolean)
    .map((word) => ({ text: word, marked: false }));
  if (at === -1) return words(text);
  return [
    ...words(text.slice(0, at)),
    { text: mark, marked: true },
    ...words(text.slice(at + mark.length)),
  ];
}

function GlyphWord({ unit, index, word, handoff, hasPixels }: {
  unit: ReturnType<typeof statementUnits>[number];
  index: number;
  word: number;
  handoff: MotionValue<ManifestoHandoff>;
  hasPixels: boolean;
}) {
  const opacity = useTransform(handoff, ({ from, to, t }) => {
    if (from === to) return index === to ? 1 : 0;
    if (index === from) {
      const start = hasPixels ? departAt(word) : 0.2;
      return 1 - smooth(start, start + (hasPixels ? 0.075 : 0.6), t);
    }
    if (index === to) {
      const start = hasPixels ? arriveAt(word) + 0.015 : 0.2;
      return smooth(start, start + (hasPixels ? 0.08 : 0.6), t);
    }
    return 0;
  });

  return (
    <motion.span className={unit.marked ? styles.statementMark : styles.manifestoWord} style={{ opacity }}>
      <span data-glyph-word>{unit.text}</span>
    </motion.span>
  );
}

function Statement({ beat, index, handoff, hasPixels }: {
  beat: Beat;
  index: number;
  handoff: MotionValue<ManifestoHandoff>;
  hasPixels: boolean;
}) {
  const units = statementUnits(beat);
  return (
    <div className={styles.manifestoBeat} data-side={index % 2 === 0 ? "left" : "right"}>
      <h2 id={index === 0 ? "home-manifesto-title" : undefined} className={styles.manifestoStatement}>
        {units.map((unit, i) => (
          <Fragment key={i}>
            {i > 0 && " "}
            <GlyphWord unit={unit} index={index} word={i / Math.max(1, units.length - 1)} handoff={handoff} hasPixels={hasPixels} />
          </Fragment>
        ))}
      </h2>
    </div>
  );
}

/** Sample the actual wrapped words after fonts load, in stage coordinates. */
function sampleGlyphs(heading: HTMLElement, stage: DOMRect, context: CanvasRenderingContext2D, cell: number): Glyphs {
  const { width, height } = context.canvas;
  context.clearRect(0, 0, width, height);
  const font = getComputedStyle(heading);
  context.font = `${font.fontWeight} ${font.fontSize} ${font.fontFamily}`;
  context.letterSpacing = font.letterSpacing;
  const range = document.createRange();

  const words = Array.from(heading.querySelectorAll("[data-glyph-word]"), (word) => {
    range.selectNodeContents(word);
    const rect = range.getBoundingClientRect();
    const text = word.textContent?.toUpperCase() ?? "";
    const metrics = context.measureText(text);
    const ascent = metrics.fontBoundingBoxAscent;
    const fontHeight = ascent + metrics.fontBoundingBoxDescent;
    const baseline = rect.top - stage.top + (rect.height - fontHeight) / 2 + ascent;
    const x = rect.left - stage.left;
    context.fillText(text, x, baseline);
    return {
      left: x - metrics.actualBoundingBoxLeft,
      right: x + metrics.actualBoundingBoxRight,
      top: baseline - metrics.actualBoundingBoxAscent,
      bottom: baseline + metrics.actualBoundingBoxDescent,
    };
  });

  const { data } = context.getImageData(0, 0, width, height);
  const pixels: GlyphPixel[] = [];
  const center = { x: 0, y: 0 };
  words.forEach(({ left, right, top, bottom }, index) => {
    const word = index / Math.max(1, words.length - 1);
    for (let y = Math.max(0, Math.ceil(top / cell) * cell); y <= bottom && y < height; y += cell) {
      for (let x = Math.max(0, Math.ceil(left / cell) * cell); x <= right && x < width; x += cell) {
        if (data[(y * width + x) * 4 + 3] < 128) continue;
        pixels.push({ x, y, word });
        center.x += x;
        center.y += y;
      }
    }
  });
  if (pixels.length) {
    center.x /= pixels.length;
    center.y /= pixels.length;
  }
  return { center, pixels, bottom: Math.max(0, ...words.map((word) => word.bottom)) };
}

function drawHandoff(context: CanvasRenderingContext2D, from: Glyphs, to: Glyphs, t: number, cell: number, textFloor: number) {
  const n = Math.max(from.pixels.length, to.pixels.length);
  const width = context.canvas.width;
  const direction = Math.sign(to.center.x - from.center.x);
  const lift = Math.min(52, width * 0.09);
  context.fillStyle = "#ff0000";

  for (let i = 0; i < n; i++) {
    const a = from.pixels[Math.floor(i * from.pixels.length / n)]!;
    const b = to.pixels[Math.floor(i * to.pixels.length / n)]!;
    const grain = ((i * 163) % 131) / 130;
    const start = departAt(a.word);
    const end = arriveAt(b.word);
    if (t <= start || t >= end + 0.095) continue;

    // The leading words peel into the stream while the first arriving letters
    // are already docking. Every cell still lands on the sampled target glyph.
    const travel = smooth(start + grain * 0.055, end + grain * 0.045, t);
    const pinch = Math.sin(Math.PI * travel);
    const spineX = mix(from.center.x, to.center.x, travel)
      + direction * (grain - 0.58) * width * 0.25;
    const spineY = mix(from.center.y, to.center.y, travel) - lift
      + Math.sin(i * 2.399) * lift * 0.52;
    const x = mix(mix(a.x, b.x, travel), spineX, pinch * 0.88);
    const y = Math.min(textFloor, mix(mix(a.y, b.y, travel), spineY, pinch));
    const edge = smooth(start, start + 0.055, t) * (1 - smooth(end + 0.03, end + 0.095, t));
    const size = cell * edge * mix(1.08, 0.45 + grain * 0.43, pinch);
    context.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), size, size);
  }
}

interface ManifestoStageProps {
  sequence: HomeContent["manifesto"]["sequence"];
  handoff: MotionValue<ManifestoHandoff>;
  active: boolean;
  reducedMotion: boolean;
  theme: "dark" | "red";
}

export function ManifestoStage({ sequence, handoff, active, reducedMotion, theme }: ManifestoStageProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const [hasPixels, setHasPixels] = useState(false);
  const waveMotion = useMotionValue<WaveMotion>({ x: 0, y: 0, strength: 0, ripple: 0 });
  const animated = active && !reducedMotion;

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    const wave = waveRef.current;
    if (!animated || !stage || !canvas || !wave) return;

    const context = canvas.getContext("2d");
    const mask = document.createElement("canvas");
    const maskContext = mask.getContext("2d", { willReadFrequently: true });
    const headings = Array.from(stage.querySelectorAll<HTMLElement>("h2"));
    let glyphs: Glyphs[] = [];
    let cell = 4;
    let waveBox = { left: 0, top: 0, width: 1 };
    let disposed = false;

    const draw = ({ from, to, t }: ManifestoHandoff) => {
      const source = glyphs[from];
      const target = glyphs[to];
      const crossing = from !== to && t < 1;
      context?.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.opacity = "0";

      if (!crossing) {
        waveMotion.set({ x: 0, y: 0, strength: 0, ripple: 0 });
        return;
      }

      const left = canvas.width * 0.28;
      const right = canvas.width - left;
      const focusX = mix(
        source?.center.x ?? (from % 2 ? right : left),
        target?.center.x ?? (to % 2 ? right : left),
        smooth(0.12, 0.78, t),
      );
      // Carry the force across the wave below the stream's horizontal path.
      waveMotion.set({
        x: (focusX - waveBox.left) / waveBox.width - 0.5,
        y: 0.12,
        strength: smooth(0.12, 0.44, t) * (1 - smooth(0.6, 1, t)),
        ripple: smooth(0.32, 1, t),
      });

      if (context && source?.pixels.length && target?.pixels.length) {
        const lowestGlyph = Math.max(waveBox.top - 8, source.bottom, target.bottom);
        drawHandoff(context, source, target, t, cell, lowestGlyph);
        canvas.style.opacity = "1";
      }
    };

    const measure = () => {
      const stageBox = stage.getBoundingClientRect();
      const waveRect = wave.getBoundingClientRect();
      waveBox = {
        left: waveRect.left - stageBox.left,
        top: waveRect.top - stageBox.top,
        width: Math.max(1, waveRect.width),
      };
      canvas.width = Math.max(1, Math.round(stageBox.width));
      canvas.height = Math.max(1, Math.round(stageBox.height));
      if (context && maskContext && document.fonts.status === "loaded") {
        mask.width = canvas.width;
        mask.height = canvas.height;
        cell = Math.max(3, Math.round(canvas.width / 270));
        glyphs = headings.map((heading) => sampleGlyphs(heading, stageBox, maskContext, cell));
        setHasPixels(glyphs.length > 1 && glyphs.every((glyph) => glyph.pixels.length > 0));
      }
      draw(handoff.get());
    };

    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    headings.forEach((heading) => observer.observe(heading));
    document.fonts.ready.then(() => { if (!disposed) measure(); });
    measure();
    const unsubscribe = handoff.on("change", draw);

    return () => {
      disposed = true;
      canvas.style.opacity = "0";
      observer.disconnect();
      unsubscribe();
    };
  }, [animated, handoff, sequence, waveMotion]);

  return (
    <div className={styles.manifestoStage} ref={stageRef}>
      <div className={styles.manifestoStageInner}>
        <div className={styles.manifestoWave} ref={waveRef} aria-hidden="true">
          <div className={styles.waveFallback} />
          {animated && (
            <DitheringShader
              className={styles.waveShader}
              style={{ position: "absolute", inset: 0 }}
              shape="wave"
              type="8x8"
              pxSize={5}
              speed={0.85}
              morph={0.9}
              waveMotion={waveMotion}
              colorBack={theme === "dark" ? "#000000" : "#ff0000"}
              colorFront={theme === "dark" ? "#ff0000" : "#000000"}
            />
          )}
        </div>
        <canvas className={styles.manifestoPixels} ref={canvasRef} aria-hidden="true" />
        <div className={styles.manifestoGrid}>
          <div className={styles.manifestoBeats}>
            {sequence.map((beat, index) => (
              <Statement key={index} beat={beat} index={index} handoff={handoff} hasPixels={hasPixels} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
