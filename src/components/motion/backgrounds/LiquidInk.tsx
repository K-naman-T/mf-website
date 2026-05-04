"use client";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface LiquidInkProps {
  className?: string;
  intensity?: number;
  color1?: string;
  color2?: string;
  speed?: number;
}

function buildPermutation() {
  const p: number[] = [];
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
}

function fade(t: number) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function lerp(a: number, b: number, t: number) {
  return a + t * (b - a);
}

function grad(hash: number, x: number, y: number) {
  const h = hash & 3;
  const u = h < 2 ? x : y;
  const v = h < 2 ? y : x;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function noise2D(x: number, y: number, px: number[], py: number[]) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  const u = fade(x);
  const v = fade(y);
  const a = px[X] + Y;
  const b = px[X + 1] + Y;
  return lerp(
    lerp(grad(py[a], x, y), grad(py[b], x - 1, y), u),
    lerp(grad(py[a + 1], x, y - 1), grad(py[b + 1], x - 1, y - 1), u),
    v
  );
}

export function LiquidInk({
  className = "",
  intensity = 1,
  color1 = "#F01820",
  color2 = "#8A0000",
  speed = 1,
}: LiquidInkProps) {
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
    const p = buildPermutation();
    const px = p;
    const py = p;

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      const t = time * 0.0004 * speed;
      const cx = w / 2;
      const cy = h / 2;

      for (let blob = 0; blob < 5; blob++) {
        const blobT = t + blob * 1.4;
        const bx = cx + Math.cos(blobT * 0.9 + blob) * (w * 0.18);
        const by = cy + Math.sin(blobT * 0.7 + blob * 0.8) * (h * 0.14);

        const n1 = noise2D(bx * 0.004 + t, by * 0.004 + t, px, py);
        const n2 = noise2D(bx * 0.006 - t, by * 0.006 + t * 0.5, px, py);
        const radius = (Math.min(w, h) * 0.28 + n1 * 60 + n2 * 40) * (0.7 + blob * 0.06);

        const grad = ctx!.createRadialGradient(bx, by, 0, bx, by, radius);
        const alpha = (0.12 - blob * 0.018) * intensity;
        grad.addColorStop(0, `${color1}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(0.5, `${color2}${Math.round(alpha * 0.5 * 255).toString(16).padStart(2, "0")}`);
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx!.beginPath();
        const steps = 64;
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const nx = Math.cos(angle);
          const ny = Math.sin(angle);
          const n = noise2D(nx * 0.8 + t + blob, ny * 0.8 + t * 0.7, px, py);
          const r = radius * (1 + n * 0.22);
          const px_i = bx + Math.cos(angle) * r;
          const py_i = by + Math.sin(angle) * r;
          if (i === 0) ctx!.moveTo(px_i, py_i);
          else ctx!.lineTo(px_i, py_i);
        }
        ctx!.closePath();
        ctx!.fillStyle = grad;
        ctx!.fill();
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
  }, [reduced, intensity, color1, color2, speed]);

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
