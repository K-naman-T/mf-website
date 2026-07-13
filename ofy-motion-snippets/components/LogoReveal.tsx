"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

export default function LogoReveal({
  src = "/assets/ofy-short.svg",
  alt = "OFY",
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduce ? 0.01 : 0.8,
        ease: motionTokens.ease.standard,
      }}
    >
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={reduce ? {} : { clipPath: "inset(0 0% 0 0)" }}
        transition={{
          duration: reduce ? 0.01 : 0.9,
          ease: motionTokens.ease.standard,
        }}
      >
        <Image src={src} alt={alt} width={640} height={380} priority />
      </motion.div>
    </motion.div>
  );
}
