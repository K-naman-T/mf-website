"use client";

import { type RefObject, useLayoutEffect, useRef, useState } from "react";
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
import styles from "./process-ribbon/process-ribbon-home.module.css";

interface ProcessRibbonHomeProps {
  eyebrow: string;
  title: string;
  steps: HomeProcessStep[];
  /** Where the end-of-ribbon tag sends people — opens their mail client. */
  email: string;
  /** The scroll container (home <main>). The ribbon scrubs against it. */
  scrollContainerRef: RefObject<HTMLElement | null>;
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
      {/* Giant step numeral — fills the row's open space on mobile so each
          step reads as a composed screen, not a floating text block. */}
      <span className={styles.ghostNum} aria-hidden="true">
        {step.number}
      </span>

      {/* Text — anchored to the left rail column */}
      <motion.article className={styles.textCard} style={{ opacity, y }}>
        <span className={styles.stepNumber}>{step.number}</span>
        <h3 className={styles.stepTitle}>{step.title}</h3>
        <p className={styles.stepBody}>{step.body}</p>
      </motion.article>

      {/* Enlarged glyph — right half of the row, filled by the ink tip */}
      <div className={styles.glyphNode}>
        <motion.div
          className={styles.glyphZone}
          style={{ opacity, scale, y }}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 512 512"
            className={styles.glyph}
            focusable="false"
          >
            <g transform="translate(0 512) scale(0.02 -0.02)" fill="currentColor">
              {PROCESS_GLYPHS[STEP_GLYPHS[index]!].paths.map((d, pi) => (
                <path key={pi} d={d} />
              ))}
            </g>
          </svg>
        </motion.div>
      </div>
    </div>
  );
}

export function ProcessRibbonHome({
  eyebrow,
  title,
  steps,
  email,
  scrollContainerRef,
}: ProcessRibbonHomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Scroll-progress value (0..1 of the section's full passage) at which each
  // row's center reaches the viewport middle — i.e. where the ink tip must be
  // for that row to read as "reached". Derived from measured geometry once the
  // rows have laid out; re-measured on resize/content changes.
  const [stepAt, setStepAt] = useState<number[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const scroller = scrollContainerRef.current;
    if (!section || !scroller) return;
    const measure = () => {
      const vh = scroller.clientHeight;
      const rect = section.getBoundingClientRect();
      // sTop = the section's top in the scroller's scroll space.
      const sTop = rect.top + scroller.scrollTop;
      const H = rect.height;
      const scrollable = Math.max(1, H - vh);
      const rows = Array.from(
        section.querySelectorAll<HTMLElement>(`[data-row]`),
      );
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
  }, [scrollContainerRef, steps.length]);

  // Section-anchored progress inside the scroller. "start start → end end"
  // maps progress 0..1 to the section's full passage through the viewport,
  // matching the stepAt measurement above.
  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Reduced motion: content is visible without scrubbing. The motion value is
  // created unconditionally so hook order stays stable across renders.
  const staticFull = useTransform(() => 1);
  const raw: MotionValue<number> = reduced ? staticFull : scrollYProgress;
  const progress = useSpring(raw, { stiffness: 90, damping: 24, mass: 0.35 });

  const railOpacity = useTransform(progress, [0, 0.05], [0, 1]);
  const trackOpacity = useTransform(progress, [0, 0.05], [0.22, 0.22]);

  // End-of-ribbon CTA: drops in and sways as the ink reaches the actual end of
  // the ribbon (after step 5 and the tail spacer, arriving at the CTA joint).
  const tagOpacity = useTransform(progress, [0.90, 0.97], [0, 1]);
  const tagDrop = useTransform(progress, [0.90, 0.97], [-24, 0]);

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

  const tall = reduced ? "" : styles.sectionTall;

  return (
    <section
      ref={sectionRef}
      data-home-scene
      data-process-ribbon
      className={`${styles.section} ${tall}`}
      aria-label="how we work"
    >
      <div className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{eyebrow}</p>
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>

      {/* Ribbon rail behind everything, left column */}
      <div className={styles.rail} aria-hidden="true">
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          preserveAspectRatio="none"
          className={styles.railSvg}
          suppressHydrationWarning
        >
          {/* ghost track (full path, faint) */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.track}
            style={{ opacity: trackOpacity }}
            suppressHydrationWarning
          />
          {/* ink drawn by scroll */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.ink}
            style={{ pathLength: inkLength, opacity: railOpacity }}
            suppressHydrationWarning
          />
          {/* pulse riding the ink tip */}
          <motion.path
            d={PATH_D}
            pathLength={1}
            className={styles.pulse}
            style={pulseStyle}
            suppressHydrationWarning
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

      {/* Tail spacer: reserves scroll room after the last step so the ribbon
          can draw gracefully down to the CTA joint. */}
      <div className={styles.tail} aria-hidden="true" />

      {/* End-of-ribbon CTA: a swing tag hanging from the rail at the ACTUAL end of the ribbon
          which sticks out into CTA. It drops in as the ink tip reaches the very end. */}
      <motion.div
        className={styles.hangOuter}
        style={{
          opacity: tagOpacity,
          y: tagDrop,
        }}
      >
        <div className={styles.hangInner}>
          <span className={styles.hangString} aria-hidden="true" />
          <a className={styles.tag} href={`mailto:${email}`}>
            <span className={styles.tagText}>reach out</span>
          </a>
        </div>
      </motion.div>
    </section>
  );
}
