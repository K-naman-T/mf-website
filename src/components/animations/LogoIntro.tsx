"use client";

import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { useIntroDone, useIsIntroDone } from "@/components/motion/core/IntroDoneContext";
import { useTheme } from "@/components/ThemeProvider";

// The canonical OddFromYou short OFY logo SVG paths (dual star-in-oval "Oo" eyes + traced OFY letters)
const STAR_LEFT_D =
  "M197.28 0.129317C257.639 -2.37486 357.111 31.3609 329.151 112.634C296.323 208.043 124.134 246.196 44.0571 201.171C-22.5053 163.741 -6.58047 96.6609 44.9872 54.198C88.1356 18.6569 142.372 2.40055 197.28 0.129317ZM80.5492 94.5894C87.3106 101.644 104.125 108 112.65 114.648C118.319 119.065 118.732 121.669 117.284 128.566C114.477 141.894 103.446 161.861 109.722 175.131C111.881 179.698 115.003 179.74 119.484 179.507C143.432 178.267 154.852 150.372 172.329 137.26C183.442 145.064 191.861 156.645 202.95 164.623C215.34 173.542 223.242 175.838 224.585 156.72C225.587 142.369 218.244 131.462 220.007 117.684C222.174 100.696 250.967 87.2099 262.249 75.729C275.295 62.4593 253.11 63.2414 244.351 63.7072C231.217 64.3978 218.414 69.689 206.274 70.8205C198.752 71.5193 197.887 70.313 194.474 63.9901C191.473 58.441 179.511 30.8367 175.702 29.0231C172.402 27.459 169.264 29.8134 166.805 31.8268C161.427 36.2361 155.143 49.3727 151.52 56.0117C149.352 59.9884 145.68 70.0384 142.615 72.3928C138.862 75.2797 123.495 74.3563 117.907 74.9137C103.882 76.303 88.3135 79.4645 75.6318 85.7291C75.3811 86.8772 79.4493 93.433 80.5411 94.5727L80.5492 94.5894Z";

const STAR_RIGHT_D =
  "M151.889 0.27362C205.937 -2.68069 286.752 17.8973 296.15 81.0904C307.19 155.284 208.178 200.299 147.472 203.712C93.665 206.74 9.76065 186.278 0.816018 122.794C-10.0125 46.018 89.4081 3.68749 151.889 0.27362ZM86.3924 175.512C88.0134 177.379 93.2561 177.999 95.6657 177.853C104.895 177.313 123.639 162.615 131.028 156.48C133.744 154.226 139.483 147.646 141.835 146.289C144.938 144.488 146.858 146.173 149.239 148.069C158.891 155.765 168.946 169.508 178.701 176.022C182.571 178.604 184.462 178.524 188.091 175.694C201.329 165.365 189.756 143.204 184.842 131.401C174.875 107.482 188.61 104.542 204.206 91.7186C209.208 87.6117 224.403 75.2693 213.37 70.7029C200.818 71.7168 187.266 75.0505 174.831 75.6705C164.726 76.1738 158.658 74.2991 154.007 64.9256C148.596 54.0129 147.953 39.2851 142.397 28.2338C141.689 26.8332 139.556 25.3087 138.038 26.2715C136.344 27.3438 126.837 42.9251 125.296 45.7773C118.71 57.9738 114.132 71.6366 107.254 83.7456C103.793 86.9042 84.1581 88.0421 78.3313 89.1436C71.088 90.5223 57.0175 94.6656 51.5266 99.4582C49.7085 101.041 48.584 101.946 49.0513 104.652C49.7742 108.846 67.6416 117.439 72.0226 118.833C81.1571 121.743 95.5561 119.671 94.5047 132.597C93.4751 145.21 87.5242 160.105 85.7937 172.907C85.5747 173.878 85.728 174.746 86.3924 175.512Z";

