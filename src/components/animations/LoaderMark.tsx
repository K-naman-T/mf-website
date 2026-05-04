"use client";

import { useEffect, useRef } from "react";
import styles from "./LoaderMark.module.css";

interface LoaderMarkProps {
  onComplete?: () => void;
  duration?: number;
  size?: number;
}

export function LoaderMark({ onComplete, duration = 1200, size = 80 }: LoaderMarkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const startTime = performance.now();

    function draw(progress: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      const cx = canvas!.width / 2;
      const cy = canvas!.height / 2;

      const gap = size * 0.18;
      const r = size * 0.22;
      const total = r * 5 * 2 + gap * 4;
      const startX = cx - total / 2 + r;

      for (let i = 0; i < 5; i++) {
        const x = startX + i * (r * 2 + gap);
        const delay = i * 0.06;
        const t = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
        const eased = 1 - Math.pow(1 - t, 3);

        const scaleY = eased;
        const alpha = eased;

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.fillStyle = "#F01820";

        ctx!.beginPath();
        ctx!.ellipse(x, cy, r, r * scaleY, 0, 0, Math.PI * 2);
        ctx!.fill();
        ctx!.restore();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(() => draw(progress + 0.016 / (duration / 1000)));
      } else {
        onComplete?.();
      }
    }

    animId = requestAnimationFrame(() => draw(0));
    return () => cancelAnimationFrame(animId);
  }, [duration, onComplete, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 3}
      height={size * 2}
      className={styles.canvas}
      aria-label="Loading"
    />
  );
}
