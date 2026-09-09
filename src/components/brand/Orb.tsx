"use client";

import Link from "next/link";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type MouseEventHandler,
} from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import {
  BAYER_8,
  BAYER_CELL,
  BAYER_THRESHOLD,
  BAYER_TILE,
  bayerMaskImage,
} from "./orb-glyph";
import {
  emotionForState,
  layoutOrbPose,
  nextOrbEmotion,
  ORB_VIEWBOX,
  type OrbEmotion,
  type OrbVisualState,
} from "./orb-layout";
import styles from "./orb.module.css";

const INSTANCE_SPRING = { type: "spring" as const, stiffness: 380, damping: 28, mass: 0.7 };
const SHAPE_SPRING = { type: "spring" as const, stiffness: 280, damping: 24, mass: 0.85 };
const LEAN_SPRING = { stiffness: 220, damping: 24, mass: 0.4 };
const LOOK_SPRING = { stiffness: 180, damping: 22, mass: 0.35 };

export interface OrbProps {
  label: string;
  href?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  size?: number;
  animate?: boolean;
  paused?: boolean;
  dither?: boolean;
  cycleEmotions?: boolean;
  state?: OrbVisualState;
  className?: string;
  decorative?: boolean;
}

export function Orb({
  label,
  href,
  onClick,
  size = 44,
  animate = true,
  paused = false,
  dither = false,
  cycleEmotions = false,
  state,
  className = "",
  decorative = false,
}: OrbProps) {
  const reactId = useId().replace(/:/g, "");
  const patternId = `ofy-bayer-${reactId}`;
  const reduced = useReducedMotion();
  const freeze = !!reduced || !animate;
  const rootRef = useRef<HTMLElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [ready, setReady] = useState(false);
  const [blinking, setBlinking] = useState(false);
  const [mood, setMood] = useState<OrbEmotion>("calm");

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!cycleEmotions) return;
    let timer = 0;
    const tick = () => {
      setMood((current) => nextOrbEmotion(current));
      timer = window.setTimeout(tick, 2200 + Math.random() * 1800);
    };
    timer = window.setTimeout(tick, 700);
    return () => window.clearTimeout(timer);
  }, [cycleEmotions]);

  useEffect(() => {
    if (freeze || paused) return;
    let wait = 0;
    let close = 0;
    const loop = () => {
      wait = window.setTimeout(() => {
        setBlinking(true);
        close = window.setTimeout(() => {
          setBlinking(false);
          loop();
        }, 90);
      }, 2200 + Math.random() * 2800);
    };
    loop();
    return () => {
      window.clearTimeout(wait);
      window.clearTimeout(close);
    };
  }, [freeze, paused]);

  const visual: OrbVisualState =
    state ?? (hovered || focused ? "attend" : "idle");
  const shownEmotion: OrbEmotion = pressed
    ? "sleepy"
    : hovered || focused
      ? "alert"
      : cycleEmotions
        ? mood
        : emotionForState(visual);
  const pose = layoutOrbPose(shownEmotion);
  const blinkLid = blinking && shownEmotion !== "surprised" ? 0.12 : 1;
  const shapeT = freeze ? { duration: 0 } : SHAPE_SPRING;

  const leanX = useMotionValue(0);
  const leanY = useMotionValue(0);
  const lookX = useMotionValue(0);
  const lookY = useMotionValue(0);
  const springX = useSpring(leanX, LEAN_SPRING);
  const springY = useSpring(leanY, LEAN_SPRING);
  const springLookX = useSpring(lookX, LOOK_SPRING);
  const springLookY = useSpring(lookY, LOOK_SPRING);

  useEffect(() => {
    if (freeze || paused || hovered || focused) return;
    let timer = 0;
    const wander = () => {
      lookX.set((Math.random() - 0.5) * 10);
      lookY.set((Math.random() - 0.5) * 7);
      timer = window.setTimeout(wander, 1200 + Math.random() * 2200);
    };
    timer = window.setTimeout(wander, 500);
    return () => window.clearTimeout(timer);
  }, [freeze, paused, hovered, focused, lookX, lookY]);

  useEffect(() => {
    if (freeze || paused || !hovered) {
      if (!hovered) {
        leanX.set(0);
        leanY.set(0);
      }
      return;
    }

    const onMove = (event: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      const range = Math.max(72, size * 0.5);
      if (dist > range) {
        leanX.set(0);
        leanY.set(0);
        lookX.set(0);
        lookY.set(0);
        return;
      }
      const t = 1 - dist / range;
      leanX.set(dx * 0.12 * t);
      leanY.set(dy * 0.12 * t);
      lookX.set(Math.max(-6, Math.min(6, dx * 0.04 * t)));
      lookY.set(Math.max(-5, Math.min(5, dy * 0.04 * t)));
    };

    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, [freeze, hovered, leanX, leanY, lookX, lookY, paused, size]);

  const bayerCells = [];
  if (dither) {
    for (let y = 0; y < BAYER_8.length; y++) {
      const row = BAYER_8[y]!;
      for (let x = 0; x < row.length; x++) {
        if (row[x]! < BAYER_THRESHOLD) {
          bayerCells.push(
            <rect
              key={`${x}-${y}`}
              x={x * BAYER_CELL}
              y={y * BAYER_CELL}
              width={BAYER_CELL}
              height={BAYER_CELL}
              fill="white"
            />,
          );
        }
      }
    }
  }

  const svg = (
    <svg
      className={styles.svg}
      viewBox={`0 0 ${ORB_VIEWBOX} ${ORB_VIEWBOX}`}
      aria-hidden="true"
      focusable="false"
      style={
        dither
          ? ({
              "--orb-bayer": bayerMaskImage(),
              "--orb-bayer-size": `${BAYER_TILE}px ${BAYER_TILE}px`,
            } as CSSProperties)
          : undefined
      }
    >
      <defs>
        {dither ? (
          <pattern
            id={patternId}
            width={BAYER_TILE}
            height={BAYER_TILE}
            patternUnits="userSpaceOnUse"
            data-orb-bayer=""
          >
            {bayerCells}
          </pattern>
        ) : null}
      </defs>
      <motion.g
        style={{
          x: freeze ? 0 : springX,
          y: freeze ? 0 : springY,
        }}
        animate={{ scale: !freeze && pressed ? 0.94 : 1 }}
        transition={freeze ? { duration: 0 } : INSTANCE_SPRING}
        data-orb-lean=""
      >
        <motion.g
          data-orb-spin=""
          data-orb-mark=""
          style={{
            x: freeze ? 0 : springLookX,
            y: freeze ? 0 : springLookY,
          }}
        >
          {pose.os.map((o, index) => (
            <motion.g
              key={index}
              data-orb-instance=""
              data-index={index}
              initial={false}
              animate={{
                x: o.cx,
                y: o.cy,
                rotate: o.rotate,
                opacity: o.opacity,
              }}
              transition={shapeT}
            >
              <motion.ellipse
                cx={0}
                cy={0}
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                initial={false}
                animate={{
                  rx: (o.rx + o.holeRx) / 2,
                  ry: (o.ry * blinkLid + Math.max(0.4, o.holeRy * blinkLid)) / 2,
                  strokeWidth: Math.max(1.8, o.rx - o.holeRx),
                }}
                transition={shapeT}
              />
            </motion.g>
          ))}
        </motion.g>
      </motion.g>
    </svg>
  );

  const style = { "--orb-size": `${size}px` } as CSSProperties;
  const rootClass = `${styles.root} ${className}`.trim();

  const setRootRef = (node: HTMLElement | null) => {
    rootRef.current = node;
  };

  const interact = {
    className: rootClass,
    style,
    "aria-label": decorative ? undefined : label,
    "data-orb": "",
    "data-state": visual,
    "data-emotion": shownEmotion,
    "data-ready": ready ? "true" : "false",
    onPointerEnter: () => setHovered(true),
    onPointerLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onMouseOver: () => setHovered(true),
    onMouseOut: (event: ReactMouseEvent<HTMLElement>) => {
      const next = event.relatedTarget as Node | null;
      if (next && event.currentTarget.contains(next)) return;
      setHovered(false);
      setPressed(false);
    },
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => {
      setHovered(false);
      setPressed(false);
    },
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onMouseDown: () => setPressed(true),
    onMouseUp: () => setPressed(false),
  };

  if (decorative || !href) {
    return (
      <span
        ref={setRootRef}
        {...interact}
        aria-hidden={decorative ? true : undefined}
      >
        {svg}
      </span>
    );
  }

  const isAppHref = href.startsWith("/") || href.startsWith("#");
  if (!isAppHref) {
    return (
      <a ref={setRootRef} href={href} onClick={onClick} {...interact}>
        {svg}
      </a>
    );
  }

  return (
    <Link ref={setRootRef} href={href} onClick={onClick} {...interact}>
      {svg}
    </Link>
  );
}