// BOTTOM: TRACED OFY LETTERS
const PATH_O =
  "M 119.24 271.77 c -21.84 2.36 -46.05 11.22 -62.58 24.21 -6.49 4.13 -17.71 14.76 -22.43 20.66 -13.58 17.12 -23.02 38.37 -27.16 60.81 -1.77 10.63 -1.77 32.47 -0.59 42.51 7.08 43.10 31.29 76.16 67.30 92.69 38.37 18.30 89.15 15.94 124.57 -4.72 11.22 -7.08 23.02 -17.12 30.70 -27.16 17.12 -21.84 26.57 -52.54 26.57 -84.42 0.00 -15.94 -1.77 -28.93 -5.31 -41.92 -13.58 -45.46 -46.05 -73.21 -93.28 -81.47 -8.27 -1.18 -29.52 -1.77 -37.78 -1.18 z m 25.39 79.70 c 6.49 1.77 11.22 4.13 16.53 7.67 7.67 5.90 12.99 14.17 16.53 23.61 1.18 5.31 1.18 6.49 1.18 14.76 0.59 10.04 -0.59 14.76 -4.13 21.84 -6.49 12.40 -15.94 20.66 -29.52 24.80 -4.72 1.18 -5.90 1.18 -13.58 1.18 -7.08 -0.00 -9.45 -0.00 -12.99 -1.18 -19.48 -5.31 -32.47 -20.07 -34.83 -40.15 -1.77 -15.35 2.95 -29.52 14.17 -40.74 7.67 -7.08 14.17 -10.63 25.39 -12.99 5.31 -0.59 15.35 -0.59 21.25 1.18 z";

const PATH_F =
  "M 292.22 272.36 c -12.40 1.18 -23.61 5.90 -30.11 12.40 -7.67 7.08 -11.81 15.35 -12.40 25.98 0.00 7.67 0.59 12.40 4.13 22.43 5.90 16.53 8.86 30.11 10.04 48.41 1.77 25.98 -2.36 51.36 -12.99 77.93 -4.13 11.22 -4.72 15.94 -4.72 26.57 0.00 7.67 0.00 10.04 1.18 13.58 5.31 19.48 20.66 27.75 47.82 27.16 14.76 -0.59 23.61 -4.13 30.70 -11.22 9.45 -9.45 11.81 -22.43 8.27 -48.41 -1.77 -14.17 -1.77 -18.30 0.00 -21.84 2.36 -4.13 4.72 -5.31 14.17 -5.31 4.13 -0.00 14.76 0.59 23.61 1.18 17.71 1.18 25.98 0.59 34.24 -1.77 14.76 -4.72 23.02 -17.71 23.02 -35.42 0.00 -7.67 -0.59 -12.40 -3.54 -18.30 -4.13 -7.08 -12.40 -12.99 -22.43 -15.35 -6.49 -1.18 -27.16 -1.18 -41.92 -0.00 -14.17 1.77 -23.02 1.18 -25.98 -0.00 -2.95 -1.18 -4.72 -4.13 -4.72 -8.27 0.00 -3.54 1.18 -5.90 3.54 -8.27 3.54 -2.36 6.49 -2.95 25.98 -2.95 20.07 -0.00 27.75 -0.59 34.83 -3.54 11.81 -4.13 19.48 -12.99 22.43 -25.98 1.18 -5.31 1.18 -17.12 0.00 -22.43 -2.95 -13.58 -12.40 -22.43 -27.16 -25.39 -5.31 -1.18 -7.08 -1.18 -49.00 -1.77 -24.21 -0.00 -46.05 0.59 -49.00 0.59 z";

const PATH_Y =
  "M 603.34 270.59 c -12.40 1.77 -24.21 8.86 -33.06 19.48 -4.72 5.90 -12.99 17.71 -22.43 33.65 -8.27 14.76 -10.63 17.71 -13.58 17.71 -3.54 -0.00 -5.31 -2.36 -11.22 -15.35 -7.67 -15.94 -14.17 -28.93 -17.12 -33.65 -1.77 -2.36 -5.31 -6.49 -8.27 -9.45 -4.13 -4.13 -5.90 -5.31 -10.63 -7.67 -7.08 -3.54 -11.81 -4.72 -20.07 -4.72 -8.86 -0.00 -13.58 1.18 -20.07 4.13 -8.86 4.72 -15.94 11.22 -20.07 20.07 -3.54 7.08 -4.72 12.40 -4.72 20.66 0.00 8.27 1.18 14.76 5.31 21.84 3.54 8.27 8.86 14.76 26.57 32.47 21.84 22.43 29.52 32.47 33.65 42.51 2.95 8.27 2.95 14.17 -1.18 43.69 -1.77 16.53 -2.36 34.24 0.00 41.33 4.13 14.76 14.17 24.21 29.52 27.75 7.08 1.77 21.25 1.77 27.75 0.59 18.89 -4.13 30.11 -15.94 34.24 -34.83 1.77 -8.86 1.77 -21.25 -1.18 -48.41 -0.59 -6.49 -1.18 -14.17 -1.18 -16.53 0.00 -14.76 5.90 -23.02 38.96 -51.95 23.02 -21.25 28.93 -28.34 34.83 -39.55 3.54 -7.67 4.72 -12.99 4.72 -21.84 0.59 -12.99 -2.95 -21.25 -11.81 -30.11 -6.49 -6.49 -14.17 -10.04 -23.61 -11.81 -3.54 -0.59 -12.40 -0.59 -15.35 -0.00 z";

