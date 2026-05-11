"use client";
import { ReactNode, useRef, useState } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface DirectionalFillButtonProps {
  children: ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: "primary" | "secondary";
}

export function DirectionalFillButton({
  children,
  onClick,
  href,
  className = "",
  variant = "primary",
}: DirectionalFillButtonProps) {
  const reduced = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const btnRef = useRef<HTMLDivElement>(null);

  const isPrimary = variant === "primary";

  const style: React.CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    minHeight: "58px",
    minWidth: "min(210px, 100%)",
    maxWidth: "100%",
    boxSizing: "border-box",
    padding: "0 28px",
    background: isPrimary ? "#000" : "transparent",
    color: isPrimary ? "var(--mf-red-core)" : "#000",
    border: "2px solid #000",
    cursor: "pointer",
    transition: reduced ? "none" : "background-color 0.22s ease, color 0.22s ease",
  };

  const fillStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    background: isPrimary ? "var(--mf-red-core)" : "#000",
    transform: reduced ? "scaleX(1)" : hovered ? "scaleX(1)" : "scaleX(0)",
    transformOrigin: "left",
    transition: reduced ? "none" : "transform 0.28s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
    zIndex: 0,
  };

  const textStyle: React.CSSProperties = {
    position: "relative",
    zIndex: 1,
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: "13px",
    fontWeight: 800,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: hovered
      ? isPrimary ? "#000" : "#fff"
      : isPrimary ? "var(--mf-red-core)" : "#000",
    transition: reduced ? "none" : "color 0.22s ease",
  };

  const Wrapper = href ? "a" : "button";
  const wrapperProps = href ? { href, onClick } : { onClick };

  return (
    <div
      ref={btnRef}
      className={className}
      style={style}
      onMouseEnter={() => !reduced && setHovered(true)}
      onMouseLeave={() => !reduced && setHovered(false)}
      {...wrapperProps}
    >
      <div style={fillStyle} />
      <span style={textStyle}>{children}</span>
    </div>
  );
}
