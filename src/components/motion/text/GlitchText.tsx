"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface GlitchTextProps {
  children: string;
  className?: string;
  trigger?: boolean;
}

export function GlitchText({
  children,
  className,
  trigger = true,
}: GlitchTextProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (reduced || !trigger) return;
    const el = ref.current;
    if (!el) return;

    let active = false;

    const doGlitch = () => {
      if (active || !el) return;
      active = true;
      el.style.textShadow = "2px 0 #00ffff, -2px 0 #ff0080";
      el.style.transform = `translate(${Math.random() * 4 - 2}px, 0)`;
      setTimeout(() => {
        if (!el) return;
        el.style.textShadow = "-2px 0 #00ffff, 2px 0 #ff0080";
        el.style.transform = `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)`;
        setTimeout(() => {
          if (!el) return;
          el.style.textShadow = "none";
          el.style.transform = "none";
          active = false;
        }, 60);
      }, 60);
    };

    intervalRef.current = setInterval(() => {
      if (Math.random() < 0.08) doGlitch();
    }, 150);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (el) {
        el.style.textShadow = "none";
        el.style.transform = "none";
      }
    };
  }, [reduced, trigger]);

  return (
    <span ref={ref} className={className}>
      {children}
    </span>
  );
}
