"use client";
import { ReactNode } from "react";
import { useReducedMotion } from "../core/useReducedMotion";

interface RedFieldProps {
  children: ReactNode;
  intensity?: "mockup" | "deep" | "subtle";
  className?: string;
}

const gradients = {
  mockup: "radial-gradient(circle at 18% 12%, rgba(255, 48, 48, 0.18), transparent 34%), radial-gradient(circle at 82% 78%, rgba(120, 0, 0, 0.16), transparent 42%), linear-gradient(135deg, var(--mf-red-hot), var(--mf-red-core) 45%, var(--mf-red-shadow))",
  deep: "radial-gradient(circle at 12% 8%, rgba(255, 48, 48, 0.22), transparent 38%), radial-gradient(circle at 85% 85%, rgba(100, 0, 0, 0.20), transparent 46%), linear-gradient(135deg, var(--mf-red-hot), var(--mf-red-core) 42%, var(--mf-red-shadow))",
  subtle: "radial-gradient(circle at 22% 18%, rgba(255, 48, 48, 0.10), transparent 28%), linear-gradient(135deg, var(--mf-red-hot), var(--mf-red-core) 48%, var(--mf-red-shadow))",
};

export function RedField({ children, intensity = "mockup", className = "" }: RedFieldProps) {
  const reduced = useReducedMotion();

  return (
    <div
      className={className}
      style={{
        background: reduced ? "var(--mf-red-core)" : gradients[intensity],
        color: "#000",
      }}
    >
      {children}
    </div>
  );
}
