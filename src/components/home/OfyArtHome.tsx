"use client";

import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { RoughAnnotation } from "@/components/motion/text/RoughAnnotation";
import { DitheringShader } from "@/components/ui/dithering-shader";
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
const MANIFESTO_SCENE_INDEX = 2;

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const EASE_IN = [0.4, 0, 1, 1] as const;

/** Word-level fold: every word is a paper panel hinged on its baseline and
    standing up out of the page, one after another. The parent keeps the
    perspective so the sheet reads as one surface. */
const foldPanel = {
  hidden: {
    rotateX: -96,
    y: 10,
    opacity: 0,
    transition: { duration: 0.24, ease: EASE_IN },
  },
  visible: (delay: number) => ({
    rotateX: 0,
    y: 0,
    opacity: 1,
    transition: { duration: 0.72, delay, ease: EASE_OUT },
  }),
};

/** Clause strips fold down from their own crease, hinged on the top edge. */
const foldStrip = {
  hidden: {
    rotateX: -88,
    opacity: 0,
    transition: { duration: 0.22, ease: EASE_IN },
  },
  visible: (delay: number) => ({
    rotateX: 0,
    opacity: 1,
    transition: { duration: 0.66, delay, ease: EASE_OUT },
  }),
};

/** The crease each strip unfolds along draws itself out from the right. */
const creaseDraw = {
  hidden: {
    scaleX: 0,
    opacity: 0,
    transition: { duration: 0.2, ease: EASE_IN },
  },
  visible: (delay: number) => ({
    scaleX: 1,
    opacity: 0.55,
    transition: { duration: 0.8, delay, ease: EASE_OUT },
  }),
};

/** The roll rises into the scene from the fold below the sheet. */
const waveRoll = {
  hidden: {
    y: "22%",
    opacity: 0,
    transition: { duration: 0.5, ease: EASE_IN },
  },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { duration: 1.5, delay: 0.35, ease: EASE_OUT },
  },
};

const closingRise = {
  hidden: { opacity: 0, y: 16, transition: { duration: 0.22, ease: EASE_IN } },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay, ease: EASE_OUT },
  }),
};

/** Split the claim into reveal units: plain words, plus the marked phrase kept
    whole so the hand-drawn ring never breaks across a line. */
function statementUnits(
  text: string,
  mark: string,
): Array<{ text: string; marked: boolean }> {
  const at = mark ? text.indexOf(mark) : -1;
  if (at === -1) {
    return text.split(/\s+/).map((word) => ({ text: word, marked: false }));
  }
  const before = text.slice(0, at).trim();
  const after = text.slice(at + mark.length).trim();
  return [
    ...(before ? before.split(/\s+/).map((word) => ({ text: word, marked: false })) : []),
    { text: mark, marked: true },
    ...(after ? after.split(/\s+/).map((word) => ({ text: word, marked: false })) : []),
  ];
}

interface ManifestoStatementProps {
  text: string;
  mark: string;
  active: boolean;
}

