"use client";
import { motion, type Transition } from "motion/react";
import { useReducedMotion } from "../core/useReducedMotion";

export interface MarqueeProps {
  children: React.ReactNode;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
}

export function Marquee({
  children,
  direction = "left",
  speed = 30,
  className,
}: MarqueeProps) {
  const reduced = useReducedMotion();

  const defaultTransition: Transition = {
    duration: speed,
    ease: "linear",
    repeat: Infinity,
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const xValues = direction === "left"
    ? ["0%", "-50%"]
    : ["-50%", "0%"];

  return (
    <div className={className} style={{ overflow: "hidden" }}>
      <motion.div
        style={{
          display: "flex",
          whiteSpace: "nowrap",
          gap: "2em",
        }}
        animate={{ x: xValues }}
        transition={defaultTransition}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}
