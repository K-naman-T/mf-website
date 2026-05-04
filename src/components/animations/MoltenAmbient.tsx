"use client";

import { useEffect, useRef } from "react";
import styles from "./MoltenAmbient.module.css";

interface MoltenAmbientProps {
  speed?: number;
  intensity?: number;
  className?: string;
}

export function MoltenAmbient({ speed = 1, intensity = 0.3, className = "" }: MoltenAmbientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.4;

      const t = time * 0.0008 * speed;
      const blobs: [number, number, number][] = [
        [cx + Math.cos(t) * 40, cy + Math.sin(t * 1.3) * 30, maxR * 0.8],
        [cx + Math.cos(t * 0.7 + 2) * 50, cy + Math.sin(t * 0.9 + 1) * 40, maxR * 0.6],
        [cx + Math.cos(t * 1.2 + 4) * 35, cy + Math.sin(t * 0.8 + 3) * 45, maxR * 0.5],
      ];

      blobs.forEach(([bx, by, r], i) => {
        const grad = ctx!.createRadialGradient(bx, by, 0, bx, by, r);
        grad.addColorStop(0, `rgba(240, 24, 32, ${intensity * 0.15 * (1 - i * 0.2)})`);
        grad.addColorStop(0.5, `rgba(240, 24, 32, ${intensity * 0.08 * (1 - i * 0.2)})`);
        grad.addColorStop(1, "rgba(240, 24, 32, 0)");
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(bx, by, r, 0, Math.PI * 2);
        ctx!.fill();
      });

      const dotCount = 3;
      for (let i = 0; i < dotCount; i++) {
        const angle = t * (0.5 + i * 0.3) + (i * Math.PI * 2) / dotCount;
        const dist = maxR * (0.7 + 0.1 * Math.sin(t * 2 + i));
        const dx = cx + Math.cos(angle) * dist;
        const dy = cy + Math.sin(angle) * dist;
        const dotR = 3 - i * 0.5;
        ctx!.fillStyle = `rgba(240, 24, 32, ${intensity * 0.6})`;
        ctx!.beginPath();
        ctx!.arc(dx, dy, dotR, 0, Math.PI * 2);
        ctx!.fill();
      }

      time += 16;
      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animId);
  }, [speed, intensity]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      className={`${styles.canvas} ${className}`}
      aria-hidden="true"
    />
  );
}
