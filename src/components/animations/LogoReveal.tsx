"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./LogoReveal.module.css";

interface LogoRevealProps {
  onComplete?: () => void;
  duration?: number;
  className?: string;
}

export function LogoReveal({ onComplete, duration = 2000, className = "" }: LogoRevealProps) {
  const [phase, setPhase] = useState<"idle" | "entering" | "visible" | "exiting">("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const enterTimer = setTimeout(() => setPhase("entering"), 100);
    const visibleTimer = setTimeout(() => {
      setPhase("visible");
      onComplete?.();
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(visibleTimer);
    };
  }, [duration, onComplete]);

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={`${styles.logoWrap} ${phase === "entering" ? styles.entering : ""} ${phase === "visible" ? styles.visible : ""}`}>
        <svg viewBox="0 0 400 100" className={styles.logoSvg} aria-label="Metafloor">
          <g fill="#F01820">
            {/* OO Mark - 5 circles */}
            {[-60, -30, 0, 30, 60].map((x, i) => (
              <ellipse key={i} cx={200 + x} cy={35} rx={12} ry={12} />
            ))}
            {/* Star above */}
            <polygon points="200,8 203,18 213,18 205,24 208,34 200,28 192,34 195,24 187,18 197,18" />
          </g>
          {/* METAFLOOR text bars */}
          <g fill="#FFFFFF" opacity={0.9}>
            {[0,1,2,3,4,5,6,7,8].map(i => (
              <rect key={i} x={60 + i * 28} y={60} width={20} height={6} rx={1} />
            ))}
          </g>
          <g fill="#FFFFFF" opacity={0.7}>
            {[0,1,2,3,4,5,6].map(i => (
              <rect key={i} x={70 + i * 28} y={72} width={16} height={4} rx={1} />
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
