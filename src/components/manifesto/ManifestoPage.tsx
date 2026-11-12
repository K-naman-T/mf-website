"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { ScrollText } from "@/components/motion/text/ScrollText";
import { RoughAnnotation } from "@/components/motion/text/RoughAnnotation";
import { RailToc, type RailTocItem } from "@/components/ui/rail-toc";
import { AppNavbar } from "@/components/layout/AppNavbar";
import { Footer } from "@/components/layout/Footer";
import { useTheme } from "@/components/ThemeProvider";
import type { ManifestoContent, Navigation } from "@/lib/cms/types";
import styles from "@/components/home/ofy-art-home.module.css";
import mStyles from "./manifesto.module.css";

const sectionContentVariants = {
  hidden: {
    opacity: 0,
    y: 18,
    scale: 0.99,
    filter: "blur(6px)",
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
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const },
  }),
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
  const { theme } = useTheme();
  const pageRef = useRef<HTMLDivElement>(null);

  const sceneCount = content.beats.length + 1;

  // The rail is the argument's table of contents: the opening beat plus one line per beat.
  const railItems: RailTocItem[] = [
    { id: "manifesto-hero", label: content.title },
    ...content.beats.map((beat, i) => ({
      id: `manifesto-beat-${i + 1}`,
      label: beat.rail ?? `Beat ${i + 1}`,
    })),
  ];

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
          setActiveIndex(Math.min(idx, sceneCount - 1));
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
  }, [sceneCount]);

  return (
    <motion.main
      ref={pageRef}
      className={styles.page}
      style={{ background: "var(--bg)" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <AppNavbar content={navigation} hidden={headerHidden} />

      <div className={mStyles.manifestoRail}>
        <RailToc items={railItems} containerRef={pageRef} title="Manifesto" />
      </div>

      <section id="manifesto-hero" className={`${styles.scene} ${styles.hero}`}>
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
              <RoughAnnotation
                type="circle"
                color={theme === "red" ? "#000000" : "#FF0000"}
                active={activeIndex === 0}
                delay={0.45}
              >
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
        const isActive = activeIndex === i + 1;
        const strokeColor = theme === "red" ? "#000000" : "#FF0000";

        return (
          <section
            key={beat.heading}
            id={`manifesto-beat-${i + 1}`}
            className={styles.scene}
            style={isLast ? { position: "relative" } : undefined}
          >
            <motion.div
              className={`${styles.heroContent} ${isActive ? styles.activeContent : ""}`}
              variants={sectionContentVariants}
              initial="hidden"
              animate={isActive ? "visible" : "hidden"}
            >
              <div className={`${styles.heroGrid} ${beatClasses[i]}`}>
                <h2 className={styles.gridTitle}>
                  <ScrollText text={beat.heading} active={isActive} />
                </h2>
                {i === 0 && (
                  <motion.p
                    className={styles.gridBody}
                    custom={0.1}
                    variants={staggerItem}
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                  >
                    it is running out of{" "}
                    <RoughAnnotation
                      type="circle"
                      color={strokeColor}
                      active={isActive}
                      delay={0.45}
                    >
                      difference
                    </RoughAnnotation>
                    .
                  </motion.p>
                )}
                {i === 1 && (
                  <motion.p
                    className={styles.gridBody}
                    custom={0.1}
                    variants={staggerItem}
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                  >
                    the same grids. the same gradients. the same rounded promises. the same
                    product wearing another product&apos;s clothes. it is also{" "}
                    <RoughAnnotation
                      type="strike-through"
                      color={strokeColor}
                      active={isActive}
                      delay={0.5}
                    >
                      forgettable
                    </RoughAnnotation>
                    .
                  </motion.p>
                )}
                {i > 1 && (
                  <motion.p
                    className={styles.gridBody}
                    custom={0.1}
                    variants={staggerItem}
                    initial="hidden"
                    animate={isActive ? "visible" : "hidden"}
                  >
                    {beat.body}
                  </motion.p>
                )}
              </div>
            </motion.div>
            {isLast && <Footer />}
          </section>
        );
      })}
    </motion.main>
  );
}
