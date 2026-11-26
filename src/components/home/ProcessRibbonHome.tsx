"use client";

import {
  type CSSProperties,
  type ReactNode,
  type RefObject,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionStyle,
  type MotionValue,
} from "motion/react";
import { useTheme } from "@/components/ThemeProvider";
import { ProcessZipper } from "./process-ribbon/ProcessZipper";
import { DitherPress, ProcessRibbonGlyph } from "./process-ribbon/ProcessRibbonGlyph";
import type { HomeProcessStep } from "@/lib/cms/types";
import styles from "./process-ribbon/process-ribbon-home.module.css";

interface ProcessRibbonHomeProps {
  steps: HomeProcessStep[];
  closing: (formation: MotionValue<number>) => ReactNode;
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
  // Keep the server and browser path identical across floating-point engines.
  const coordinate = (value: number) => value.toFixed(3);
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
    d += ` C ${coordinate(c1x)} ${coordinate(c1y)}, ${coordinate(c2x)} ${coordinate(c2y)}, ${coordinate(p2[0])} ${coordinate(p2[1])}`;
  }
  return d;
}

const PATH_D = wavePathD();

const STEP_EDGE = 0.32;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const smooth = (start: number, end: number, value: number) => {
  const t = clamp((value - start) / (end - start));
  return t * t * (3 - 2 * t);
};

interface StepCardProps {
  step: HomeProcessStep;
  index: number;
  count: number;
  progress: MotionValue<number>;
  intro: MotionValue<number>;
}

function StepCard({ step, index, count, progress, intro }: StepCardProps) {
  const textOpacity = useTransform(() => {
    const local = progress.get() * count - index;
    const arrival = index === 0 ? 1 : smooth(0.05, STEP_EDGE, local);
    const departure = index === count - 1 ? 1 : 1 - smooth(1 - STEP_EDGE, 0.98, local);
    return arrival * departure * smooth(0.49, 0.72, intro.get());
  });
  const textClip = useTransform(intro, [0.48, 0.88], ["inset(0 0 100% 0)", "inset(0 0 0% 0)"]);

  return (
    <motion.article className={styles.card} style={{ "--step-opacity": textOpacity, "--step-clip": textClip } as MotionStyle}>
      <div className={styles.textCard}>
        <div className={styles.textBlock}>
          <h3 className={styles.stepTitle}>{step.title}</h3>
          <p className={styles.stepBody}>{step.body}</p>
        </div>
        <div className={styles.glyphNode} aria-hidden="true">
          <ProcessRibbonGlyph glyph={STEP_GLYPHS[index % STEP_GLYPHS.length]!} index={index} count={count} progress={progress} intro={intro} />
        </div>
      </div>
    </motion.article>
  );
}

export function ProcessRibbonHome({
  steps,
  closing,
  scrollContainerRef,
}: ProcessRibbonHomeProps) {
  const { theme } = useTheme();
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const railPathRef = useRef<SVGPathElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);
  const [closingReady, setClosingReady] = useState(false);
  const clipId = useId().replace(/:/g, "");
  const glyphs = useMemo(() => steps.map((_, index) => STEP_GLYPHS[index % STEP_GLYPHS.length]!), [steps]);

  const stepEnd = steps.length / (steps.length + 1);
  const progress = useMotionValue(0);
  const stepsProgress = useTransform(progress, [0, stepEnd || 1], [0, 1]);
  const arrival = useMotionValue(0);
  const deckOpacity = useTransform(arrival, [0.12, 0.76], [1, 0]);
  const intro = useMotionValue(0);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const stage = stageRef.current;
    const contact = contactRef.current;
    // The scroller is the home's <main>, which this section sits directly in.
    // Prefer the prop, but fall back to the DOM: a parent's ref is not
    // guaranteed to be attached by the time a child's layout effect runs.
    const scroller: HTMLElement | null =
      scrollContainerRef.current ?? section?.parentElement ?? null;
    if (!scroller || !section || !stage || !contact) return;

    let start = 0;
    let range = 1;
    let overlap = 1;
    let end = 0;
    let anchored = false;
    let lastWidth = 0;
    let scrollFrame = 0;
    let introStarted = false;
    let wallExposed: boolean | undefined;
    let entrance: { stop: () => void } | undefined;

    const applyProgress = () => {
      const p = (scroller.scrollTop - start) / range;
      progress.set(clamp(p));
      const remaining = end - scroller.scrollTop;
      const opening = remaining <= 1 ? 1 : clamp(1 - remaining / overlap);
      arrival.set(opening);
      const exposed = Boolean(reduced) || opening >= 0.98;
      if (wallExposed !== exposed) {
        wallExposed = exposed;
        setClosingReady(exposed);
      }

      const distance = start - scroller.scrollTop;
      const viewport = scroller.clientHeight;
      if (distance > viewport * 0.55 && introStarted) {
        entrance?.stop();
        introStarted = false;
        intro.jump(0);
      }
      if (distance > viewport * 0.06) return;
      if (reduced || p >= 0.42 / Math.max(1, steps.length)) {
        entrance?.stop();
        introStarted = true;
        if (intro.get() !== 1) intro.jump(1);
      } else if (!introStarted) {
        introStarted = true;
        entrance = animate(intro, 1, { duration: 1.12, ease: "linear" });
      }
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
      // The wall stays in the same sticky frame for the slit and full reveal.
      // The contact anchor marks the last scroll position of that frame.
      end = contact.getBoundingClientRect().top - cRect.top + scroller.scrollTop;
      overlap = Math.max(1, stage.offsetHeight * 0.38);
      range = Math.max(1, end - start - overlap);
      applyProgress();
    };

    const onScroll = () => {
      if (scrollFrame) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = 0;
        applyProgress();
      });
    };

    measure();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(section);
    ro.observe(stage);
    window.addEventListener("resize", measure);
    return () => {
      entrance?.stop();
      cancelAnimationFrame(scrollFrame);
      scroller.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [arrival, intro, progress, reduced, scrollContainerRef, steps.length]);

  const smoothed = useSpring(stepsProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });
  // The slit and the teeth ride the same spring as the copy, so the cut no
  // longer steps with raw wheel deltas while the text eases underneath it.
  const zipperProgress = useSpring(progress, {
    stiffness: 90,
    damping: 24,
    mass: 0.35,
  });

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
        <div className={styles.surface} style={{ clipPath: `url(#${clipId})` }}>
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none" className={styles.railSvg} aria-hidden="true">
            <path ref={railPathRef} d={PATH_D} />
          </svg>

          {/* Locked deck: every step is stacked in the same slot and cross-fades
              in and out as the scroll runs. */}
          <motion.div className={styles.deck} style={{ opacity: deckOpacity }}>
            {steps.map((step, index) => (
              <StepCard
                key={step.number}
                step={step}
                index={index}
                count={steps.length}
                progress={smoothed}
                intro={intro}
              />
            ))}
            <DitherPress glyphs={glyphs} progress={smoothed} intro={intro} redInk={theme === "dark"} reduced={reduced} />
          </motion.div>
        </div>
        <div className={styles.closingLayer} inert={!closingReady}>
          {closing(arrival)}
        </div>
        <ProcessZipper
          clipId={clipId}
          railPath={railPathRef}
          progress={zipperProgress}
          arrival={arrival}
          reduced={reduced}
        />
      </div>
      <div id="contact" ref={contactRef} className={styles.contactAnchor} data-home-scene aria-hidden="true" />
    </section>
  );
}
