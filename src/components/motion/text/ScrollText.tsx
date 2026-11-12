"use client";

/**
 * ScrollText — letter-by-letter settle for a headline.
 *
 * Technique adapted from Skiper UI `skiper31` (Scroll Effects / Text Scroll animation):
 * every character is offset away from the centre by its distance from the middle of the
 * string, and the run collapses to zero as the reveal progresses. Reworked here to take a
 * plain `active` flag and drive itself with Motion values, so it works inside this project's
 * own scroller instead of mounting Skiper's Lenis root. Words are wrapped individually so the
 * per-character boxes can never break a word mid-way.
 *
 * Skiper UI licence: free tier requires attribution — credited in the manifesto credits line.
 */

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

type ScrollTextProps = {
  text: string;
  active: boolean;
  className?: string;
  /** how far the outermost characters start away from their final position, in px */
  spread?: number;
  /** degrees of X rotation on the same offset */
  rotate?: number;
  duration?: number;
};

export function ScrollText({
  text,
  active,
  className,
  spread = 46,
  rotate = 42,
  duration = 1.05,
}: ScrollTextProps) {
  const reduced = useReducedMotion();
  const progress = useMotionValue(active ? 1 : 0);
  const center = (text.length - 1) / 2;

  useEffect(() => {
    const target = active ? 1 : 0;
    if (reduced) {
      progress.set(target);
      return;
    }
    const controls = animate(progress, target, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [active, duration, progress, reduced]);

  let index = -1;

  return (
    <span className={className} aria-label={text} style={{ perspective: "600px" }}>
      {text.split(" ").map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`}>
          <span style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {[...word].map((char) => {
              index += 1;
              return (
                <Character
                  key={`${char}-${index}`}
                  char={char}
                  distance={index - center}
                  progress={progress}
                  spread={spread}
                  rotate={rotate}
                />
              );
            })}
          </span>
          {wordIndex < text.split(" ").length - 1 ? " " : null}
        </span>
      ))}
    </span>
  );
}

function Character({
  char,
  distance,
  progress,
  spread,
  rotate,
}: {
  char: string;
  distance: number;
  progress: MotionValue<number>;
  spread: number;
  rotate: number;
}) {
  const x = useTransform(progress, [0, 1], [distance * spread, 0]);
  const rotateX = useTransform(progress, [0, 1], [distance * rotate, 0]);
  const opacity = useTransform(progress, [0, 0.4, 1], [0, 0.75, 1]);

  return (
    <motion.span
      aria-hidden
      style={{ display: "inline-block", x, rotateX, opacity, transformOrigin: "center" }}
    >
      {char}
    </motion.span>
  );
}
