"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { useReducedMotion } from "@/components/motion/core/useReducedMotion";
import styles from "./menu-animations.module.css";

/**
 * MenuAnimation — a morphing menu/close control, driven by GSAP.
 *
 * Adapted from the community `menu-animations` component for this repo:
 * - Controlled via `active` (maps to a drawer/menu open state) with an optional
 *   internal toggle when `active` is not provided.
 * - Colors follow `currentColor` so it themes with its container (CSS vars).
 * - Respects `prefers-reduced-motion` (no gsap tween; just the two visual
 *   states swap instantly).
 * - Registers CustomEase once, guarded.
 *
 * `animationId` selects the visual language:
 *   dots-grid | text-morph | plus-morph | circle-pulse | cube-spin |
 *   stacked-circles | rotating-circles | isometric-cube | expanding-circles
 */

// --- GSAP setup (module-once) ---------------------------------------------
let gsapInitialized = false;
function initializeGsap() {
  if (gsapInitialized) return;
  gsap.registerPlugin(CustomEase);
  CustomEase.create("circleEase", "0.68, -0.55, 0.265, 1.55");
  gsapInitialized = true;
}

export type MenuAnimationId =
  | "dots-grid"
  | "text-morph"
  | "plus-morph"
  | "circle-pulse"
  | "cube-spin"
  | "stacked-circles"
  | "rotating-circles"
  | "isometric-cube"
  | "expanding-circles";

interface MenuAnimationProps {
  /** Which morph language to render. */
  animationId: MenuAnimationId;
  /** Optional controlled open state. When omitted the component toggles
      internally on click. */
  active?: boolean;
  /** Called with the new active state (controlled mode). */
  onActiveChange?: (active: boolean) => void;
  /** Label for a11y. */
  label?: string;
  /** Compact icon-only mode for navbar triggers (no 220px demo cell). */
  compact?: boolean;
  /** Title shown above the icon in the standalone demo cell. */
  title?: string;
  className?: string;
}

