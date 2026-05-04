"use client";

import { useRef, useState } from "react";
import styles from "./CtaHover.module.css";

interface CtaHoverProps {
  children: React.ReactNode;
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

export function CtaHover({ children, href, variant = "primary", className = "" }: CtaHoverProps) {
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = () => {
    timeoutRef.current = setTimeout(() => setHovered(true), 80);
  };

  const handleLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHovered(false);
  };

  const Tag = href ? "a" : "button";

  return (
    <Tag
      href={href}
      className={`${styles.btn} ${styles[variant]} ${hovered ? styles.active : ""} ${className}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span className={styles.label}>{children}</span>
      <span className={styles.arrowWrap}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={styles.arrow}>
          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <div className={styles.shimmer} />
    </Tag>
  );
}
