"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";
import { useOOPosition } from "@/components/motion/core/OOPositionContext";

function getCoverRadius(cx: number, cy: number, width: number, height: number) {
  return Math.max(
    Math.hypot(cx, cy),
    Math.hypot(width - cx, cy),
    Math.hypot(cx, height - cy),
    Math.hypot(width - cx, height - cy)
  );
}

export function PageMorph({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const { ooRectRef } = useOOPosition();
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [clipReleased, setClipReleased] = useState(reduced);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    if (reduced) {
      setClipReleased(true);
      return;
    }

    setClipReleased(false);
    const releaseTimer = window.setTimeout(() => setClipReleased(true), 620);
    return () => window.clearTimeout(releaseTimer);
  }, [pathname, reduced]);

  const ooRect = ooRectRef.current;
  const cx = ooRect ? ooRect.left + ooRect.width / 2 : viewport.width / 2;
  const cy = ooRect ? ooRect.top + ooRect.height / 2 : 47;
  const logoRadius = ooRect ? Math.hypot(ooRect.width, ooRect.height) * 0.22 : 22;
  const coverRadius = getCoverRadius(cx, cy, viewport.width, viewport.height) + 80;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        className={clipReleased ? "mf-page-morph mf-page-morph-released" : "mf-page-morph"}
        initial={
          reduced
            ? { opacity: 1 }
            : {
                opacity: 0,
                clipPath: `circle(${logoRadius}px at ${cx}px ${cy}px)`,
              }
        }
        animate={
          reduced
            ? { opacity: 1 }
            : {
                opacity: 1,
                clipPath: `circle(${coverRadius}px at ${cx}px ${cy}px)`,
              }
        }
        exit={
          reduced
            ? { opacity: 0 }
            : {
                opacity: 0,
                clipPath: `circle(${coverRadius}px at ${cx}px ${cy}px)`,
              }
        }
        transition={
          reduced
            ? { duration: 0 }
            : {
                duration: 0.52,
                ease: [0.16, 1, 0.3, 1],
                opacity: { duration: 0.38 },
                clipPath: { duration: 0.52 },
              }
        }
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
