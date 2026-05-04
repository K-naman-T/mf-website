"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface InkSplatterProps {
  className?: string;
  density?: number;
}

export function InkSplatter({ className = "", density = 6 }: InkSplatterProps) {
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

    const blobs: {
      x: number; y: number; vx: number; vy: number;
      r: number; life: number; maxLife: number;
      hue: number; sat: number; lig: number;
    }[] = [];

    function spawnBlob(w: number, h: number) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * 1.2;
      const maxLife = 80 + Math.random() * 120;
      blobs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 2 + Math.random() * 8,
        life: 0,
        maxLife,
        hue: Math.random() * 20 - 10,
        sat: 70 + Math.random() * 20,
        lig: 15 + Math.random() * 25,
      });
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      if (time % 4 === 0 && blobs.length < density * 3) {
        spawnBlob(w, h);
      }

      for (let i = blobs.length - 1; i >= 0; i--) {
        const b = blobs[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.01;
        b.life++;
        b.r *= 0.998;

        const progress = b.life / b.maxLife;
        const alpha = progress < 0.1
          ? progress * 10
          : progress > 0.7
            ? (1 - progress) / 0.3
            : 1;

        const grad = ctx!.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 2);
        grad.addColorStop(0, `hsla(0, ${b.sat}%, ${b.lig}%, ${alpha * 0.9})`);
        grad.addColorStop(0.4, `hsla(0, ${b.sat}%, ${b.lig * 0.7}%, ${alpha * 0.5})`);
        grad.addColorStop(1, "hsla(0, 60%, 10%, 0)");

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(b.x, b.y, b.r * 2, 0, Math.PI * 2);
        ctx!.fill();

        if (b.life >= b.maxLife || b.r < 0.5) {
          blobs.splice(i, 1);
        }
      }

      time++;
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
  }, [reduced, density]);

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
