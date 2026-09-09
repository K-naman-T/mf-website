"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { WordReveal } from "@/components/motion/text/WordReveal";
import { RoughAnnotation } from "@/components/motion/text/RoughAnnotation";
import { SeamlessBackgrounds } from "@/components/home/SeamlessBackgrounds";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { QUERIES } from "@/lib/config";
import type { ManifestoContent, Navigation } from "@/lib/cms/types";
import styles from "@/components/home/ofy-art-home.module.css";
import mStyles from "./manifesto.module.css";

// Single persistent plate — SeamlessBackgrounds fades non-active layers out.
// Keep activeIndex pinned to 0 so the manifesto field never disappears mid-scroll.
const BG_IMAGES_RED = [
  {
    desktop: "/assets/ofy-brand/manifesto/manifesto-red-desktop.webp",
    mobile: "/assets/ofy-brand/manifesto/manifesto-red-mobile.webp",
  },
];

const BG_IMAGES_DARK = [
  {
    desktop: "/assets/ofy-brand/manifesto/manifesto-dark-desktop.webp",
    mobile: "/assets/ofy-brand/manifesto/manifesto-dark-mobile.webp",
  },
];

const sectionContentVariants = {
  hidden: {
    opacity: 0,
    y: 0,
    scale: 0.98,
    filter: "blur(12px)",
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const },
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const } }),
};

const beatClasses = [
  mStyles.beatDominant,
  mStyles.beatStatement,
  mStyles.beatNarrow,
  mStyles.beatList,
  mStyles.beatSeal,
];

interface ManifestoPageProps {
  content: ManifestoContent;
  navigation: Navigation;
}

export default function ManifestoPage({ content, navigation }: ManifestoPageProps) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLightHeader = theme === "red" && isMobile;
  const pageRef = useRef<HTMLDivElement>(null);

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
          const idx = Math.round(currentY / viewportH);
          setActiveIndex(Math.min(idx, 5));
          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const dir = e.key === "ArrowDown" ? 1 : -1;
        const viewportH = el.clientHeight;
        el.scrollBy({ top: viewportH * dir, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia(QUERIES.mobile);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <motion.main
        ref={pageRef}
        className={styles.page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
      >
        <AppNavbar
          content={navigation}
          hidden={headerHidden}
        />

        <SeamlessBackgrounds
          images={theme === "red" ? BG_IMAGES_RED : BG_IMAGES_DARK}
          activeIndex={0}
        />

        <section className={`${styles.scene} ${styles.hero}`}>
          <motion.div
            className={`${styles.heroContent} ${activeIndex === 0 ? styles.activeContent : ""}`}
            variants={sectionContentVariants}
            initial="hidden"
            animate={activeIndex === 0 ? "visible" : "hidden"}
          >
            <div className={styles.heroGrid}>
              <motion.p
                className={mStyles.manifestoEyebrow}
                custom={0}
                variants={staggerItem}
                initial="hidden"
                animate={activeIndex === 0 ? "visible" : "hidden"}
              >
                {content.eyebrow}
              </motion.p>
              <h1 className={styles.gridTitle}>
                odd from{" "}
                <RoughAnnotation type="circle" color={theme === "red" ? "#000000" : "#FF0000"} active={activeIndex === 0} delay={0.45}>
                  them
                </RoughAnnotation>
                .
              </h1>
              <motion.p
                className={`${styles.gridBody} ${mStyles.manifestHeroIntro}`}
                custom={0.15}
                variants={staggerItem}
                initial="hidden"
                animate={activeIndex === 0 ? "visible" : "hidden"}
              >
                {content.intro}
              </motion.p>
            </div>
          </motion.div>
        </section>

        {content.beats.map((beat, i) => {
          const isLast = i === content.beats.length - 1;
          const strokeColor = theme === "red" ? "#000000" : "#FF0000";

          return (
            <section key={i} className={styles.scene} style={isLast ? { position: "relative" } : undefined}>
              <motion.div
                className={`${styles.heroContent} ${activeIndex === i + 1 ? styles.activeContent : ""}`}
                variants={sectionContentVariants}
                initial="hidden"
                animate={activeIndex === i + 1 ? "visible" : "hidden"}
              >
                <div className={`${styles.heroGrid} ${beatClasses[i]}`}>
                  {i === 0 && (
                    <>
                      <h2 className={styles.gridTitle}>{beat.heading}</h2>
                      <motion.p className={styles.gridBody} custom={0.1} variants={staggerItem} initial="hidden" animate={activeIndex === i + 1 ? "visible" : "hidden"}>
                        it is running out of{" "}
                        <RoughAnnotation type="circle" color={strokeColor} active={activeIndex === i + 1} delay={0.45}>
                          difference
                        </RoughAnnotation>
                        .
                      </motion.p>
                    </>
                  )}
                  {i === 1 && (
                    <>
                      <h2 className={styles.gridTitle}>{beat.heading}</h2>
                      <motion.p className={styles.gridBody} custom={0.1} variants={staggerItem} initial="hidden" animate={activeIndex === i + 1 ? "visible" : "hidden"}>
                        the same grids. the same gradients. the same rounded promises. the same product wearing another product&apos;s clothes. it is also{" "}
                        <RoughAnnotation type="strike-through" color={strokeColor} active={activeIndex === i + 1} delay={0.5}>
                          forgettable
                        </RoughAnnotation>
                        .
                      </motion.p>
                    </>
                  )}
                  {i === 2 && (
                    <>
                      <h2 className={styles.gridTitle}>
                        every worthwhile company contains an{" "}
                        <RoughAnnotation type="circle" color={strokeColor} active={activeIndex === i + 1} delay={0.45}>
                          odd thing
                        </RoughAnnotation>
                        .
                      </h2>
                      <motion.p className={styles.gridBody} custom={0.1} variants={staggerItem} initial="hidden" animate={activeIndex === i + 1 ? "visible" : "hidden"}>
                        {beat.body}
                      </motion.p>
                    </>
                  )}
                  {i === 3 && (
                    <>
                      <h2 className={styles.gridTitle}>
                        we find the thing that is{" "}
                        <RoughAnnotation type="underline" color={strokeColor} active={activeIndex === i + 1} delay={0.45}>
                          yours
                        </RoughAnnotation>
                        .
                      </h2>
                      <motion.p className={styles.gridBody} custom={0.1} variants={staggerItem} initial="hidden" animate={activeIndex === i + 1 ? "visible" : "hidden"}>
                        {beat.body}
                      </motion.p>
                    </>
                  )}
                  {i === 4 && (
                    <>
                      <h2 className={styles.gridTitle}>
                        <RoughAnnotation type="circle" color={strokeColor} active={activeIndex === i + 1} delay={0.45}>
                          odd enough
                        </RoughAnnotation>{" "}
                        to be remembered.
                      </h2>
                      <motion.p className={styles.gridBody} custom={0.1} variants={staggerItem} initial="hidden" animate={activeIndex === i + 1 ? "visible" : "hidden"}>
                        {beat.body}
                      </motion.p>
                    </>
                  )}
                </div>
              </motion.div>
              {isLast && <Footer />}
            </section>
          );
        })}
      </motion.main>
    </>
  );
}
