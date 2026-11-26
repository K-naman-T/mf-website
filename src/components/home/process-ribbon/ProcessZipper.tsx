"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import styles from "./process-ribbon-home.module.css";

const clamp = (n: number) => Math.max(0, Math.min(1, n));
const ease = (start: number, end: number, n: number) => {
  const t = clamp((n - start) / (end - start));
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
const SPLIT_START = 0.90;
const SPLIT_RESET = 0.80;
const SPLIT_MS = 1000;
const SAMPLES = 52;
const RAIL_SAMPLES = 192;
const TOOTH_PITCH = 4.5;
const HARDWARE = "/assets/ofy-brand/process/zipper-hardware.svg";
const SVG_NS = "http://www.w3.org/2000/svg";
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

interface ProcessZipperProps {
  clipId: string;
  railPath: RefObject<SVGPathElement | null>;
  progress: MotionValue<number>;
  arrival: MotionValue<number>;
  reduced: boolean | null;
}

export function ProcessZipper({ clipId, railPath, progress, arrival, reduced }: ProcessZipperProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const leftRef = useRef<SVGPathElement>(null);
  const rightRef = useRef<SVGPathElement>(null);
  const trimRef = useRef<SVGGElement>(null);
  const tapeRef = useRef<SVGPathElement>(null);
  const stitchesRef = useRef<SVGPathElement>(null);
  const teethRef = useRef<SVGGElement>(null);
  const sliderRef = useRef<SVGUseElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    const trim = trimRef.current;
    const tape = tapeRef.current;
    const stitches = stitchesRef.current;
    const teeth = teethRef.current;
    const slider = sliderRef.current;
    const path = railPath.current;
    const source = path?.ownerSVGElement;
    if (reduced || !svg || !left || !right || !trim || !tape || !stitches || !teeth || !slider || !path || !source) return;

    const length = path.getTotalLength();
    const samples = Array.from({ length: RAIL_SAMPLES + 1 }, (_, i) => path.getPointAtLength(length * i / RAIL_SAMPLES));
    const railX = (y: number) => {
      let lo = 0;
      let hi = RAIL_SAMPLES;
      while (hi - lo > 1) {
        const i = (lo + hi) >> 1;
        if (samples[i]!.y <= y) lo = i;
        else hi = i;
      }
      const a = samples[lo]!;
      const b = samples[hi]!;
      return mix(a.x, b.x, clamp((y - a.y) / (b.y - a.y)));
    };

    let width = 1;
    let height = 1;
    let railLeft = 0;
    let railTop = 0;
    let sx = 1;
    let sy = 1;
    let frame = 0;
    let splitStartedAt: number | null = null;
    let splitFrame = 0;
    let links: SVGUseElement[] = [];
    let linkKeys: string[] = [];
    let lastZip = NaN;
    let lastNext = NaN;
    let lastSplit = NaN;

    const draw = (force = false) => {
      const zip = progress.get();
      const next = arrival.get();
      if (splitStartedAt === null && next >= SPLIT_START) splitStartedAt = performance.now();
      if (next < SPLIT_RESET) splitStartedAt = null;
      const split = splitStartedAt === null ? 0 : easeOutCubic(clamp((performance.now() - splitStartedAt) / SPLIT_MS));
      // A settled spring should cost nothing; while it moves, only the teeth
      // inside the opening band are rewritten below.
      const same =
        !force &&
        !Number.isNaN(lastZip) &&
        Math.abs(zip - lastZip) < 1e-5 &&
        Math.abs(next - lastNext) < 1e-5 &&
        Math.abs(split - lastSplit) < 1e-4;
      lastZip = zip;
      lastNext = next;
      lastSplit = split;
      if (same) return;
      if (next >= 1) {
        left.setAttribute("d", "");
        right.setAttribute("d", "");
        trim.style.opacity = "0";
        return;
      }

      const center = (y: number) => (railLeft + railX((y * height - railTop) / sy) * sx) / width;

      // The slit stays narrow through the whole reveal; once arrival crosses
      // SPLIT_START the two panels snap to the edges on a short timer.
      const tip = zip * 0.985 + next * 0.18;
      const narrow = ease(0, 0.18, zip) * 0.017;
      const release = split;
      const edge = (y: number, side: number) => {
        const gap = narrow * ease(0, 0.4, tip - y) + release * (side < 0 ? 0.3 : 1.02);
        return center(y) + side * gap;
      };

      if (zip <= 0) {
        left.setAttribute("d", "M0 0H1V1H0Z");
        right.setAttribute("d", "");
      } else {
        const clip = (side: number, outer: number) => {
          let d = `M${outer} 0`;
          for (let i = 0; i <= SAMPLES; i++) {
            const y = i / SAMPLES;
            d += `L${clamp(edge(y, side))} ${y}`;
          }
          return `${d}L${outer} 1Z`;
        };
        left.setAttribute("d", clip(-1, 0));
        right.setAttribute("d", clip(1, 1));
      }

      const line = (inset: number) => {
        let d = "";
        for (const side of [-1, 1]) {
          for (let i = 0; i <= SAMPLES; i++) {
            const y = i / SAMPLES;
            d += `${i ? "L" : "M"}${edge(y, side) * width + side * inset} ${y * height}`;
          }
        }
        return d;
      };
      tape.setAttribute("d", line(7));
      stitches.setAttribute("d", line(13));

      const edgeX = (y: number, side: number) => edge(y / height, side) * width;
      const centerX = (y: number) => (edgeX(y, -1) + edgeX(y, 1)) / 2;
      const angleAt = (dx: number) => -Math.atan2(dx, 4) * 180 / Math.PI;
      links.forEach((link, i) => {
        const y = (i + 0.5) * TOOTH_PITCH;
        const side = i % 2 ? 1 : -1;
        const x = edgeX(y, side);
        const angle = angleAt(edgeX(y + 2, side) - edgeX(y - 2, side));
        const transform = `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${angle.toFixed(2)}) scale(${side} 1)`;
        if (linkKeys[i] !== transform) {
          link.setAttribute("transform", transform);
          linkKeys[i] = transform;
        }
      });
      const sliderY = Math.max(12, tip * height);
      const sliderX = centerX(sliderY);
      const sliderAngle = angleAt(centerX(sliderY + 2) - centerX(sliderY - 2));
      slider.setAttribute("transform", `translate(${sliderX} ${sliderY}) rotate(${sliderAngle})`);
      trim.style.opacity = String(1 - split);

      if (splitStartedAt !== null && split < 1 && !splitFrame) {
        splitFrame = requestAnimationFrame(() => {
          splitFrame = 0;
          draw();
        });
      }
    };

    const measure = () => {
      const box = svg.getBoundingClientRect();
      const railBox = source.getBoundingClientRect();
      railLeft = railBox.left - box.left;
      railTop = railBox.top - box.top;
      sx = railBox.width / source.viewBox.baseVal.width;
      sy = Math.max(0.001, railBox.height / source.viewBox.baseVal.height);
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      const count = Math.ceil(height / TOOTH_PITCH);
      if (links.length !== count) {
        links = Array.from({ length: count }, () => {
          const link = document.createElementNS(SVG_NS, "use");
          link.setAttribute("href", `${HARDWARE}#tooth`);
          return link;
        });
        linkKeys = [];
        teeth.replaceChildren(...links);
      }
      svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
      draw(true);
    };

    const resize = new ResizeObserver(measure);
    resize.observe(svg);
    measure();
    resize.observe(source);
    const schedule = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        draw();
      });
    };
    const stops = [progress, arrival].map((value) => value.on("change", schedule));
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(splitFrame);
      resize.disconnect();
      stops.forEach((stop) => stop());
    };
  }, [arrival, progress, railPath, reduced]);

  return (
    <svg className={styles.zipper} ref={svgRef} aria-hidden="true" focusable="false">
      <defs>
        <clipPath id={clipId} clipPathUnits="objectBoundingBox">
          <path ref={leftRef} d="M0 0H1V1H0Z" />
          <path ref={rightRef} />
        </clipPath>
      </defs>
      <g ref={trimRef} style={{ opacity: 0 }}>
        <path ref={tapeRef} className={styles.zipTape} />
        <path ref={stitchesRef} className={styles.zipStitches} />
        <g ref={teethRef} />
        <use ref={sliderRef} href={`${HARDWARE}#slider`} />
      </g>
    </svg>
  );
}
