"use client";
import { ReactNode, useRef, useEffect, type ElementType } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
  as?: ElementType;
  distance?: number;
  scale?: number;
}

export function SectionReveal({
  children,
  delay = 0,
  once = true,
  className = "",
  as: Component = "div",
  distance = 26,
  scale = 0.985,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    if (reduced) {
      el.style.opacity = "1";
      el.style.transform = "none";
      el.style.filter = "none";
      return;
    }

    el.style.opacity = "0";
    el.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
    el.style.filter = "blur(8px)";
    el.style.transformOrigin = "50% 60%";
    el.style.willChange = "opacity, transform, filter";
    el.style.transition = [
      `opacity 0.82s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      `transform 0.92s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
      `filter 0.92s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
    ].join(", ");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = "1";
          el.style.transform = "translate3d(0, 0, 0) scale(1)";
          el.style.filter = "blur(0)";
          window.setTimeout(() => {
            el.style.willChange = "auto";
          }, (delay + 1) * 1000);
          if (once) observer.disconnect();
        } else if (!once) {
          el.style.opacity = "0";
          el.style.transform = `translate3d(0, ${distance}px, 0) scale(${scale})`;
          el.style.filter = "blur(8px)";
          el.style.willChange = "opacity, transform, filter";
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, distance, once, reduced, scale]);

  return (
    <Component ref={ref} className={className}>
      {children}
    </Component>
  );
}
