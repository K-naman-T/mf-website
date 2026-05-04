"use client";

import { useRef, useState } from "react";
import styles from "./ServiceHover.module.css";

interface ServiceHoverProps {
  icon: React.ReactNode;
  label: string;
  index?: number;
  className?: string;
}

export function ServiceHover({ icon, label, index = 0, className = "" }: ServiceHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);

  return (
    <div
      className={`${styles.card} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ "--index": index } as React.CSSProperties}
    >
      <div
        ref={iconRef}
        className={`${styles.iconWrap} ${isHovered ? styles.active : ""}`}
      >
        {icon}
        <div className={styles.pulse} />
      </div>
      <span className={styles.label}>{label}</span>
      <div className={`${styles.border} ${isHovered ? styles.borderActive : ""}`} />
    </div>
  );
}