function ManifestoStatement({ text, mark, active }: ManifestoStatementProps) {
  const reduced = useReducedMotion();
  const units = statementUnits(text, mark);

  return (
    <>
      {units.map((unit, i) => (
        <Fragment key={`${unit.text}-${i}`}>
          <motion.span
            className={styles.foldPanel}
            custom={reduced ? 0 : 0.04 + i * 0.055}
            variants={foldPanel}
            initial="hidden"
            animate={active ? "visible" : "hidden"}
          >
            {unit.marked ? (
              <span className={styles.statementMark}>{unit.text}</span>
            ) : (
              unit.text
            )}
          </motion.span>
          {i < units.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

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
    "/assets/ofy-brand/work/red/decision.webp",
    "/assets/ofy-brand/work/red/connected.webp",
    "/assets/ofy-brand/work/red/conversation.webp",
    "/assets/ofy-brand/work/red/operations.webp",
    "/assets/ofy-brand/work/red/commerce.webp",
    "/assets/ofy-brand/work/red/brand.webp",
  ],
  dark: [
    "/assets/ofy-brand/work/dark/decision.webp",
    "/assets/ofy-brand/work/dark/connected.webp",
    "/assets/ofy-brand/work/dark/conversation.webp",
    "/assets/ofy-brand/work/dark/operations.webp",
    "/assets/ofy-brand/work/dark/commerce.webp",
    "/assets/ofy-brand/work/dark/brand.webp",
  ],
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
  const [manifestoActive, setManifestoActive] = useState(false);
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
    // The claim animates in while its scene holds the viewport midline, and
    // resets on exit so re-entering the section replays it.
    setManifestoActive(reducedMotion || activeIndex === MANIFESTO_SCENE_INDEX);
  }, [activeIndex, reducedMotion]);

  const strokeColor = theme === "red" ? "#000000" : "#FF0000";
  const heroBg = HERO_BG[theme === "dark" ? "dark" : "red"];
  const workArt = WORK_ART[theme === "dark" ? "dark" : "red"];
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

        {/* Manifesto: one claim set huge, three supporting clauses ruled off
            like a ledger, the punchline under the claim. No letter, no orb. */}
        <section
          id="manifesto"
          data-home-scene
          className={`${styles.scene} ${styles.manifestoScene}`}
          aria-labelledby="home-manifesto-title"
        >
            {/* The sheet's roll: the project's dithered wave, rising out of
                the bottom of the sheet and filling the open half of the
                composition. The clauses and the punchline are knocked out of
                it in the alternate colour, on a solid bed so they always
                read. A plain ink swell sits underneath as the fallback for
                machines without WebGL2. */}
            <div className={styles.manifestoWave} aria-hidden="true">
              <motion.div
                className={styles.manifestoWaveRoll}
                variants={waveRoll}
                initial="hidden"
                animate={manifestoActive ? "visible" : "hidden"}
              >
                <div className={styles.waveFallback} />
                {manifestoActive && (
                  <DitheringShader
                    className={styles.waveShader}
                    style={{ position: "absolute", inset: 0 }}
                    width="100%"
                    height="100%"
                    shape="wave"
                    type="8x8"
                    pxSize={5}
                    speed={0.5}
                    morph={0.9}
                    colorBack={theme === "dark" ? "#000000" : "#ff0000"}
                    colorFront={theme === "dark" ? "#ff0000" : "#000000"}
                  />
                )}
              </motion.div>
            </div>
          <div
            className={styles.manifestoGrid}
            data-active={manifestoActive ? "true" : "false"}
          >
            <h2 id="home-manifesto-title" className={styles.manifestoStatement}>
              <ManifestoStatement
                text={content.manifesto.statement}
                mark={content.manifesto.mark}
                active={manifestoActive}
              />
            </h2>

            <div className={styles.manifestoClauses}>
              {content.manifesto.clauses.map((clause, i) => (
                <div key={clause} className={styles.manifestoClause}>
                  <motion.span
                    className={styles.clauseCrease}
                    aria-hidden="true"
                    custom={reducedMotion ? 0 : 0.58 + i * 0.17}
                    variants={creaseDraw}
                    initial="hidden"
                    animate={manifestoActive ? "visible" : "hidden"}
                  />
                  <motion.p
                    className={styles.clauseText}
                    custom={reducedMotion ? 0 : 0.64 + i * 0.17}
                    variants={foldStrip}
                    initial="hidden"
                    animate={manifestoActive ? "visible" : "hidden"}
                  >
                    {clause}
                  </motion.p>
                </div>
              ))}
            </div>

            <motion.p
              className={styles.manifestoClosing}
              custom={reducedMotion ? 0 : 1.16}
              variants={closingRise}
              initial="hidden"
              animate={manifestoActive ? "visible" : "hidden"}
            >
              {content.manifesto.closing}
            </motion.p>
          </div>
        </section>

        {/* Engagements ribbon — one viewport-locked scene. The wavy rail
            streams upward through the left gutter as the ink draws, and the
            step cards (title, copy, glyph) hand over one at a time until the
            reach-out tag lands on the ribbon's end. */}
        <ProcessRibbonHome
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
