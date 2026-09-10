"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RoughAnnotation } from "@/components/motion/text/RoughAnnotation";
import { motion } from "motion/react";
import { LogoIntro } from "@/components/animations/LogoIntro";
import { useIsIntroDone } from "@/components/motion/core/IntroDoneContext";
import { useTheme } from "@/components/ThemeProvider";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { ProcessRibbonHome } from "./ProcessRibbonHome";
import type { HomeContent } from "@/lib/cms/types";
import { QUERIES } from "@/lib/config";
import styles from "./ofy-art-home.module.css";

// Home scenes in DOM order: hero(0) / work(1) / manifesto(2) / process
// ribbon(3) / contact(4). Scenes flow naturally; the ribbon is a tall
// scroll-through section between manifesto and contact.
const CONTACT_SCENE_INDEX = 4;

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

const WORK_ART = {
  red: [
    "/assets/ofy-brand/work/red/prediction.png",
    "/assets/ofy-brand/work/red/voice.png",
    "/assets/ofy-brand/work/red/industrial.png",
    "/assets/ofy-brand/work/red/custom.png",
  ],
  dark: [
    "/assets/ofy-brand/work/dark/prediction.png",
    "/assets/ofy-brand/work/dark/voice.png",
    "/assets/ofy-brand/work/dark/industrial.png",
    "/assets/ofy-brand/work/dark/custom.png",
  ],
} as const;

const MANIFESTO_WALL = {
  red: {
    desktop: "/assets/ofy-brand/manifesto/wall-red.png",
    mobile: "/assets/ofy-brand/manifesto/wall-red-mobile.png",
  },
  dark: {
    desktop: "/assets/ofy-brand/manifesto/wall-dark.png",
    mobile: "/assets/ofy-brand/manifesto/wall-dark-mobile.png",
  },
} as const;

