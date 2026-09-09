"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import styles from "./OfyViceCityNeon.module.css";

export interface OfyViceCityNeonProps {
  className?: string;
  animated?: boolean;
  interactive?: boolean;
  showControls?: boolean;
  defaultPower?: boolean;
  igniteOnMount?: boolean;
  isSurging?: boolean;
  glowIntensity?: "subtle" | "medium" | "high";
  onClick?: () => void;
}

const STAR_LEFT = "M197.28 0.129317C257.639 -2.37486 357.111 31.3609 329.151 112.634C296.323 208.043 124.134 246.196 44.0571 201.171C-22.5053 163.741 -6.58047 96.6609 44.9872 54.198C88.1356 18.6569 142.372 2.40055 197.28 0.129317ZM80.5492 94.5894C87.3106 101.644 104.125 108 112.65 114.648C118.319 119.065 118.732 121.669 117.284 128.566C114.477 141.894 103.446 161.861 109.722 175.131C111.881 179.698 115.003 179.74 119.484 179.507C143.432 178.267 154.852 150.372 172.329 137.26C183.442 145.064 191.861 156.645 202.95 164.623C215.34 173.542 223.242 175.838 224.585 156.72C225.587 142.369 218.244 131.462 220.007 117.684C222.174 100.696 250.967 87.2099 262.249 75.729C275.295 62.4593 253.11 63.2414 244.351 63.7072C231.217 64.3978 218.414 69.689 206.274 70.8205C198.752 71.5193 197.887 70.313 194.474 63.9901C191.473 58.441 179.511 30.8367 175.702 29.0231C172.402 27.459 169.264 29.8134 166.805 31.8268C161.427 36.2361 155.143 49.3727 151.52 56.0117C149.352 59.9884 145.68 70.0384 142.615 72.3928C138.862 75.2797 123.495 74.3563 117.907 74.9137C103.882 76.303 88.3135 79.4645 75.6318 85.7291C75.3811 86.8772 79.4493 93.433 80.5411 94.5727L80.5492 94.5894Z";
const STAR_RIGHT = "M151.889 0.27362C205.937 -2.68069 286.752 17.8973 296.15 81.0904C307.19 155.284 208.178 200.299 147.472 203.712C93.665 206.74 9.76065 186.278 0.816018 122.794C-10.0125 46.018 89.4081 3.68749 151.889 0.27362ZM86.3924 175.512C88.0134 177.379 93.2561 177.999 95.6657 177.853C104.895 177.313 123.639 162.615 131.028 156.48C133.744 154.226 139.483 147.646 141.835 146.289C144.938 144.488 146.858 146.173 149.239 148.069C158.891 155.765 168.946 169.508 178.701 176.022C182.571 178.604 184.462 178.524 188.091 175.694C201.329 165.365 189.756 143.204 184.842 131.401C174.875 107.482 188.61 104.542 204.206 91.7186C209.208 87.6117 224.403 75.2693 213.37 70.7029C200.818 71.7168 187.266 75.0505 174.831 75.6705C164.726 76.1738 158.658 74.2991 154.007 64.9256C148.596 54.0129 147.953 39.2851 142.397 28.2338C141.689 26.8332 139.556 25.3087 138.038 26.2715C136.344 27.3438 126.837 42.9251 125.296 45.7773C118.71 57.9738 114.132 71.6366 107.254 83.7456C103.793 86.9042 84.1581 88.0421 78.3313 89.1436C71.088 90.5223 57.0175 94.6656 51.5266 99.4582C49.7085 101.041 48.584 101.946 49.0513 104.652C49.7742 108.846 67.6416 117.439 72.0226 118.833C81.1571 121.743 95.5561 119.671 94.5047 132.597C93.4751 145.21 87.5242 160.105 85.7937 172.907C85.5747 173.878 85.728 174.746 86.3924 175.512Z";
const PATH_O = "M 255 330 C 190 310, 125 355, 105 435 C 85 500, 115 565, 175 570 C 240 575, 285 515, 290 435 C 295 365, 260 325, 215 335 C 185 342, 170 375, 190 390 C 215 405, 255 380, 260 350";
const PATH_F_STEM = "M 325 430 C 355 370, 395 295, 425 285 C 448 278, 448 315, 415 400 C 385 470, 360 550, 345 625 C 338 648, 360 658, 378 620 C 395 575, 400 500, 400 450";
const PATH_F_CROSS = "M 315 440 C 365 428, 420 422, 460 435";
const PATH_Y = "M 465 390 C 475 455, 505 485, 535 480 C 560 475, 578 435, 585 385 C 570 485, 540 585, 510 655 C 492 690, 465 678, 480 635 C 495 590, 535 565, 580 550";
const PATH_SWASH = "M 90 600 C 240 645, 450 630, 770 515";