function renderGlyph(animationId: MenuAnimationId) {
  switch (animationId) {
    case "dots-grid":
      return (
        <div className={styles.dotsGrid}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.dot} />
          ))}
        </div>
      );
    case "text-morph":
      return (
        <div className={styles.textMorph}>
          <div className={styles.textClip}>
            <span className={styles.menuText}>MENU</span>
            <span className={styles.closeText}>CLOSE</span>
          </div>
          <div className={styles.circle} />
        </div>
      );
    case "plus-morph":
      return (
        <div className={styles.plusMorph}>
          <div className={`${styles.bar} ${styles.barH}`} />
          <div className={`${styles.bar} ${styles.barV}`} />
        </div>
      );
    case "circle-pulse":
      return (
        <div className={styles.circlePulse}>
          <div className={styles.core} />
          <div className={styles.ring} />
          <div className={styles.wave} />
          <div className={styles.particles}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.particle} />
            ))}
          </div>
        </div>
      );
    case "cube-spin":
      return (
        <div className={styles.cubeSpin}>
          <div className={styles.cube}>
            <div className={`${styles.face} ${styles.faceFront}`}>
              <div className={styles.plusSymbol}>
                <div className={styles.symH} />
                <div className={styles.symV} />
              </div>
            </div>
            <div className={`${styles.face} ${styles.faceRight}`}>
              <div className={styles.xSymbol}>
                <div className={styles.symA} />
                <div className={styles.symB} />
              </div>
            </div>
            <div className={`${styles.face} ${styles.faceBack}`} />
            <div className={`${styles.face} ${styles.faceLeft}`} />
          </div>
        </div>
      );
    case "stacked-circles":
      return (
        <div className={styles.stackedCircles}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={styles.circle} />
          ))}
        </div>
      );
    case "rotating-circles":
      return (
        <div className={styles.rotatingCircles}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={styles.circle} />
          ))}
        </div>
      );
    case "isometric-cube":
      return (
        <div className={styles.isometricCube}>
          <div className={styles.cube}>
            {["front", "back", "right", "left", "top", "bottom"].map((face) => (
              <div key={face} className={`${styles.face} ${styles[`face${face[0].toUpperCase()}${face.slice(1)}`]}`}>
                {(face === "front" || face === "back") && (
                  <div className={styles.cubeIcon}>
                    {face === "front" ? (
                      <>
                        <div className={styles.symH} />
                        <div className={styles.symV} />
                      </>
                    ) : (
                      <>
                        <div className={styles.symA} />
                        <div className={styles.symB} />
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    case "expanding-circles":
      return (
        <div className={styles.expandingCircles}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`extra-${i}`} className={`${styles.circle} ${styles.extra}`} />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={`micro-${i}`} className={`${styles.circle} ${styles.micro}`} />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={`main-${i}`} className={styles.circle} />
          ))}
        </div>
      );
    default:
      return null;
  }
}

// GSAP state machine per animation. Each returns init/activate/deactivate.
// Selectors are scoped to the local ref (gsap.context), so plain class names
// are safe.
const animConfig: Record<
  MenuAnimationId,
  { init: (root: HTMLElement) => void; activate: (root: HTMLElement) => void; deactivate: (root: HTMLElement) => void }
> = {
  "dots-grid": {
    init: (root) =>
      gsap.set(root.querySelectorAll(`.${styles.dot}`), { scale: 1, opacity: 1, x: 0, y: 0 }),
    activate: (root) => {
      const dots = root.querySelectorAll(`.${styles.dot}`);
      const s = styles.dot;
      const positions = [
        { el: dots[0], x: 30, y: 30 },
        { el: dots[1], x: 0, y: 0 },
        { el: dots[2], x: -30, y: 30 },
        { el: dots[3], x: 0, y: 0 },
        { el: dots[4], x: 0, y: 0 },
        { el: dots[5], x: 0, y: 0 },
        { el: dots[6], x: 30, y: -30 },
        { el: dots[7], x: 0, y: 0 },
        { el: dots[8], x: -30, y: -30 },
      ];
      gsap.to(dots, { scale: 1.2, opacity: 0.6, duration: 0.4, ease: "circleEase" });
      positions.forEach(({ el, x, y }) => {
        if (el) gsap.to(el, { x, y, duration: 0.6, ease: "circleEase" });
      });
      void s;
    },
    deactivate: (root) =>
      gsap.to(root.querySelectorAll(`.${styles.dot}`), {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "circleEase",
      }),
  },
  "text-morph": {
    init: (root) => {
      gsap.set(root.querySelector(`.${styles.menuText}`), { y: 0 });
      gsap.set(root.querySelector(`.${styles.closeText}`), { y: 24 });
      gsap.set(root.querySelector(`.${styles.circle}`), { x: 0, scaleX: 1, borderRadius: "50%" });
    },
    activate: (root) => {
      const menu = root.querySelector(`.${styles.menuText}`);
      const close = root.querySelector(`.${styles.closeText}`);
      const circle = root.querySelector(`.${styles.circle}`);
      const tl = gsap.timeline();
      tl.to(menu, { y: -24, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.to(close, { y: 0, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.to(circle, { x: 24, scaleX: 2.6, borderRadius: "4px", duration: 0.2, ease: "power1.out" }, 0)
        .to(circle, { x: 0, scaleX: 1, borderRadius: "50%", duration: 0.2, ease: "power1.in" });
    },
    deactivate: (root) => {
      const menu = root.querySelector(`.${styles.menuText}`);
      const close = root.querySelector(`.${styles.closeText}`);
      const circle = root.querySelector(`.${styles.circle}`);
      const tl = gsap.timeline();
      tl.to(menu, { y: 0, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.to(close, { y: 24, duration: 0.4, ease: "power2.inOut" }, 0);
      tl.to(circle, { x: 24, scaleX: 2.6, borderRadius: "4px", duration: 0.2, ease: "power1.out" }, 0)
        .to(circle, { x: 0, scaleX: 1, borderRadius: "50%", duration: 0.2, ease: "power1.in" });
    },
  },
  "plus-morph": {
    init: (root) => gsap.set(root, { rotation: 0 }),
    activate: (root) => gsap.to(root, { rotation: 405, duration: 0.6, ease: "power1.inOut" }),
    deactivate: (root) => gsap.to(root, { rotation: 0, duration: 0.6, ease: "power1.inOut" }),
  },
  "circle-pulse": {
    init: (root) => {
      gsap.set(root.querySelector(`.${styles.core}`), { scale: 1 });
      gsap.set(root.querySelector(`.${styles.ring}`), { scale: 0.4, opacity: 0 });
      gsap.set(root.querySelector(`.${styles.wave}`), { scale: 0.4, opacity: 0 });
      gsap.set(root.querySelectorAll(`.${styles.particle}`), { x: 0, y: 0, scale: 1, opacity: 1 });
    },
    activate: (root) => {
      const core = root.querySelector(`.${styles.core}`);
      const ring = root.querySelector(`.${styles.ring}`);
      const wave = root.querySelector(`.${styles.wave}`);
      gsap.to(core, { scale: 0.6, duration: 0.4, ease: "power2.out" });
      gsap.to(ring, { scale: 1.5, opacity: 0.8, duration: 0.5, ease: "power2.out" });
      gsap.to(wave, { scale: 2.6, opacity: 0.3, duration: 0.8, ease: "power1.out" });
      root.querySelectorAll(`.${styles.particle}`).forEach((p, i) => {
        const angle = (i / 8) * Math.PI * 2;
        gsap.to(p, {
          x: Math.cos(angle) * 22,
          y: Math.sin(angle) * 22,
          duration: 0.5,
          ease: "power2.out",
          delay: i * 0.04,
        });
      });
    },
    deactivate: (root) => {
      gsap.to(root.querySelector(`.${styles.core}`), { scale: 1, duration: 0.4, ease: "power2.out" });
      gsap.to(root.querySelector(`.${styles.ring}`), { scale: 0.4, opacity: 0, duration: 0.4, ease: "power2.in" });
      gsap.to(root.querySelector(`.${styles.wave}`), { scale: 0.4, opacity: 0, duration: 0.4, ease: "power2.in" });
      gsap.to(root.querySelectorAll(`.${styles.particle}`), { x: 0, y: 0, duration: 0.4, ease: "power2.in" });
    },
  },
  "cube-spin": {
    init: (root) => gsap.set(root.querySelector(`.${styles.cube}`), { rotationY: 0 }),
    activate: (root) => gsap.to(root.querySelector(`.${styles.cube}`), { rotationY: -450, duration: 1, ease: "circleEase" }),
    deactivate: (root) => gsap.to(root.querySelector(`.${styles.cube}`), { rotationY: 0, duration: 1, ease: "circleEase" }),
  },
  "stacked-circles": {
    init: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      circles.forEach((c, i) =>
        gsap.set(c, { xPercent: -50, yPercent: -50, x: 5 * i }),
      );
    },
    activate: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      circles.forEach((c, i) => gsap.to(c, { x: -40 + 20 * i, duration: 0.6, ease: "circleEase" }));
    },
    deactivate: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      circles.forEach((c, i) => gsap.to(c, { x: 5 * i, duration: 0.6, ease: "circleEase" }));
    },
  },
  "rotating-circles": {
    init: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      circles.forEach((c, i) => {
        gsap.set(c, {
          x: (i - 2.5) * 9,
          y: 0,
          scale: 1,
          opacity: 1 - i * 0.1,
          zIndex: 6 - i,
          xPercent: -50,
          yPercent: -50,
        });
      });
    },
    activate: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      gsap.to(circles, {
        rotation: (i: number) => (i + 1) * 60,
        transformOrigin: "0px 16px",
        duration: 0.6,
        ease: "circleEase",
        stagger: 0.05,
      });
    },
    deactivate: (root) => {
      const circles = root.querySelectorAll(`.${styles.circle}`);
      gsap.to(circles, { rotation: 0, duration: 0.6, ease: "circleEase", stagger: { amount: 0.3, from: "end" } });
    },
  },
  "isometric-cube": {
    init: (root) => {
      gsap.set(root.querySelector(`.${styles.cube}`), { rotateX: 35.264, rotateY: 45, rotateZ: 0 });
    },
    activate: (root) =>
      gsap.to(root.querySelector(`.${styles.cube}`), { rotateY: 225, duration: 0.7, ease: "power2.inOut" }),
    deactivate: (root) =>
      gsap.to(root.querySelector(`.${styles.cube}`), { rotateY: 45, duration: 0.7, ease: "power2.inOut" }),
  },
  "expanding-circles": {
    init: (root) => {
      const all = root.querySelectorAll(`.${styles.circle}`);
      const main = root.querySelectorAll(`.${styles.circle}:not(.${styles.extra}):not(.${styles.micro})`);
      gsap.set(root, { rotation: 0 });
      gsap.set(all, { scale: 0, opacity: 0, xPercent: -50, yPercent: -50 });
      main.forEach((c, i) => {
        const angle = (i * 60 * Math.PI) / 180;
        gsap.set(c, { x: Math.cos(angle) * 16, y: Math.sin(angle) * 16, scale: 1, opacity: 1 });
      });
    },
    activate: (root) => {
      const all = root.querySelectorAll(`.${styles.circle}`);
      gsap
        .timeline()
        .to(root, { rotation: 360, duration: 1.1, ease: "power1.inOut" })
        .to(all, { scale: 1, opacity: 1, stagger: 0.02, duration: 0.3, ease: "power2.out" }, 0.1);
    },
    deactivate: (root) => {
      const main = root.querySelectorAll(`.${styles.circle}:not(.${styles.extra}):not(.${styles.micro})`);
      const others = root.querySelectorAll(`.${styles.circle}.${styles.extra}, .${styles.circle}.${styles.micro}`);
      gsap
        .timeline()
        .to(root, { rotation: 0, duration: 1.1, ease: "power1.inOut" })
        .to(others, { scale: 0, opacity: 0, duration: 0.3, ease: "power2.in" }, 0)
        .to(main, { scale: 1, opacity: 1, duration: 0.3 }, 0.1);
    },
  },
};

export function MenuAnimation({
  animationId,
  active: activeProp,
  onActiveChange,
  label = "Toggle menu",
  compact = true,
  title,
  className,
}: MenuAnimationProps) {
  const reduced = useReducedMotion();
  const isControlled = activeProp !== undefined;
  const [internalActive, setInternalActive] = React.useState(false);
  const active = isControlled ? activeProp : internalActive;
  const rootRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    initializeGsap();
  }, []);

  // init once on mount, then run activate/deactivate as state changes.
  const config = animConfig[animationId];
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || reduced) return;
    const ctx = gsap.context(() => {
      if (animRef.current) config.init(animRef.current);
    }, root);
    ctxRef.current = ctx;
    return () => {
      ctx.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animationId, reduced]);

  const runState = useCallback(
    (next: boolean) => {
      const root = rootRef.current;
      if (!root) return;
      if (reduced) return;
      const el = animRef.current;
      if (!el) return;
      if (next) config.activate(el);
      else config.deactivate(el);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [animationId, reduced],
  );

  useEffect(() => {
    runState(active);
  }, [active, runState]);

  const handleClick = useCallback(() => {
    if (isControlled) {
      onActiveChange?.(!activeRef.current);
    } else {
      setInternalActive((v) => !v);
    }
  }, [isControlled, onActiveChange]);

  const content = (
    <div ref={animRef} className={styles[`${animationId}`]}>
      {renderGlyph(animationId)}
    </div>
  );

  if (compact) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-expanded={active}
        onClick={handleClick}
        className={`${styles.trigger} ${className ?? ""}`}
        style={{ background: "transparent", border: "none", cursor: "pointer", color: "inherit", padding: 0 }}
      >
        <span ref={rootRef}>{content}</span>
      </button>
    );
  }

  return (
    <div ref={rootRef} className={`${styles.cell} ${className ?? ""}`}>
      {title && <div className={styles.cellTitle}>{title}</div>}
      <button
        type="button"
        aria-label={label}
        aria-expanded={active}
        onClick={handleClick}
        style={{ background: "transparent", border: "none", cursor: "pointer", padding: 0, color: "inherit" }}
      >
        {content}
      </button>
    </div>
  );
}