const CONTACT_BG = {
  red: {
    desktop: "/assets/ofy-brand/new-backgrounds/red/contact.png",
    mobile: "/assets/ofy-brand/new-backgrounds/red/contact-mobile.png",
  },
  dark: {
    desktop: "/assets/ofy-brand/new-backgrounds/dark/contact.png",
    mobile: "/assets/ofy-brand/new-backgrounds/dark/contact-mobile.png",
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
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openWork, setOpenWork] = useState<number | null>(null);
  const [manifestoCarved, setManifestoCarved] = useState(false);
  const { theme } = useTheme();
  const isIntroDone = useIsIntroDone();
  const pageRef = useRef<HTMLDivElement>(null);
  const scenesRef = useRef<SceneBounds[]>([]);
  const activeIndexRef = useRef(0);
  const process = content.process;

  const reducedMotion = useReducedMotion();

  // Scene offsets are static once fonts/images settle. Measure each scene's box
  // against the scroller once and on resize; content loads after mount (fonts),
  // so lazily re-measure on the first scroll if empty.
  const measureScenes = useCallback(() => {
    const page = pageRef.current;
    if (!page) return;
    const sections = Array.from(page.querySelectorAll<HTMLElement>("[data-home-scene]"));
    if (!sections.length) return;
    const scrollTop = page.scrollTop;
    scenesRef.current = sections.map((el) => {
      const top = el.getBoundingClientRect().top + scrollTop;
      return { top, bottom: top + el.offsetHeight };
    });
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

          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    // Keyboard pager: advance by one full scene. The ribbon is a single
    // scene, so ArrowDown lands on its top; a second press continues to
    // contact. (Scroll-drawing inside the ribbon is unaffected.)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
      e.preventDefault();
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
  }, [measureScenes]);

  useEffect(() => {
    const mq = window.matchMedia(QUERIES.mobile);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!isMobile || activeIndex !== 1) setOpenWork(null);
  }, [isMobile, activeIndex]);

  useEffect(() => {
    if (reducedMotion || activeIndex === 2) setManifestoCarved(true);
  }, [activeIndex, reducedMotion]);

  const strokeColor = theme === "red" ? "#000000" : "#FF0000";
  const heroBg = HERO_BG[theme === "dark" ? "dark" : "red"];
  const workArt = WORK_ART[theme === "dark" ? "dark" : "red"];
  const manifestoWall = MANIFESTO_WALL[theme === "dark" ? "dark" : "red"];
  const contactBg = CONTACT_BG[theme === "dark" ? "dark" : "red"];

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
            <img
              src={heroBg.desktop}
              alt=""
              className={`${styles.seamlessImg} ${styles.heroImgDesktop}`}
            />
            <img
              src={heroBg.mobile}
              alt=""
              className={`${styles.seamlessImg} ${styles.heroImgMobile}`}
            />
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
        >
          <div className={styles.workStage}>
            <h2 className={styles.workEyebrow}>{content.services[0]?.title ?? "what we build"}</h2>
            <div className={styles.workFrame}>
              <div className={styles.workColumns}>
                {content.services[0]?.icons.map((icon, index) => {
                  const isOpen = openWork === index;
                  return (
                    <button
                      key={icon.iconId}
                      type="button"
                      className={styles.workCol}
                      data-open={isOpen ? "true" : "false"}
                      aria-expanded={isOpen}
                      aria-controls={`work-copy-${icon.iconId}`}
                      onClick={() => {
                        if (!isMobile) return;
                        setOpenWork((current) => (current === index ? null : index));
                      }}
                    >
                      {workArt[index] ? (
                        <img
                          className={styles.workColArt}
                          src={workArt[index]}
                          alt=""
                          aria-hidden="true"
                        />
                      ) : null}
                      <span className={styles.workColInner}>
                        <span className={styles.workColLabel}>{icon.label}</span>
                        <span id={`work-copy-${icon.iconId}`} className={styles.workColCopy}>
                          {icon.copy}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section
          id="manifesto"
          data-home-scene
          className={`${styles.scene} ${styles.manifestoScene}`}
          aria-labelledby="home-manifesto-title"
        >
          <div
            className={styles.manifestoStage}
            data-carved={manifestoCarved ? "true" : "false"}
          >
            <div className={styles.manifestoWall} aria-hidden="true">
              <img
                className={`${styles.manifestoWallArt} ${styles.manifestoWallArtDesktop}`}
                src={manifestoWall.desktop}
                alt=""
              />
              <img
                className={`${styles.manifestoWallArt} ${styles.manifestoWallArtMobile}`}
                src={manifestoWall.mobile}
                alt=""
              />
            </div>
            <article className={styles.letter}>
              <h2 id="home-manifesto-title" className={styles.letterSalutation}>
                {content.letter.salutation}
              </h2>
              <p className={styles.letterThesis}>{content.letter.stance}</p>
              {content.letter.paragraphs.map((graph) => (
                <p key={graph} className={styles.letterGraph}>
                  {graph}
                </p>
              ))}
              <p className={styles.letterSignoff}>
                {content.letter.signoff}
                <em>{content.letter.signature}</em>
              </p>
            </article>
          </div>
        </section>

        {/* Process ribbon — one tall in-flow scene. The wavy rail draws itself
            down the left as the page scrolls; each step row (glyph + text)
            reveals as the ink tip passes it. */}
        <ProcessRibbonHome
          eyebrow={process.eyebrow}
          title={process.title}
          steps={process.steps}
          email={content.contact.email}
          scrollContainerRef={pageRef}
        />

        <section
          id="contact"
          data-home-scene
          className={`${styles.scene} ${styles.contact}`}
        >
          <div className={styles.scenePlate} aria-hidden="true">
            <img
              src={contactBg.desktop}
              alt=""
              className={`${styles.seamlessImg} ${styles.contactImgDesktop}`}
            />
            <img
              src={contactBg.mobile}
              alt=""
              className={`${styles.seamlessImg} ${styles.contactImgMobile}`}
            />
          </div>
          <div
            className={`${styles.contactContent} ${styles.flowContent} ${styles.contactComposition}`}
            data-contact-visible={activeIndex === CONTACT_SCENE_INDEX ? "true" : "false"}
          >
            <div className={styles.contactStage}>
              <div className={styles.contactGrid}>
                <h2 className={styles.gridTitle}>
                  bring us the part that{" "}
                  <RoughAnnotation type="circle" color={strokeColor} active={activeIndex === CONTACT_SCENE_INDEX} delay={0.45}>
                    doesn&apos;t fit.
                  </RoughAnnotation>
                </h2>
                <a
                  className={styles.contactEmail}
                  href={`mailto:${content.contact.email}`}
                >
                  {content.contact.email}
                </a>
                <button
                  className={styles.contactButton}
                  type="button"
                  onClick={scrollToTop}
                >
                  {content.contact.buttonText ?? "Back to top"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
