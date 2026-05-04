"use client";
import React, { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useReducedMotion } from "../core/useReducedMotion";

export interface SpotlightCardProps {
  children: React.ReactNode;
  className?: string;
  color?: string;
  springOptions?: object;
}

export function SpotlightCard({
  children,
  className,
  color = "rgba(255, 255, 255, 0.08)",
  springOptions = { stiffness: 200, damping: 20 },
  ...props
}: SpotlightCardProps) {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const xSpring = useSpring(x, springOptions);
  const ySpring = useSpring(y, springOptions);

  const spotlight = useTransform(
    xSpring,
    [-0.5, 0.5],
    ["-50% 0%", "150% 0%"]
  );
  const spotlightY = useTransform(
    ySpring,
    [-0.5, 0.5],
    ["-50% 0%", "150% 0%"]
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ ...props, position: "relative", overflow: "hidden" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !reduced && setIsHovered(true)}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
        setIsHovered(false);
      }}
      {...(reduced ? {} : { animate: isHovered ? "hovered" : "idle" })}
    >
      {reduced ? null : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(circle at ${xSpring.get() * 100 + 50}% ${ySpring.get() * 100 + 50}%, ${color} 0%, transparent 70%)`,
            pointerEvents: "none",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </motion.div>
  );
}
