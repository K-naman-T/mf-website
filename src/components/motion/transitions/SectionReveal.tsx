"use client";
import { ReactNode, useRef, useEffect } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
}

export function SectionReveal({
  children,
  delay = 0,
  once = true,
  className = "",
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || !ref.current) return;

    const el = ref.current;
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = `opacity 0.55s ease ${delay}s, transform 0.55s ease ${delay}s`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translateY(0)";
          if (once) observer.disconnect();
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = "translateY(20px)";
        }
      },
      { threshold: 0.08 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, once, reduced]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
