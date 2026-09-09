"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";

export type AnnotationType = "circle" | "underline" | "highlight" | "box" | "strike-through";

export interface RoughAnnotationProps {
  children: React.ReactNode;
  type?: AnnotationType;
  color?: string;
  strokeWidth?: number;
  active?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  padding?: number;
}

export function RoughAnnotation({
  children,
  type = "circle",
  color = "#FF0000",
  strokeWidth = 2.5,
  active = true,
  delay = 0.2,
  duration = 0.65,
  className = "",
  padding = 6,
}: RoughAnnotationProps) {
  const reduced = useReducedMotion();
  const containerRef = useRef<HTMLSpanElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 10),
          height: Math.max(rect.height, 10),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      observer.disconnect();
    };
  }, []);

  const textW = dimensions.width;
  const textH = dimensions.height;

  // Calculate dynamic padding so that the annotation clears the text accurately
  let padX = padding;
  let padY = padding;

  if (type === "circle") {
    padX = Math.max(padding, textH * 0.35, textW * 0.08, 22);
    padY = Math.max(padding, textH * 0.18, 10);
  } else if (type === "underline") {
    padX = Math.max(padding, 10);
    padY = Math.max(padding, 8);
  } else if (type === "highlight") {
    padX = Math.max(padding, 10);
    padY = Math.max(padding, 6);
  } else if (type === "box") {
    padX = Math.max(padding, 14);
    padY = Math.max(padding, 8);
  } else if (type === "strike-through") {
    padX = Math.max(padding, 10);
    padY = Math.max(padding, 6);
  }

  const w = textW + padX * 2;
  const h = textH + padY * 2;

  const renderPath = () => {
    if (w <= 0 || h <= 0 || textW <= 0 || textH <= 0) return null;

    const dynamicStroke = Math.max(strokeWidth, Math.min(3.6, textH * 0.048));

    switch (type) {
      case "circle": {
        const mX = Math.max(8, textH * 0.16);
        const mY = Math.max(3.5, textH * 0.09);

        const xL = padX - mX;
        const xR = w - padX + mX;
        const yT = padY - mY;
        const yB = h - padY + mY;
        const r = (yB - yT) / 2;

        // Natural, fluid hand-drawn loop that stays clean and never crosses text bounds
        const pathData = `
          M ${xL + r * 0.6}, ${yT - 0.5}
          C ${xL + textW * 0.35}, ${yT - 2.5} ${xR - textW * 0.2}, ${yT - 2} ${xR + 2}, ${yT - 0.5}
          C ${xR + r * 0.75}, ${yT + r * 0.3} ${xR + r * 0.75}, ${yB - r * 0.3} ${xR + 2}, ${yB + 1}
          C ${xR - textW * 0.2}, ${yB + 3} ${xL + textW * 0.35}, ${yB + 2.5} ${xL - 2}, ${yB + 1}
          C ${xL - r * 0.75}, ${yB - r * 0.3} ${xL - r * 0.75}, ${yT + r * 0.3} ${xL + 2}, ${yT - 1.5}
          C ${xL + textW * 0.25}, ${yT - 3} ${xL + textW * 0.5}, ${yT - 2.5} ${xL + Math.min(textW * 0.8, textW + 4)}, ${yT - 1}
        `;
        return (
          <motion.path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={dynamicStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    pathLength: { duration, delay, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.1, delay },
                  }
            }
          />
        );
      }

      case "underline": {
        // Natural hand-drawn underline positioned cleanly below text baseline
        const yBase = padY + textH + 0.5;
        const xStart = padX * 0.15;
        const xEnd = w - padX * 0.15;
        const pathData = `
          M ${xStart}, ${yBase}
          Q ${padX + textW * 0.35}, ${yBase + 2} ${padX + textW * 0.7}, ${yBase - 0.5}
          T ${xEnd}, ${yBase + 1}
        `;
        return (
          <motion.path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={dynamicStroke * 1.15}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    pathLength: { duration: duration * 0.8, delay, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.1, delay },
                  }
            }
          />
        );
      }

      case "highlight": {
        // Marker fill streak across text (rendered behind text with organic marker edge)
        const yMid = padY + textH * 0.52;
        const xStart = Math.max(0, padX - 4);
        const xEnd = w - Math.max(0, padX - 4);
        const pathData = `
          M ${xStart}, ${yMid}
          Q ${w * 0.5}, ${yMid - 1.5} ${xEnd}, ${yMid + 1.5}
        `;
        return (
          <motion.path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={Math.max(16, textH * 0.75)}
            strokeLinecap="round"
            style={{ opacity: 0.4 }}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 0.4 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    pathLength: { duration: duration * 0.7, delay, ease: [0.25, 1, 0.5, 1] },
                    opacity: { duration: 0.1, delay },
                  }
            }
          />
        );
      }

      case "box": {
        // Organic sketch box surrounding text cleanly
        const mX = Math.max(8, textH * 0.14);
        const mY = Math.max(6, textH * 0.10);
        const xL = padX - mX;
        const xR = w - padX + mX;
        const yT = padY - mY;
        const yB = h - padY + mY;
        const pathData = `
          M ${xL + 2}, ${yT}
          L ${xR - 2}, ${yT + 1.5}
          L ${xR}, ${yB - 1}
          L ${xL - 1}, ${yB + 1}
          Z
        `;
        return (
          <motion.path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={dynamicStroke}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    pathLength: { duration, delay, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.1, delay },
                  }
            }
          />
        );
      }

      case "strike-through": {
        const yMid = padY + textH * 0.52;
        const xStart = Math.max(0, padX - 4);
        const xEnd = w - Math.max(0, padX - 4);
        const pathData = `
          M ${xStart}, ${yMid + 1.5}
          L ${xEnd}, ${yMid - 1.5}
        `;
        return (
          <motion.path
            d={pathData}
            fill="none"
            stroke={color}
            strokeWidth={dynamicStroke * 1.1}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={
              active
                ? { pathLength: 1, opacity: 1 }
                : { pathLength: 0, opacity: 0 }
            }
            transition={
              reduced
                ? { duration: 0 }
                : {
                    pathLength: { duration: duration * 0.6, delay, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.1, delay },
                  }
            }
          />
        );
      }

      default:
        return null;
    }
  };

  const isBehind = type === "highlight";

  return (
    <span
      ref={containerRef}
      className={`relative inline-block ${className}`}
      style={{
        whiteSpace: "nowrap",
        marginInline: type === "circle" ? "12px" : "3px",
      }}
    >
      <span className="relative z-10">{children}</span>
      {dimensions.width > 0 && (
        <svg
          className={`absolute pointer-events-none ${isBehind ? "z-0" : "z-20"}`}
          style={{
            position: "absolute",
            top: -padY,
            left: -padX,
            width: `${w}px`,
            height: `${h}px`,
            maxWidth: "none",
            maxHeight: "none",
            overflow: "visible",
          }}
          viewBox={`0 0 ${w} ${h}`}
          aria-hidden="true"
        >
          {renderPath()}
        </svg>
      )}
    </span>
  );
}
