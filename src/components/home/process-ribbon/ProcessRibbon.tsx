"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { PROCESS_GLYPHS } from "@/components/home/ProcessStepIcon";
import type { HomeProcessStep } from "@/lib/cms/types";
import styles from "./process-ribbon.module.css";

interface ProcessRibbonProps {
  eyebrow: string;
  title: string;
  steps: HomeProcessStep[];
}

// The five process glyphs, in order, matching the live home mapping.
const STEP_GLYPHS = ["target", "hand", "stack", "rocket", "hierarchy"] as const;

// Rail viewBox. The path is nearly vertical with a gentle sway so it reads as
// a wavy ribbon, not a straight rule.
const VB_W = 200;
const VB_H = 2000;
const RAIL_X = 100;

/** Nearly-vertical wavy path down the rail. Y is strictly monotonic so the
    drawn fraction maps cleanly to vertical progress. */
function wavePathD(): string {
  const points: [number, number][] = [];
  const segments = 80;
  const amp = 30;
  const sways = 5.5;
  for (let i = 0; i <= segments; i++) {
    const y = (i / segments) * VB_H;
    const x = RAIL_X + Math.sin((y / VB_H) * Math.PI * 2 * sways) * amp;
    points.push([x, y]);
  }
  let d = `M ${points[0]![0]} ${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(points.length - 1, i + 2)]!;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const PATH_D = wavePathD();

interface StepRowProps {
  step: HomeProcessStep;
  index: number;
  /** smoothed section progress 0..1 */
  progress: MotionValue<number>;
  /** fraction of the section where this row's icon sits */
  at: number;
}

function StepRow({ step, index, progress, at }: StepRowProps) {
  // Row ramps in over the window immediately before the ink tip arrives.
  const from = Math.max(0, at - 0.09);
  const to = Math.min(1, at);
  const opacity = useTransform(progress, [from, to], [0, 1]);
  const y = useTransform(progress, [from, to], [30, 0]);
  const scale = useTransform(progress, [from, to], [0.92, 1]);

  return (
    <div className={styles.stepRow} data-row={index}>
      {/* Icon column — glyph sits centered on the rail line */}
      <div className={styles.railCol}>
        <motion.svg
          viewBox="0 0 512 512"
          className={styles.glyph}
          style={{ opacity, scale, y }}
          aria-hidden="true"
          focusable="false"
        >
          <g transform="translate(0 512) scale(0.02 -0.02)" fill="currentColor">
            {PROCESS_GLYPHS[STEP_GLYPHS[index]!].paths.map((d, pi) => (
              <path key={pi} d={d} />
            ))}
          </g>
        </motion.svg>
      </div>

      {/* Text column */}
      <motion.article
        className={styles.textCard}
        style={{ opacity, y }}
      >
        <span className={styles.stepNumber}>{step.number}</span>
        <h3 className={styles.stepTitle}>{step.title}</h3>
        <p className={styles.stepBody}>{step.body}</p>
      </motion.article>
    </div>
  );
}

export function ProcessRibbon({ eyebrow, title, steps }: ProcessRibbonProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Scroll-progress value (0..1 of useScroll's span) at which each row's
  // center reaches the viewport middle — i.e. where the ink tip must be for
  // that row to read as "reached". Derived from measured geometry:
  //   scrollYProgress(scrollTop) = scrollTop / (H - vh)
  //   row center at viewport middle: scrollTop = f*H - vh/2
  const [stepAt, setStepAt] = useState<number[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const measure = () => {
      const vh = window.innerHeight;
      const rect = section.getBoundingClientRect();
      const scrollEl = section.ownerDocument.scrollingElement;
      if (!scrollEl || rect.height <= 0) return;
      const sTop = rect.top + scrollEl.scrollTop;
      const H = rect.height;
      const scrollable = Math.max(1, H - vh);
      const rows = Array.from(section.querySelectorAll<HTMLElement>(`[data-row]`));
      if (!rows.length) return;
      setStepAt(
        rows.map((row) => {
          const r = row.getBoundingClientRect();
          const centerFromSectionTop = r.top - sTop + r.height / 2;
          // scroll position (px) that puts this row center at viewport middle
          const scrollAtCenter = centerFromSectionTop - vh / 2;
          return Math.min(1, Math.max(0, scrollAtCenter / scrollable));
        }),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [steps.length]);

  // Section-anchored progress. "start start → end end" maps progress 0..1 to
  // the section's full passage through the viewport (top of section at top of
  // viewport → bottom of section at bottom of viewport), which matches the
  // stepAt measurement below exactly when the section is the whole page.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Reduced motion: content is visible without scrubbing. The motion value is
  // created unconditionally so hook order stays stable across renders.
  const staticFull = useTransform(() => 1);
  const raw: MotionValue<number> = reduced ? staticFull : scrollYProgress;
  const progress = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.35 });

  const railOpacity = useTransform(progress, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const trackOpacity = useTransform(progress, [0, 0.05, 0.95, 1], [0.25, 0.25, 0.25, 0]);

  // Ink draws top→bottom: Motion's pathLength (0..1) handles the dash math.
  const inkLength = useTransform(progress, [0, 1], [0, 1]);

  // Pulse rides the ink tip. With pathLength normalized to 1, a dash of 0.05
  // whose offset = inkLength - 0.05 keeps the dash head glued just ahead of
  // the drawn tip as it travels.
  const PULSE_DASH = 0.05;
  const pulseOffset = useTransform(inkLength, (p) => Math.min(0, p - PULSE_DASH));
  const pulseStyle = {
    strokeDasharray: `${PULSE_DASH} ${1 - PULSE_DASH}`,
    strokeDashoffset: pulseOffset,
  };

  return (
    <section ref={sectionRef} className={styles.section}>
      <header className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </header>

      {/* Ribbon rail behind everything, left column */}
      <div className={styles.rail} aria-hidden="true">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className={styles.railSvg}
        >
          {/* ghost track (full path, faint) */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.track}
            style={{ opacity: trackOpacity }}
          />
          {/* ink drawn by scroll */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.ink}
            style={{ pathLength: inkLength, opacity: railOpacity }}
          />
          {/* pulse riding the ink tip */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.pulse}
            style={pulseStyle}
          />
        </svg>
      </div>

      <div className={styles.steps}>
        {steps.map((step, index) => (
          <StepRow
            key={step.number}
            step={step}
            index={index}
            progress={progress}
            at={stepAt[index] ?? (index + 0.5) / steps.length}
          />
        ))}
      </div>

      {/* Tail spacer: keeps the last step's reveal from being crammed
          against the bottom of the scroll range. */}
      <div className={styles.tail} aria-hidden="true" />
    </section>
  );
}