export function OfyViceCityNeon({
  className,
  animated = true,
  interactive = true,
  showControls = false,
  defaultPower = true,
  igniteOnMount = false,
  isSurging: externalSurging,
  glowIntensity = "high",
  onClick,
}: OfyViceCityNeonProps) {
  const [isOn, setIsOn] = React.useState(defaultPower);
  const [internalSurging, setInternalSurging] = React.useState(false);
  const [isIgniting, setIsIgniting] = React.useState(igniteOnMount);

  React.useEffect(() => {
    if (igniteOnMount) {
      setIsIgniting(true);
      const timer = setTimeout(() => {
        setIsIgniting(false);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [igniteOnMount]);

  const isSurging = externalSurging !== undefined ? externalSurging : internalSurging;

  const handleTogglePower = () => {
    if (!isOn) {
      setIsOn(true);
      setIsIgniting(true);
      setTimeout(() => setIsIgniting(false), 1400);
    } else {
      setIsOn(false);
      setIsIgniting(false);
    }
  };

  const triggerSparkSurge = () => {
    if (!isOn) return;
    setInternalSurging(true);
    setTimeout(() => setInternalSurging(false), 350);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className={cn(
          styles.neonContainer,
          isOn ? (isIgniting ? styles.igniting : "") : styles.poweredOff,
          isSurging && styles.containerSurge,
          className
        )}
        onMouseEnter={() => interactive && triggerSparkSurge()}
        onClick={() => {
          if (onClick) onClick();
          if (interactive) triggerSparkSurge();
        }}
        role="img"
        aria-label="OddFromYou OFY Animated Vice City Neon Logo"
        style={{ cursor: interactive ? "pointer" : "default" }}
      >
        <svg
          viewBox="-120 -80 1060 900"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          overflow="visible"
          style={{ overflow: "visible" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="vc-neon-filter" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="2.5" result="blur1" />
              <feGaussianBlur stdDeviation="7" result="blur2" />
              <feGaussianBlur stdDeviation="16" result="blur3" />
              <feGaussianBlur stdDeviation="32" result="blur4" />
              <feMerge>
                <feMergeNode in="blur4" />
                <feMergeNode in="blur3" />
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <radialGradient id="vc-ambient-radial" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FF003C" stopOpacity={glowIntensity === "high" ? "0.24" : "0.14"} />
              <stop offset="60%" stopColor="#FF003C" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#FF003C" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="vc-glass-black" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1A1A24" />
              <stop offset="50%" stopColor="#0A0A0F" />
              <stop offset="100%" stopColor="#020205" />
            </linearGradient>
          </defs>

          {/* Ambient Background Halo - Smooth transparent diffusion */}
          <ellipse
            id="vc-ambient-halo"
            className={cn(animated && styles.ambientHalo)}
            cx="400"
            cy="380"
            rx="420"
            ry="340"
            fill="url(#vc-ambient-radial)"
          />

          {/* Piece 1: Underline Swash */}
          <g className={cn("mf-intro-piece mf-intro-swash", animated && styles.mainTubes)} id="vc-piece-swash" data-piece="swash">
            <path d={PATH_SWASH} className="vc-trace-swash" transform="translate(14, 16)" fill="none" stroke="#000000" strokeWidth="26" strokeLinecap="round" opacity="0.95" />
            <path d={PATH_SWASH} className="vc-trace-swash" fill="none" stroke="#FF003C" strokeWidth="14" strokeLinecap="round" filter="url(#vc-neon-filter)" />
            <path d={PATH_SWASH} className={cn(styles.whiteCores, "vc-trace-swash")} fill="none" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* Piece 2: Cursive O */}
          <g className={cn("mf-intro-piece mf-intro-letter-o", animated && styles.mainTubes)} id="vc-piece-letter-o" data-piece="letter-o">
            <path d={PATH_O} className="vc-trace-o" transform="translate(14, 16)" fill="none" stroke="#000000" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            <path d={PATH_O} className="vc-trace-o" fill="none" stroke="#FF003C" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" filter="url(#vc-neon-filter)" />
            <path d={PATH_O} className={cn(styles.whiteCores, "vc-trace-o")} fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Piece 3: Cursive F */}
          <g className={cn("mf-intro-piece mf-intro-letter-f", animated && styles.flickerTube)} id="vc-piece-letter-f" data-piece="letter-f">
            {/* F Stem */}
            <g className="vc-sub-f-stem">
              <path d={PATH_F_STEM} className="vc-trace-f-stem" transform="translate(14, 16)" fill="none" stroke="#000000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <path d={PATH_F_STEM} className="vc-trace-f-stem" fill="none" stroke="#FF003C" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#vc-neon-filter)" />
              <path d={PATH_F_STEM} className="vc-trace-f-stem" fill="none" stroke="#0A0A0F" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d={PATH_F_STEM} className={cn(styles.whiteCores, "vc-trace-f-stem")} fill="none" stroke="#FFA6BA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            {/* F Crossbar */}
            <g className="vc-sub-f-cross">
              <path d={PATH_F_CROSS} className="vc-trace-f-cross" transform="translate(14, 16)" fill="none" stroke="#000000" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
              <path d={PATH_F_CROSS} className="vc-trace-f-cross" fill="none" stroke="#FF003C" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" filter="url(#vc-neon-filter)" />
              <path d={PATH_F_CROSS} className="vc-trace-f-cross" fill="none" stroke="#0A0A0F" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
              <path d={PATH_F_CROSS} className={cn(styles.whiteCores, "vc-trace-f-cross")} fill="none" stroke="#FFA6BA" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </g>

          {/* Piece 4: Cursive Y */}
          <g className={cn("mf-intro-piece mf-intro-letter-y", animated && styles.mainTubes)} id="vc-piece-letter-y" data-piece="letter-y">
            <path d={PATH_Y} className="vc-trace-y" transform="translate(14, 16)" fill="none" stroke="#000000" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
            <path d={PATH_Y} className="vc-trace-y" fill="none" stroke="#FF003C" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" filter="url(#vc-neon-filter)" />
            <path d={PATH_Y} className={cn(styles.whiteCores, "vc-trace-y")} fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>

          {/* Piece 5: Top Left Star Eye */}
          <g className={cn("mf-intro-piece mf-intro-star-left", animated && styles.mainTubes)} id="vc-piece-star-left" data-piece="star-left">
            <path d={STAR_LEFT} className="vc-fill-star-left" transform="translate(59, 41)" fill="#000000" fillRule="evenodd" opacity="0.95" />
            <path d={STAR_LEFT} className="vc-trace-star-left" transform="translate(45, 25)" fill="rgba(255,0,60,0.12)" stroke="#FF003C" strokeWidth="5" strokeLinejoin="round" fillRule="evenodd" filter="url(#vc-neon-filter)" />
            <path d={STAR_LEFT} className={cn(styles.whiteCores, "vc-trace-star-left")} transform="translate(45, 25)" fill="none" stroke="#FFF0F4" strokeWidth="1.8" strokeLinejoin="round" fillRule="evenodd" />
          </g>

          {/* Piece 6: Top Right Star Eye */}
          <g className={cn("mf-intro-piece mf-intro-star-right", animated && styles.flickerTube)} id="vc-piece-star-right" data-piece="star-right">
            <path d={STAR_RIGHT} className="vc-fill-star-right" transform="translate(429, 49)" fill="#000000" fillRule="evenodd" opacity="0.95" />
            <path d={STAR_RIGHT} className="vc-trace-star-right" transform="translate(415, 33)" fill="url(#vc-glass-black)" stroke="#FF003C" strokeWidth="6" strokeLinejoin="round" fillRule="evenodd" filter="url(#vc-neon-filter)" />
            <path d={STAR_RIGHT} className={cn(styles.whiteCores, "vc-trace-star-right")} transform="translate(415, 33)" fill="none" stroke="#FFA6BA" strokeWidth="2" strokeLinejoin="round" fillRule="evenodd" />
          </g>
        </svg>
      </div>

      {/* Interactive Control Panel */}
      {showControls && (
        <div className="flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 text-xs font-mono text-neutral-300">
          <button
            onClick={handleTogglePower}
            className={cn(
              "px-3 py-1 rounded-full font-bold transition-all",
              isOn
                ? "bg-[#FF003C] text-white shadow-[0_0_12px_#FF003C]"
                : "bg-neutral-800 text-neutral-400 hover:text-white"
            )}
          >
            {isOn ? "POWER: ON" : "POWER: OFF"}
          </button>

          <button
            onClick={triggerSparkSurge}
            disabled={!isOn}
            className="px-3 py-1 rounded-full bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-neutral-200"
          >
            ⚡ TRIGGER SPARK
          </button>

          <span className="text-[11px] text-neutral-500 border-l border-neutral-700 pl-3">
            Hover/Click sign to surge
          </span>
        </div>
      )}
    </div>
  );
}
