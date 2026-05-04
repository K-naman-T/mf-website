"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function CTAButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const reduce = useReducedMotion();

  const styles = {
    primary: "bg-black text-white border border-black",
    secondary: "bg-transparent text-black border border-black",
    ghost: "bg-transparent text-black border border-transparent",
  }[variant];

  return (
    <motion.button
      whileHover={
        reduce
          ? {}
          : {
              x: 0,
              backgroundColor: variant === "primary" ? "#050505" : "#E31B23",
              color: variant === "primary" ? "#F5F5F5" : "#050505",
            }
      }
      whileTap={reduce ? {} : { scale: 0.985 }}
      transition={{ duration: reduce ? 0.01 : 0.18, ease: motionTokens.ease.standard }}
      className={`metafloor-focus-ring inline-flex items-center gap-3 px-5 py-3 text-sm font-bold uppercase tracking-wide ${styles} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <motion.span
        aria-hidden
        whileHover={reduce ? {} : { x: 10 }}
        transition={{ duration: reduce ? 0.01 : 0.18, ease: motionTokens.ease.standard }}
      >
        ↗
      </motion.span>
    </motion.button>
  );
}
