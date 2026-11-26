"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { RoughAnnotation } from "@/components/motion/text/RoughAnnotation";
import { LogoIntro } from "@/components/animations/LogoIntro";
import { useIsIntroDone } from "@/components/motion/core/IntroDoneContext";
import { useTheme } from "@/components/ThemeProvider";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ManifestoStage } from "./ManifestoStage";
import { ClosingStarField } from "./ClosingStarField";
import { HeroLens } from "./HeroLens";
import { WarpCarousel } from "./WarpCarousel";
import { useManifestoGestures, type ManifestoHandoff } from "./useManifestoGestures";
import { ProcessRibbonHome } from "./ProcessRibbonHome";
import type { HomeContent } from "@/lib/cms/types";
import styles from "./ofy-art-home.module.css";

// Home scenes in DOM order: hero(0) / work(1) / manifesto(2) / process
// ribbon(3) / contact(4). Scenes flow naturally; the ribbon is a tall
// scroll-through section between manifesto and contact.
const MANIFESTO_SCENE_INDEX = 2;

const HERO_BG = {
  red: {
    desktop: "/assets/ofy-brand/new-backgrounds/red/hero.png",
    mobile: "/assets/ofy-brand/new-backgrounds/red/hero-mobile.png",
  },
  dark: {
    desktop: "/assets/ofy-brand/new-backgrounds/dark/hero.png",
    mobile: "/assets/ofy-brand/new-backgrounds/dark/hero-mobile.png",
  },
} as const;

interface SceneBounds {
  top: number;
  bottom: number;
}

interface OfyArtHomeProps {
  content: HomeContent;
}

