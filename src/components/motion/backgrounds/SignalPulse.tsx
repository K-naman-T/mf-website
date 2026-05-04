"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface SignalPulseProps {
  className?: string;
  density?: number;
  color?: string;
  speed?: number;
}

export function SignalPulse({
  className = "",
  density = 12,
  color = "#F01820",
  speed = 1,
}: SignalPulseProps) {
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

    type Dot = {
      baseX: number; baseY: number;
      phase: number; freq: number;
      size: number; brightness: number;
    };
    const dots: Dot[] = [];

    function initDots(w: number, h: number) {
      dots.length = 0;
      const cols = Math.ceil(Math.sqrt(density * (w / h)));
      const rows = Math.ceil(density / cols);
      const spacingX = w / (cols + 1);
      const spacingY = h / (rows + 1);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          dots.push({
            baseX: spacingX * (c + 1),
            baseY: spacingY * (r + 1),
            phase: Math.random() * Math.PI * 2,
            freq: 0.4 + Math.random() * 0.8,
            size: 1 + Math.random() * 2.5,
            brightness: 0.3 + Math.random() * 0.7,
          });
        }
      }
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const t = time * 0.001 * speed;
      dots.forEach((d) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * d.freq * 3 + d.phase);
        const alpha = d.brightness * (0.2 + 0.8 * pulse);
        const radius = d.size * (0.6 + 0.8 * pulse);

        const grad = ctx!.createRadialGradient(d.baseX, d.baseY, 0, d.baseX, d.baseY, radius * 4);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
        grad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(d.baseX, d.baseY, radius * 4, 0, Math.PI * 2);
        ctx!.fill();
      });

      time += 16;
      animId = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        initDots(canvas.width, canvas.height);
      }
    });
    observer.observe(canvas);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    initDots(canvas.width, canvas.height);

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, [reduced, density, color, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
