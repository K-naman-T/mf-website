"use client";

import { useEffect, useRef, type RefObject } from "react";
import { useScroll, useReducedMotion, useMotionValueEvent } from "motion/react";
import styles from "./nerve.module.css";

interface NerveProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
}

/**
 * Skiper-UI #19 "Svg follow scroll" — a single continuous stroke path drawn
 * by scroll. Adapted from the window-scroll demo to the inner `.page` scroll
 * container, and from the original's linear `pathLength [0.5, 1]` mapping to a
 * viewport-tracking head:
 *
 * The original maps scroll progress linearly onto path length, which on this
 * page's 600dvh height leaves ~74-86% of the drawn arc above the viewport once
 * you pass the first scene — the line visibly "scrolls off the top". Instead
 * the drawn fraction is the path's arc-length at page-y `scrollTop + 62dvh`,
 * so the growth tip (head) stays at a fixed 62% of the viewport height while
 * the drawn trail persists behind it — the line follows the scroll.
 *
 * Geometry is byte-identical to the original (viewBox 1278×2319, same path):
 * the line starts ~17% down the page and its tail overhangs the page bottom
 * by ~15% (clipped by the scroll container).
 */
export const NERVE_PATH_D =
  "M876.605 394.131C788.982 335.917 696.198 358.139 691.836 416.303C685.453 501.424 853.722 498.43 941.95 409.714C1016.1 335.156 1008.64 186.907 906.167 142.846C807.014 100.212 712.699 198.494 789.049 245.127C889.053 306.207 986.062 116.979 840.548 43.3233C743.932 -5.58141 678.027 57.1682 672.279 112.188C666.53 167.208 712.538 172.943 736.353 163.088C760.167 153.234 764.14 120.924 746.651 93.3868C717.461 47.4252 638.894 77.8642 601.018 116.979C568.164 150.908 557 201.079 576.467 246.924C593.342 286.664 630.24 310.55 671.68 302.614C756.114 286.446 729.747 206.546 681.86 186.442C630.54 164.898 492 209.318 495.026 287.644C496.837 334.494 518.402 366.466 582.455 367.287C680.013 368.538 771.538 299.456 898.634 292.434C1007.02 286.446 1192.67 309.384 1242.36 382.258C1266.99 418.39 1273.65 443.108 1247.75 474.477C1217.32 511.33 1149.4 511.259 1096.84 466.093C1044.29 420.928 1029.14 380.576 1033.97 324.172C1038.31 273.428 1069.55 228.986 1117.2 216.384C1152.2 207.128 1188.29 213.629 1194.45 245.127C1201.49 281.062 1132.22 280.104 1100.44 272.673C1065.32 264.464 1044.22 234.837 1032.77 201.413C1019.29 162.061 1029.71 131.126 1056.44 100.965C1086.19 67.4032 1143.96 54.5526 1175.78 86.1513C1207.02 117.17 1186.81 143.379 1156.22 166.691C1112.57 199.959 1052.57 186.238 999.784 155.164C957.312 130.164 899.171 63.7054 931.284 26.3214C952.068 2.12513 996.288 3.87363 1007.22 43.58C1018.15 83.2749 1003.56 122.644 975.969 163.376C948.377 204.107 907.272 255.122 913.558 321.045C919.727 385.734 990.968 497.068 1063.84 503.35C1111.46 507.456 1166.79 511.984 1175.68 464.527C1191.52 379.956 1101.26 334.985 1030.29 377.017C971.109 412.064 956.297 483.647 953.797 561.655C947.587 755.413 1197.56 941.828 936.039 1140.66C745.771 1285.32 321.926 950.737 134.536 1202.19C-6.68295 1391.68 -53.4837 1655.38 131.935 1760.5C478.381 1956.91 1124.19 1515 1201.28 1997.83C1273.66 2451.23 100.805 1864.7 303.794 2668.89";

export const NERVE_VIEWBOX = { width: 1278, height: 2319 } as const;

const Y_SCALE = 600 / NERVE_VIEWBOX.height;
const LUT_SAMPLES = 4000;
const HEAD_OFFSET_DVH = 62;
const SCROLL_RANGE_DVH = 500;
const TAIL_BOOST_START_DVH = 430;

export default function Nerve({ scrollContainerRef }: NerveProps) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ container: scrollContainerRef });
  const rootRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const lutRef = useRef<Float32Array | null>(null);
  const showComplete = reducedMotion !== false;

  const draw = (progress: number) => {
    const root = rootRef.current;
    const path = pathRef.current;
    if (!root || !path) return;
    if (showComplete) {
      path.style.strokeDasharray = "1 1";
      root.dataset.nerveProgress = "1.0000";
      return;
    }
    root.dataset.nerveProgress = progress.toFixed(4);
    const lut = lutRef.current;
    if (!lut) return;
    const scrollTopDvh = progress * SCROLL_RANGE_DVH;
    const targetDvh =
      scrollTopDvh +
      HEAD_OFFSET_DVH +
      Math.max(0, scrollTopDvh - TAIL_BOOST_START_DVH);
    let head = 0;
    for (let i = LUT_SAMPLES; i >= 0; i--) {
      if (lut[i] <= targetDvh) {
        head = i / LUT_SAMPLES;
        break;
      }
    }
    path.style.strokeDasharray = `${head} 1`;
  };

  useMotionValueEvent(scrollYProgress, "change", (v) => draw(v));

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    path.setAttribute("pathLength", "1");
    const total = path.getTotalLength();
    const lut = new Float32Array(LUT_SAMPLES + 1);
    for (let i = 0; i <= LUT_SAMPLES; i++) {
      lut[i] = path.getPointAtLength((total * i) / LUT_SAMPLES).y * Y_SCALE;
    }
    lutRef.current = lut;
    draw(scrollYProgress.get());
  }, [showComplete, scrollYProgress]);

  return (
    <div
      className={styles.nerveRoot}
      data-nerve
      aria-hidden
      ref={rootRef}
      data-nerve-progress="0.0000"
    >
      <svg
        data-nerve-svg
        viewBox={`0 0 ${NERVE_VIEWBOX.width} ${NERVE_VIEWBOX.height}`}
        preserveAspectRatio="none"
        className={styles.nerveSvg}
      >
        <path
          data-nerve-guide
          ref={pathRef}
          d={NERVE_PATH_D}
          className={styles.nerveGuide}
        />
      </svg>
    </div>
  );
}