export default function OfyArtHome({ content }: OfyArtHomeProps) {
  const scrollToTop = useCallback(() => pageRef.current?.scrollTo({ top: 0, behavior: "smooth" }), []);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { theme } = useTheme();
  const isIntroDone = useIsIntroDone();
  const pageRef = useRef<HTMLDivElement>(null);
  const manifestoSectionRef = useRef<HTMLElement>(null);
  const scenesRef = useRef<SceneBounds[]>([]);
  const activeIndexRef = useRef(0);
  const process = content.process;
  const service = content.services[0];

  const reducedMotion = useReducedMotion();

  const manifestoHandoff = useMotionValue<ManifestoHandoff>({ from: 0, to: 0, t: 1 });
  const heroSeam = useMotionValue(0);
  // Light spill at the work frame's top edge while the hero is being refracted away.
  const seamBloom = useTransform(heroSeam, [0.18, 0.44, 0.86], [0, 1, 0]);
  useManifestoGestures(manifestoSectionRef, pageRef, manifestoHandoff, content.manifesto.sequence.length, isIntroDone && !reducedMotion);
  // Scene offsets are static once fonts/images settle. Measure each scene's box
  // against the scroller once and on resize; content loads after mount (fonts),
  // so lazily re-measure on the first scroll if empty.
  const measureScenes = useCallback(() => {
    const page = pageRef.current;
    if (!page) return;
    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-home-scene]"));
    if (!sections.length) return;
    const scrollTop = page.scrollTop;
    const tops = sections.map((el) => el.getBoundingClientRect().top + scrollTop);
    scenesRef.current = sections.map((el, index) => ({
      top: tops[index]!,
      bottom: tops[index + 1] ?? tops[index]! + el.offsetHeight,
    }));
  }, []);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    measureScenes();

    const onResize = () => measureScenes();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [measureScenes]);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let lastScrollY = el.scrollTop;
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = el.scrollTop;
          if (currentY > 120 && currentY > lastScrollY) {
            setHeaderHidden(true);
          } else if (currentY < lastScrollY || currentY < 120) {
            setHeaderHidden(false);
          }
          const viewportH = el.clientHeight;
          let bounds = scenesRef.current;
          if (bounds.length === 0) {
            measureScenes();
            bounds = scenesRef.current;
          }
          // Active scene = the one whose box contains the viewport midline.
          const probe = currentY + viewportH / 2;
          let idx = bounds.findIndex((b) => probe >= b.top && probe < b.bottom);
          if (idx === -1) idx = probe < (bounds[0]?.top ?? 0) ? 0 : bounds.length - 1;
          const clamped = Math.min(idx, bounds.length - 1);
          setActiveIndex(clamped);
          activeIndexRef.current = clamped;

          // Hero→work lens seam: 0 while the hero holds the frame, 1 once the
          // work scene has fully taken over. Drives the WebGL picture warp.
          const workTop = bounds[1]?.top;
          if (workTop !== undefined) {
            const start = workTop - viewportH;
            const seam = (currentY - start) / Math.max(1, workTop - start);
            heroSeam.set(Math.min(1, Math.max(0, seam)));
          }

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    // Keyboard pager: advance by one full scene. The ribbon is a single
    // scene, so ArrowDown lands on its top; a second press continues to
    // contact. (Scroll-drawing inside the ribbon is unaffected.)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
      if (e.repeat) return;
      let bounds = scenesRef.current;
      if (bounds.length === 0) {
        measureScenes();
        bounds = scenesRef.current;
      }
      if (bounds.length === 0) return;
      const currentY = el.scrollTop;
      const probe = currentY + el.clientHeight / 2;
      let current = bounds.findIndex((b) => probe >= b.top && probe < b.bottom);
      if (current === -1) current = probe < (bounds[0]?.top ?? 0) ? 0 : bounds.length - 1;
      const next = e.key === "ArrowDown" ? current + 1 : current - 1;
      if (next < 0 || next >= bounds.length) return;
      el.scrollTo({ top: bounds[next]!.top, behavior: "smooth" });
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [measureScenes, heroSeam]);

  const strokeColor = theme === "red" ? "#000000" : "#FF0000";
  const heroBg = HERO_BG[theme === "dark" ? "dark" : "red"];

  return (
    <>
      <LogoIntro />
      <main
        ref={pageRef}
        className={styles.page}
      >
        <AppNavbar
          content={content.navigation}
          hidden={headerHidden}
          onLogoClick={scrollToTop}
        />

        <section
          id="top"
          data-home-scene
          className={`${styles.scene} ${styles.hero}`}
        >
          <motion.div
            className={styles.scenePlate}
            aria-hidden="true"
            initial={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <HeroLens desktop={heroBg.desktop} mobile={heroBg.mobile} progress={heroSeam} />
          </motion.div>
          <div
            className={`${styles.heroContent} ${styles.flowContent}`}
          >
            <div className={styles.heroGrid}>
              <h1 className={styles.gridTitle}>
                we are a team of{" "}
                <RoughAnnotation type="circle" color={strokeColor} active={activeIndex === 0 && isIntroDone} delay={0.35}>
                  builders
                </RoughAnnotation>{" "}
                with design & engineering taste.
              </h1>
            </div>
          </div>
        </section>

        <section
          id="work"
          data-home-scene
          className={`${styles.scene} ${styles.serviceEngineering} ${styles.workScene}`}
          aria-label="what we build"
        >
          {!reducedMotion && (
            <motion.div className={styles.seamBloom} aria-hidden="true" style={{ opacity: seamBloom }} />
          )}
          <div className={styles.workStage}>
            <WarpCarousel categories={service?.icons ?? []} theme={theme === "dark" ? "dark" : "red"} deferred={!isIntroDone} />
          </div>
        </section>

        <section
          id="manifesto"
          data-home-scene
          ref={manifestoSectionRef}
          className={`${styles.scene} ${styles.manifestoScene}`}
          aria-labelledby="home-manifesto-title"
        >
          <ManifestoStage
            sequence={content.manifesto.sequence}
            handoff={manifestoHandoff}
            active={activeIndex === MANIFESTO_SCENE_INDEX}
            reducedMotion={Boolean(reducedMotion)}
            theme={theme}
          />
        </section>

        <ProcessRibbonHome
          steps={process.steps}
          scrollContainerRef={pageRef}
          closing={(formation: MotionValue<number>) => (
            <section className={styles.closing} aria-labelledby="closing-title">
              <div className={styles.closingMain}>
                <ClosingStarField formation={formation} />
                <h2 id="closing-title" className="sr-only">{content.contact.heading}</h2>
                <a className={styles.closingCta} data-closing-reveal href={`mailto:${content.contact.email}`}>
                  {content.contact.buttonText ?? "Tell us what you’re building"}
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
              <footer className={styles.closingFooter} data-closing-reveal>
                <span>{content.footer.copyright}</span>
                <nav aria-label="Legal">
                  {content.footer.links.map((link) => (
                    <Link href={link.href} key={link.href}>{link.label}</Link>
                  ))}
                </nav>
              </footer>
            </section>
          )}
        />
      </main>
    </>
  );
}
