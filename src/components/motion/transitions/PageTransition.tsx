"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        style={{ display: "contents" }}
        initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : -8 }}
        transition={{
          duration: reduced ? 0 : 0.44,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}