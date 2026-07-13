"use client";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";

const wordVariants = {
  hidden: { opacity: 0, y: "70%", transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
};

const containerVariants = {
  hidden: { transition: { staggerChildren: 0.03 } },
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

interface WordRevealProps {
  as: "h1" | "h2";
  text: string;
  className?: string;
  active?: boolean;
}

export function WordReveal({ as: Tag, text, className, active = false }: WordRevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(/\s+/);

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        style={{ display: "inline" }}
        variants={containerVariants}
        initial="hidden"
        animate={active ? "visible" : "hidden"}
      >
        {words.map((word, i) => (
          <span key={`w-${i}`}>
            {i > 0 ? " " : null}
            <span
              style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}
              aria-hidden="true"
            >
              <motion.span style={{ display: "inline-block" }} variants={wordVariants}>
                {word}
              </motion.span>
            </span>
          </span>
        ))}
      </motion.span>
    </Tag>
  );
}
