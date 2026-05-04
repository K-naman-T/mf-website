"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";

type Props = {
  className?: string;
  size?: number;
  title?: string;
};

export default function OOBlinkMark({
  className = "",
  size = 88,
  title = "Metafloor OO mark",
}: Props) {
  const reduce = useReducedMotion();

  const eyeTransition = {
    duration: reduce ? 0.01 : 0.9,
    ease: motionTokens.ease.signal,
    repeat: reduce ? 0 : Infinity,
    repeatDelay: reduce ? 0 : 10,
  } as const;

  const starTransition = {
    duration: reduce ? 0.01 : 0.9,
    ease: motionTokens.ease.signal,
    repeat: reduce ? 0 : Infinity,
    repeatDelay: reduce ? 0 : 10,
  } as const;

  return (
    <div
      className={className}
      style={{ width: size, height: size * 0.48 }}
      aria-label={title}
      role="img"
    >
      <svg viewBox="0 0 176 84" width="100%" height="100%" fill="none">
        <motion.g
          animate={
            reduce
              ? {}
              : {
                  scaleY: [1, 1, 0.82, 1],
                  y: [0, 0, 2, 0],
                }
          }
          transition={eyeTransition}
          style={{ originX: "25%", originY: "50%" }}
        >
          <ellipse cx="42" cy="42" rx="38" ry="32" fill="#050505" />
          <path
            d="M42 18l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z"
            fill="#F5F5F5"
          />
        </motion.g>

        <motion.g
          animate={
            reduce
              ? {}
              : {
                  scaleY: [1, 1, 0.82, 1],
                  y: [0, 0, 2, 0],
                }
          }
          transition={{ ...eyeTransition, delay: 0.06 }}
          style={{ originX: "75%", originY: "50%" }}
        >
          <ellipse cx="134" cy="42" rx="38" ry="32" fill="#050505" />
          <path
            d="M134 18l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z"
            fill="#F5F5F5"
          />
        </motion.g>

        <motion.text
          x="165"
          y="16"
          fontSize="12"
          fontWeight="700"
          fill="#050505"
          animate={reduce ? {} : { opacity: [1, 1, 0.8, 1] }}
          transition={starTransition}
        >
          TM
        </motion.text>
      </svg>
    </div>
  );
}
