"use client";
import { motion } from "motion/react";
import { useReducedMotion } from "../core/useReducedMotion";

export interface TextShimmerProps {
  children: string;
  className?: string;
  speed?: number;
  as?: React.ElementType;
}

export function TextShimmer({
  children,
  className,
  speed = 2,
  as: Component = "p",
}: TextShimmerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <Component className={className}>{children}</Component>;
  }

  return (
    <Component className={className}>
      <motion.span
        style={{
          background: "linear-gradient(90deg, #F01820 0%, #FF9500 25%, #fff 50%, #F01820 75%, #F01820 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {children}
      </motion.span>
    </Component>
  );
}
