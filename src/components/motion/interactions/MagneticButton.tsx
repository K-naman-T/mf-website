"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  type SpringOptions,
} from "motion/react";
import { useReducedMotion } from "../core/useReducedMotion";

export interface MagneticButtonProps {
  children: React.ReactNode;
  intensity?: number;
  range?: number;
  springOptions?: SpringOptions;
  className?: string;
  as?: "button" | "a";
  href?: string;
  onClick?: () => void;
}

const SPRING_CONFIG: SpringOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 };

export function MagneticButton({
  children,
  intensity = 0.6,
  range = 100,
  springOptions = SPRING_CONFIG,
  className,
  as: Tag = "button",
  href,
  onClick,
}: MagneticButtonProps) {
  const reduced = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, springOptions);
  const springY = useSpring(y, springOptions);

  useEffect(() => {
    if (reduced) return;

    const calculateDistance = (e: MouseEvent) => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const absoluteDistance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      if (isHovered && absoluteDistance <= range) {
        const scale = 1 - absoluteDistance / range;
        x.set(distanceX * intensity * scale);
        y.set(distanceY * intensity * scale);
      } else if (!isHovered) {
        x.set(0);
        y.set(0);
      }
    };

    document.addEventListener("mousemove", calculateDistance);
    return () => document.removeEventListener("mousemove", calculateDistance);
  }, [reduced, isHovered, intensity, range, x, y]);

  const style: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "58px",
    minWidth: "210px",
    padding: "0 28px",
    background: "#000",
    color: "var(--mf-red-core)",
    border: "2px solid #000",
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
  };

  const wrapperProps = Tag === "a" ? { href, onClick } : { onClick };

  return (
    <motion.div
      ref={ref}
      style={{
        display: "inline-flex",
        ...style,
        x: reduced ? 0 : springX,
        y: reduced ? 0 : springY,
      }}
      onMouseEnter={() => !reduced && setIsHovered(true)}
      onMouseLeave={() => {
        if (!reduced) {
          setIsHovered(false);
          x.set(0);
          y.set(0);
        }
      }}
      {...wrapperProps}
    >
      {children}
    </motion.div>
  );
}
