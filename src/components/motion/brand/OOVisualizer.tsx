"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface OOVisualizerProps {
  className?: string;
  size?: number;
  color?: string;
  speed?: number;
}

export function OOVisualizer({
  className = "",
  size = 120,
  color = "#F01820",
  speed = 1,
}: OOVisualizerProps) {
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (reduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const hexColor = color;
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const t = time * 0.001 * speed;
      const count = 5;

      for (let i = 0; i < count; i++) {
        const phase = t * 1.5 + (i / count) * Math.PI * 2;
        const squeeze = 0.5 + 0.5 * Math.abs(Math.sin(phase));
        const outerR = (size / 2) * (0.5 + i * 0.1);
        const innerRatio = 0.45;

        const alpha = i === 0 ? 1 : 0.25 + 0.55 * (1 - i / count);
        const lineWidth = 2.5 - i * 0.3;

        ctx!.beginPath();
        ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        ctx!.lineWidth = lineWidth;

        const leftCX = cx - size * 0.22;
        const rightCX = cx + size * 0.22;

        ctx!.ellipse(leftCX, cy, outerR * 0.5, outerR * squeeze, 0, 0, Math.PI * 2);
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.ellipse(rightCX, cy, outerR * 0.5, outerR * squeeze, 0, 0, Math.PI * 2);
        ctx!.stroke();

        if (i === 0) {
          const pulseR = outerR * 0.3 * (0.8 + 0.2 * Math.sin(t * 4));
          ctx!.beginPath();
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
          ctx!.ellipse(leftCX, cy, pulseR * 0.5, pulseR * squeeze, 0, 0, Math.PI * 2);
          ctx!.fill();

          ctx!.beginPath();
          ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
          ctx!.ellipse(rightCX, cy, pulseR * 0.5, pulseR * squeeze, 0, 0, Math.PI * 2);
          ctx!.fill();
        }
      }

      time += 16;
      animId = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
    });
    observer.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [reduced, size, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: size,
        height: size,
        display: "block",
      }}
      aria-hidden="true"
    />
  );
}
