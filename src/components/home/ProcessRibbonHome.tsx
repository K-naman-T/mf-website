"use client";

import {
  type CSSProperties,
  type RefObject,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { PROCESS_GLYPHS } from "@/components/home/ProcessStepIcon";
import type { HomeProcessStep } from "@/lib/cms/types";
import styles from "./process-ribbon/process-ribbon-home.module.css";

interface ProcessRibbonHomeProps {
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

/** Portion of a step's scroll band spent fading in, and again fading out.
    The two windows meet at the band edge, so exactly one step is on screen at
    a time — never two copies of the copy stacked on each other. */
const FADE_SHARE = 0.36;

interface StepBand {
  keys: number[];
  opacity: number[];
  y: number[];
}

/**
 * The step stack is pinned for the whole section, so steps hand over one at a
 * time: each card owns an equal band of the section's scroll, rises into it,
 * holds, then drifts up and out as the next one takes over. The first card is
 * already standing when the section locks; the last one stays until the tag
 * lands.
 */
function stepBand(index: number, count: number): StepBand {
  if (count <= 1) {
    return { keys: [0, 1], opacity: [1, 1], y: [0, 0] };
  }
  const span = 1 / count;
  const from = index * span;
  const to = from + span;
  const fade = span * FADE_SHARE;

  if (index === 0) {
    return { keys: [to - fade, to], opacity: [1, 0], y: [0, -22] };
  }
  if (index === count - 1) {
    return { keys: [from, from + fade], opacity: [0, 1], y: [26, 0] };
  }
  return {
    keys: [from, from + fade, to - fade, to],
    opacity: [0, 1, 1, 0],
    y: [26, 0, 0, -22],
  };
}

interface StepCardProps {
  step: HomeProcessStep;
  index: number;
  count: number;
  /** smoothed section progress 0..1 */
  progress: MotionValue<number>;
}

function StepCard({ step, index, count, progress }: StepCardProps) {
  const band = useMemo(() => stepBand(index, count), [index, count]);
  const opacity = useTransform(progress, band.keys, band.opacity);
  const y = useTransform(progress, band.keys, band.y);

  return (
    <motion.article className={styles.card} style={{ opacity, y }}>
      <div className={styles.textCard}>
        {/* Giant outlined numeral — a mobile device, set behind the step copy */}
        <span className={styles.ghostNum} aria-hidden="true">
          {step.number}
        </span>

        <div className={styles.textBlock}>
          <span className={styles.stepNumber}>{step.number}</span>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepBody}>{step.body}</p>
        </div>

        {/* Enlarged glyph — the right half of the stage on desktop, the bead
            on the ribbon beside the step number on mobile. */}
        <div className={styles.glyphNode} aria-hidden="true">
          <div className={styles.glyphZone}>
            <svg viewBox="0 0 512 512" className={styles.glyph} focusable="false">
              <g transform="translate(0 512) scale(0.02 -0.02)" fill="currentColor">
                {PROCESS_GLYPHS[STEP_GLYPHS[index]!].paths.map((d, pi) => (
                  <path key={pi} d={d} />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

export function ProcessRibbonHome({
  title,
  steps,
  email,
  scrollContainerRef,
}: ProcessRibbonHomeProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);

  // The ribbon is taller than the window and streams upward as it draws, so
  // the ink tip travels down the locked stage instead of the whole ribbon
  // sliding past. Travel is measured: rail length minus how far down the stage
  // the tip must end (the tag's grommet).
  const [travel, setTravel] = useState(0);

  // Section-anchored progress, driven off the scroller's own scroll position
  // against measured pixel bounds — not Motion's viewport-relative offsets,
  // which shift the moment a mobile address bar hides and make the pin look
  // like it reverses. The bounds are the sticky stage's own range, so progress
  // reaches 1 exactly as the stage bottoms out and the tag lands.
  const progress = useMotionValue(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const rail = railRef.current;
    const tag = tagRef.current;
    // The scroller is the home's <main>, which this section sits directly in.
    // Prefer the prop, but fall back to the DOM: a parent's ref is not
    // guaranteed to be attached by the time a child's layout effect runs.
    const scroller: HTMLElement | null =
      scrollContainerRef.current ?? section?.parentElement ?? null;
    if (!scroller || !section || !stage || !rail || !tag) return;

    let start = 0;
    let range = 1;
    let anchored = false;
    let lastWidth = 0;
    let ticking = false;

    const applyProgress = () => {
      const p = (scroller.scrollTop - start) / range;
      progress.set(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    const measure = () => {
      const sRect = section.getBoundingClientRect();
      const cRect = scroller.getBoundingClientRect();
      const nextStart = sRect.top - cRect.top + scroller.scrollTop;
      // While the stage is locked, hold the anchor. A mobile address bar
      // sliding in or out rescales the viewport-height scenes above this one,
      // which moves its absolute position by ~60px — re-anchoring mid-pin
      // would yank the ribbon backwards. Off the lock, re-anchor freely.
      const stageTop = stage.getBoundingClientRect().top;
      const locked = stageTop <= 0.5 && sRect.bottom >= stage.offsetHeight - 0.5;
      const width = scroller.clientWidth;
      const resized = width !== lastWidth;
      lastWidth = width;
      if (!anchored || !locked || resized) {
        start = nextStart;
        anchored = true;
      }
      range = Math.max(1, sRect.height - stage.offsetHeight);
      // The tag's grommet is where the ink must land: the ribbon streams up by
      // everything beyond it, and the step deck holds the tag's own height plus
      // a gap as bottom padding.
      const gap = 24;
      setTravel(Math.max(0, rail.offsetHeight - tag.offsetTop));
      stage.style.setProperty(
        "--tag-zone",
        `${stage.offsetHeight - tag.offsetTop + gap}px`,
      );
      applyProgress();
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        applyProgress();
        ticking = false;
      });
    };

    measure();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(stage);
    ro.observe(rail);
    window.addEventListener("resize", measure);
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [progress, scrollContainerRef, steps.length]);

  // Reduced motion needs no branch in the render here: the media query stops
  // the lock, hides the rail and pins every card and the tag at rest, so the
  // scrub values below are simply never seen. Branching on it would desync
  // server and client markup.
  const smoothed = useSpring(progress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });

  const railOpacity = useTransform(smoothed, [0, 0.03], [0, 1]);
  const trackOpacity = useTransform(smoothed, [0, 0.03], [0.22, 0.22]);

  // Ink draws top→bottom: Motion's pathLength (0..1) handles the dash math.
  const inkLength = useTransform(smoothed, [0, 1], [0, 1]);

  // The ribbon streams up by the measured travel as the ink length grows, so
  // the drawn tip walks down the locked stage at p·travel instead of the rail
  // running off the top.
  const railY = useTransform(smoothed, [0, 1], [0, -travel]);

  // End-of-ribbon CTA: the tag is strung on the grommet the ink tip lands on,
  // and drops in as the tip arrives.
  const tagOpacity = useTransform(smoothed, [0.93, 0.995], [0, 1]);
  const tagDrop = useTransform(smoothed, [0.93, 0.995], [-22, 0]);

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
    <section
      ref={sectionRef}
      data-home-scene
      data-process-ribbon
      className={styles.section}
      style={{ "--steps": steps.length } as CSSProperties}
      aria-label="engagements"
    >
      <div ref={stageRef} className={styles.stage}>
        {/* Ribbon rail behind everything, left column */}
        <div className={styles.rail} aria-hidden="true">
          <motion.div
            ref={railRef}
            className={styles.railTrack}
            style={{ y: railY }}
          >
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
          </motion.div>
        </div>

        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{title}</h2>
        </header>

        {/* Locked deck: every step is stacked in the same slot and cross-fades
            in and out as the scroll runs. */}
        <div className={styles.deck}>
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              count={steps.length}
              progress={smoothed}
            />
          ))}
        </div>

        {/* End-of-ribbon CTA: an ink tag on the red field (a red tag with a
            black label on the dark field), strung on the ribbon's last inch. */}
        <motion.div
          ref={tagRef}
          className={styles.hangOuter}
          style={{ opacity: tagOpacity, y: tagDrop }}
        >
          <div className={styles.hangInner}>
            <span className={styles.hangString} aria-hidden="true" />
            <a className={styles.tag} href={`mailto:${email}`}>
              <span className={styles.tagText}>reach out</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
