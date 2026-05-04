"use client";

import { useEffect, useRef } from "react";

interface OoBlinkProps {
  repeatDelayMs?: number;
  size?: number;
  className?: string;
}

export function OoBlink({ repeatDelayMs = 10000, size = 32, className = "" }: OoBlinkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const BLINK_DURATION = 600;
    const CLOSE_DURATION = 100;
    const OPEN_DURATION = 150;

    let lastBlinkTime = 0;
    let phase: "open" | "closing" | "closed" | "opening" = "open";
    let startTimeRef = performance.now();

    function draw(cx: number, cy: number, scaleY: number, opacity: number) {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      ctx!.save();
      ctx!.globalAlpha = opacity;
      ctx!.fillStyle = "#F01820";
      ctx!.strokeStyle = "#F01820";
      ctx!.lineWidth = 2;

      const r = size * 0.35;
      const gap = size * 0.08;
      const totalWidth = r * 4 + gap;
      const sx = cx - totalWidth / 2;

      for (let i = 0; i < 5; i++) {
        const ox = sx + r + i * (r * 2 + gap);
        const oy = cy - size * 0.1;
        ctx!.beginPath();
        ctx!.ellipse(ox, oy * scaleY, r, r * scaleY, 0, 0, Math.PI * 2);
        ctx!.fill();
      }

      const starY = cy - size * 0.6 * scaleY;
      const starR = size * 0.12;
      ctx!.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const x = cx + Math.cos(angle) * starR;
        const y = starY + Math.sin(angle) * starR * scaleY;
        i === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
      }
      ctx!.closePath();
      ctx!.fill();
      ctx!.restore();
    }

    function animate(timestamp: number) {
      if (!startTimeRef) startTimeRef = timestamp;
      const elapsed = timestamp - startTimeRef;
      const timeSinceBlink = elapsed - lastBlinkTime;

      if (phase === "open" && timeSinceBlink > repeatDelayMs) {
        phase = "closing";
        lastBlinkTime = elapsed;
      }

      let scaleY = 1;
      let opacity = 1;

      if (phase === "closing") {
        const t = (elapsed - lastBlinkTime) / CLOSE_DURATION;
        scaleY = 1 - 0.7 * Math.min(t, 1);
        if (t >= 1) { phase = "closed"; lastBlinkTime = elapsed; }
      } else if (phase === "closed") {
        scaleY = 0.3;
        const t = (elapsed - lastBlinkTime) / CLOSE_DURATION;
        if (t >= 1) { phase = "opening"; lastBlinkTime = elapsed; }
      } else if (phase === "opening") {
        const t = (elapsed - lastBlinkTime) / OPEN_DURATION;
        scaleY = 0.3 + 0.7 * Math.min(t, 1);
        if (t >= 1) phase = "open";
      }

      draw(canvas!.width / 2, canvas!.height / 2, scaleY, opacity);
      requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [repeatDelayMs, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size * 2}
      height={size * 2}
      className={className}
      aria-label="Metafloor OO signal blink"
    />
  );
}
