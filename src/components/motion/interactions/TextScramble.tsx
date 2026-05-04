"use client";
import { type JSX, useEffect, useState, useCallback } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "../core/useReducedMotion";

export interface TextScrambleProps {
  children: string;
  duration?: number;
  speed?: number;
  characterSet?: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  trigger?: boolean;
  onScrambleComplete?: () => void;
}

const defaultChars =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function TextScramble({
  children,
  duration = 0.8,
  speed = 0.04,
  characterSet = defaultChars,
  as: Component = "p",
  className,
  trigger = true,
  onScrambleComplete,
}: TextScrambleProps) {
  const reduced = useReducedMotion();
  const [scrambledText, setScrambledText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const text = children;
  const displayText = scrambledText ?? children;

  const scramble = useCallback(async () => {
    if (isAnimating) return;
    setIsAnimating(true);

    const steps = duration / speed;
    let step = 0;

    const interval = setInterval(() => {
      let scrambled = "";
      const progress = step / steps;

      for (let i = 0; i < text.length; i++) {
        if (text[i] === " ") {
          scrambled += " ";
          continue;
        }
        if (progress * text.length > i) {
          scrambled += text[i];
        } else {
          scrambled += characterSet[Math.floor(Math.random() * characterSet.length)];
        }
      }

      setScrambledText(scrambled);
      step++;

      if (step > steps) {
        clearInterval(interval);
        setScrambledText(null);
        setIsAnimating(false);
        onScrambleComplete?.();
      }
    }, speed * 1000);
  }, [isAnimating, text, duration, speed, characterSet, onScrambleComplete]);

  useEffect(() => {
    if (!trigger || reduced) return;
    scramble();
  }, [trigger, reduced, scramble]);

  return (
    <motion.p className={className}>
      {reduced ? text : displayText}
    </motion.p>
  );
}