export function LogoIntro() {
  const rootRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<(event?: Event | SyntheticEvent) => void>(() => {});
  const [mounted, setMounted] = useState(false);
  const [done, setDone] = useState(false);
  const introDone = useIntroDone();
  const isIntroDone = useIsIntroDone();
  const { theme } = useTheme();

  // Theme-aware palette:
  // Red theme: Full black logo (#000000) on red background (#FF0000)
  // Dark theme: Red logo (#FF0000) on black background (#000000)
  const isRed = theme === "red";
  const bgColor = isRed ? "#FF0000" : "#000000";
  const logoColor = isRed ? "#000000" : "#FF0000";
  const fadeBg = isRed ? "rgba(255, 0, 0, 0)" : "rgba(0, 0, 0, 0)";
  const shadowFilter = isRed
    ? "drop-shadow(0 0 45px rgba(0, 0, 0, 0.28))"
    : "drop-shadow(0 0 45px rgba(255, 0, 0, 0.45))";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    if (isIntroDone) {
      setDone(true);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      introDone();
      return;
    }

    const root = rootRef.current;
    if (!root) return;

    let entranceTimeline: gsap.core.Timeline | null = null;
    let flightTimeline: gsap.core.Timeline | null = null;
    let unlockTimer: number | null = null;
    let autoTimer: number | null = null;
    let started = false;
    let scrollRestored = false;

    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const restoreScroll = () => {
      if (scrollRestored) return;
      scrollRestored = true;
      document.documentElement.style.removeProperty("overflow");
      document.body.style.removeProperty("overflow");
    };

    const showAllNavBrands = () => {
      document
        .querySelectorAll<HTMLElement>("[data-mf-nav-brand]")
        .forEach((b) => gsap.set(b, { opacity: 1 }));
    };

    const finishIntro = () => {
      if (unlockTimer) {
        window.clearTimeout(unlockTimer);
        unlockTimer = null;
      }
      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = null;
      }
      restoreScroll();
      showAllNavBrands();
      introDone();
      setDone(true);
    };

    const skipIntro = () => {
      if (unlockTimer) {
        window.clearTimeout(unlockTimer);
        unlockTimer = null;
      }
      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = null;
      }
      if (entranceTimeline) entranceTimeline.kill();
      if (flightTimeline) flightTimeline.kill();
      restoreScroll();
      showAllNavBrands();
      gsap.to(root, {
        opacity: 0,
        duration: 0.18,
        ease: "power2.out",
        onComplete: finishIntro,
      });
    };

    const startIntro = (event?: Event | SyntheticEvent) => {
      if (started) return;
      started = true;

      if (autoTimer) {
        window.clearTimeout(autoTimer);
        autoTimer = null;
      }

      if (entranceTimeline && entranceTimeline.isActive()) {
        entranceTimeline.kill();
      }

      unlockTimer = window.setTimeout(finishIntro, 3200);

      const brandCandidates = Array.from(
        document.querySelectorAll<HTMLElement>("[data-mf-nav-brand]")
      );
      const navBrand =
        brandCandidates.find((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        }) ?? brandCandidates[0] ?? null;

      const targetBoxEl =
        navBrand?.querySelector<HTMLElement | SVGElement>("img, svg") ?? navBrand;

      const starLeftNode = root.querySelector<SVGGraphicsElement>("#intro-piece-o-left");
      const starRightNode = root.querySelector<SVGGraphicsElement>("#intro-piece-o-right");
      const letterONode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-o");
      const letterFNode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-f");
      const letterYNode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-y");

      if (!starLeftNode || !starRightNode) {
        showAllNavBrands();
        finishIntro();
        return;
      }

      // Compute exact landing targets directly from the visible navbar logo
      const svg = starLeftNode.ownerSVGElement;
      const ctm = svg?.getScreenCTM();
      const scaleX = ctm ? ctm.a : 1;
      const scaleY = ctm ? ctm.d : 1;

      let targetLeftScreenX = 60.5;
      let targetLeftScreenY = 43.8;
      let targetRightScreenX = 98.3;
      let targetRightScreenY = 43.8;
      let targetScale = 0.13;

      let measured = false;
      if (targetBoxEl) {
        const rect = targetBoxEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          targetLeftScreenX = rect.left + rect.width * (179 / 700);
          targetLeftScreenY = rect.top + rect.height * (138 / 280);
          targetRightScreenX = rect.left + rect.width * (510.5 / 700);
          targetRightScreenY = rect.top + rect.height * (138 / 280);
          const computedScale = (rect.width / 700) / scaleX;
          if (computedScale > 0 && Number.isFinite(computedScale)) {
            targetScale = computedScale;
          }
          measured = true;
        }
      }

      if (!measured) {
        const target1 =
          navBrand?.querySelector<HTMLElement>(".mf-nav-o-target-left") ??
          document.getElementById("mf-nav-o-target-1");
        const target2 =
          navBrand?.querySelector<HTMLElement>(".mf-nav-o-target-right") ??
          document.getElementById("mf-nav-o-target-2");
        if (target1 && target2) {
          const t1Rect = target1.getBoundingClientRect();
          const t2Rect = target2.getBoundingClientRect();
          if (t1Rect.width > 0 && t2Rect.width > 0) {
            targetLeftScreenX = t1Rect.left + t1Rect.width / 2;
            targetLeftScreenY = t1Rect.top + t1Rect.height / 2;
            targetRightScreenX = t2Rect.left + t2Rect.width / 2;
            targetRightScreenY = t2Rect.top + t2Rect.height / 2;
            const computedScale = (t1Rect.width / 334) / scaleX;
            if (computedScale > 0 && Number.isFinite(computedScale)) {
              targetScale = computedScale;
            }
          }
        }
      }

      // Safeguard: targetScale must be a valid, positive, non-zero number
      if (!Number.isFinite(targetScale) || targetScale <= 0.05) {
        targetScale = Math.max(0.08, targetScale || 0.13);
      }

      // Reset positions to formed state for clean relative measurement
      starLeftNode.setAttribute("transform", "matrix(1,0,0,1,0,0)");
      starRightNode.setAttribute("transform", "matrix(1,0,0,1,0,0)");
      gsap.set([starLeftNode, starRightNode], { x: 0, y: 0, scale: 1, rotation: 0, opacity: 1 });

      const r1 = starLeftNode.getBoundingClientRect();
      const r2 = starRightNode.getBoundingClientRect();
      const center1 = { x: r1.left + r1.width / 2, y: r1.top + r1.height / 2 };
      const center2 = { x: r2.left + r2.width / 2, y: r2.top + r2.height / 2 };

      const dx1 = (targetLeftScreenX - center1.x) / scaleX;
      const dy1 = (targetLeftScreenY - center1.y) / scaleY;
      const dx2 = (targetRightScreenX - center2.x) / scaleX;
      const dy2 = (targetRightScreenY - center2.y) / scaleY;

      const ox1 = 179, oy1 = 138;
      const ox2 = 510.5, oy2 = 138;
      const finalTx1 = dx1 + ox1 * (1 - targetScale);
      const finalTy1 = dy1 + oy1 * (1 - targetScale);
      const finalTx2 = dx2 + ox2 * (1 - targetScale);
      const finalTy2 = dy2 + oy2 * (1 - targetScale);

      const flightState = { p: 0 };

      const exitTl = gsap.timeline({
        onComplete: () => {
          showAllNavBrands();
          gsap.to(root, {
            opacity: 0,
            duration: 0.22,
            ease: "power2.out",
            onComplete: finishIntro,
          });
        },
      });
      flightTimeline = exitTl;

      // Letters O, F, Y FLY OFF into space
      if (letterONode) {
        exitTl.to(
          letterONode,
          {
            x: -280,
            y: 220,
            rotation: -28,
            opacity: 0,
            duration: 0.65,
            ease: "power2.in",
          },
          0.02
        );
      }
      if (letterFNode) {
        exitTl.to(
          letterFNode,
          {
            x: -20,
            y: 300,
            rotation: 14,
            opacity: 0,
            duration: 0.65,
            ease: "power2.in",
          },
          0.04
        );
      }
      if (letterYNode) {
        exitTl.to(
          letterYNode,
          {
            x: 280,
            y: 220,
            rotation: 28,
            opacity: 0,
            duration: 0.65,
            ease: "power2.in",
          },
          0.06
        );
      }

      // Pixel-perfect flight trajectory landing exactly on the navbar targets
      exitTl.to(
        flightState,
        {
          p: 1,
          duration: 1.15,
          ease: "power2.inOut",
          onUpdate: () => {
            const p = flightState.p;
            const curS = 1 + (targetScale - 1) * p;
            const curTx1 = finalTx1 * p;
            const curTy1 = finalTy1 * p;
            const curTx2 = finalTx2 * p;
            const curTy2 = finalTy2 * p;
            starLeftNode.setAttribute("transform", `matrix(${curS},0,0,${curS},${curTx1},${curTy1})`);
            starRightNode.setAttribute("transform", `matrix(${curS},0,0,${curS},${curTx2},${curTy2})`);
          },
        },
        0.04
      );

      // Fade intro background away to reveal homepage hero right beneath
      exitTl.to(root, { backgroundColor: fadeBg, duration: 0.35 }, 0.78);
    };
    startRef.current = startIntro;

    const stopScroll = (event: Event) => event.preventDefault();
    const startFromWheel = (event: WheelEvent) => {
      event.preventDefault();
      startIntro(event);
    };

    const ctx = gsap.context(() => {
      const brandCandidates = Array.from(
        document.querySelectorAll<HTMLElement>("[data-mf-nav-brand]")
      );
      brandCandidates.forEach((el) => {
        gsap.set(el, { opacity: 0 });
      });

      const starLeftNode = root.querySelector<SVGGraphicsElement>("#intro-piece-o-left");
      const starRightNode = root.querySelector<SVGGraphicsElement>("#intro-piece-o-right");
      const letterONode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-o");
      const letterFNode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-f");
      const letterYNode = root.querySelector<SVGGraphicsElement>("#intro-piece-letter-y");

      const letterNodes = [letterONode, letterFNode, letterYNode].filter(
        Boolean
      ) as SVGGraphicsElement[];

      // 1. Initial entrance setup
      if (starLeftNode && starRightNode) {
        gsap.set(starLeftNode, {
          x: -420,
          y: -220,
          rotation: -20,
          scale: 0.7,
          opacity: 0,
        });
        gsap.set(starRightNode, {
          x: 420,
          y: -220,
          rotation: 20,
          scale: 0.7,
          opacity: 0,
        });
      }

      if (letterNodes.length > 0) {
        gsap.set(letterNodes, {
          y: 120,
          scale: 0.8,
          opacity: 0,
        });
      }

      // 2. Entrance Sequence: Star eyes fly in from top, letters burst up from below
      entranceTimeline = gsap.timeline({
        onComplete: () => {
          // Hold the formed mark for 0.75s, then automatically launch the flight sequence
          autoTimer = window.setTimeout(() => {
            if (!started) startIntro();
          }, 750);
        },
      });

      if (starLeftNode && starRightNode) {
        // Dual star-eyes swoop into center stage
        entranceTimeline.to(
          [starLeftNode, starRightNode],
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            opacity: 1,
            duration: 0.72,
            ease: "back.out(1.25)",
            stagger: 0.06,
          },
          0.08
        );

        // Subtle eyelid blink on settling
        entranceTimeline.to(
          [starLeftNode, starRightNode],
          {
            scaleY: 0.6,
            duration: 0.08,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut",
          },
          0.82
        );
      }

      if (letterNodes.length > 0) {
        // Bottom OFY letters reveal with punchy spring
        entranceTimeline.to(
          letterNodes,
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.65,
            ease: "back.out(1.3)",
            stagger: 0.08,
          },
          0.28
        );
      }
    }, root);

    root.addEventListener("pointerdown", startIntro, { capture: true });
    root.addEventListener("pointerup", startIntro, { capture: true });
    root.addEventListener("touchstart", startIntro, { capture: true, passive: true });
    root.addEventListener("touchend", startIntro, { capture: true, passive: true });
    root.addEventListener("click", startIntro, { capture: true });
    root.addEventListener("touchmove", stopScroll, { passive: false });
    root.addEventListener("wheel", startFromWheel, { capture: true, passive: false });
    window.addEventListener("pointerdown", startIntro, { capture: true });
    window.addEventListener("touchstart", startIntro, { capture: true, passive: true });
    window.addEventListener("wheel", startFromWheel, { capture: true, passive: false });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        skipIntro();
      } else {
        startIntro(event);
      }
    };
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      root.removeEventListener("pointerdown", startIntro, { capture: true });
      root.removeEventListener("pointerup", startIntro, { capture: true });
      root.removeEventListener("touchstart", startIntro, { capture: true });
      root.removeEventListener("touchend", startIntro, { capture: true });
      root.removeEventListener("click", startIntro, { capture: true });
      root.removeEventListener("touchmove", stopScroll);
      root.removeEventListener("wheel", startFromWheel, { capture: true });
      window.removeEventListener("pointerdown", startIntro, { capture: true });
      window.removeEventListener("touchstart", startIntro, { capture: true });
      window.removeEventListener("wheel", startFromWheel, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      if (unlockTimer) window.clearTimeout(unlockTimer);
      if (autoTimer) window.clearTimeout(autoTimer);
      if (entranceTimeline) entranceTimeline.kill();
      if (flightTimeline) flightTimeline.kill();
      showAllNavBrands();
      restoreScroll();
      ctx.revert();
      startRef.current = () => {};
    };
  }, [introDone, isIntroDone, mounted, isRed, fadeBg]);

  if (done || !mounted) return null;

  return createPortal(
    <div
      className="mf-logo-intro"
      ref={rootRef}
      role="presentation"
      aria-label="OddFromYou Short OFY Logo Intro"
      style={{
        backgroundColor: bgColor,
      }}
      onPointerDown={(event) => startRef.current(event)}
      onPointerUp={(event) => startRef.current(event)}
      onTouchStart={(event) => startRef.current(event)}
      onTouchEnd={(event) => startRef.current(event)}
      onClick={(event) => startRef.current(event)}
    >
      <div className="mf-logo-intro-stage">
        <svg
          viewBox="-20 15 700 520"
          className="w-[92vw] max-w-[620px] max-h-[72vh] h-auto select-none overflow-visible"
          role="img"
          aria-label="OddFromYou Short OFY Logo with Stars"
          style={{
            filter: shadowFilter,
          }}
        >
          {/* Piece 1: Left Star O */}
          <g
            id="intro-piece-o-left"
            className="mf-intro-piece mf-intro-o-left"
          >
            <path
              d={STAR_LEFT_D}
              fill={logoColor}
              transform="translate(12 28)"
              fillRule="evenodd"
            />
          </g>

          {/* Piece 2: Right Star O */}
          <g
            id="intro-piece-o-right"
            className="mf-intro-piece mf-intro-o-right"
          >
            <path
              d={STAR_RIGHT_D}
              fill={logoColor}
              transform="translate(362 36)"
              fillRule="evenodd"
            />
          </g>

          {/* Piece 3: Letter O (Flies off on exit) */}
          <g
            id="intro-piece-letter-o"
            className="mf-intro-piece mf-intro-letter"
          >
            <path d={PATH_O} fill={logoColor} fillRule="evenodd" />
          </g>

          {/* Piece 4: Letter F (Flies off on exit) */}
          <g
            id="intro-piece-letter-f"
            className="mf-intro-piece mf-intro-letter"
          >
            <path d={PATH_F} fill={logoColor} />
          </g>

          {/* Piece 5: Letter Y (Flies off on exit) */}
          <g
            id="intro-piece-letter-y"
            className="mf-intro-piece mf-intro-letter"
          >
            <path d={PATH_Y} fill={logoColor} />
          </g>
        </svg>
      </div>
    </div>,
    document.body
  );
}
