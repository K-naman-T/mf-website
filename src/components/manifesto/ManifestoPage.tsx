"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { WordReveal } from "@/components/motion/text/WordReveal";
import { SeamlessBackgrounds } from "@/components/home/SeamlessBackgrounds";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
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
        <header className={`${styles.homeHeader}${headerHidden ? ` ${styles.homeHeaderHidden}` : ""}${isLightHeader ? ` ${styles.headerLightForeground}` : ""}`}>
          <div className={styles.headerInner}>
            <div className={styles.headerLeft}>
              <Link className={`${styles.headerBrand} mf-nav-brand`} href="/">
                <div className="mf-nav-oo-wrapper">
                  <img
                    className={`${styles.headerLogo}${theme === 'dark' ? ` ${mStyles.darkModeLogo}` : ''}`}
                    src="/brand/ofy-short-logo.svg"
                    alt="OddFromYou"
                  />
                  <span
                    id="mf-nav-o-target-1"
                    className="mf-nav-o-target mf-nav-o-target-left"
                  />
                  <span
                    id="mf-nav-o-target-2"
                    className="mf-nav-o-target mf-nav-o-target-right"
                  />
                </div>
              </Link>
              <nav className={styles.headerNav}>
                {navigation.links.map((link) => (
                  <a key={link.href} className={styles.headerLink} href={link.href === "#work" ? "/#work" : link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className={styles.headerRight}>
              <button
                className={`${styles.headerThemeToggle}${theme === 'dark' ? ` ${mStyles.darkModeToggle}` : ''}`}
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === "red" ? "dark" : "red"} theme`}
                type="button"
              >
                {theme === "red" ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </button>
              <Link className={styles.headerCta} href="/#contact">
                <span className={styles.ctaFull}>{navigation.cta.label}</span>
                {navigation.cta.shortLabel && (
                  <span className={styles.ctaShort}>{navigation.cta.shortLabel}</span>
                )}
              </Link>
            </div>
          </div>
        </header>

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
              <WordReveal
                as="h1"
                className={styles.gridTitle}
                text={content.title}
                active={activeIndex === 0}
              />
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
          return (
            <section key={i} className={styles.scene} style={isLast ? { position: "relative" } : undefined}>
              <motion.div
                className={`${styles.heroContent} ${activeIndex === i + 1 ? styles.activeContent : ""}`}
                variants={sectionContentVariants}
                initial="hidden"
                animate={activeIndex === i + 1 ? "visible" : "hidden"}
              >
                <div className={`${styles.heroGrid} ${beatClasses[i]}`}>
                  <WordReveal
                    as="h2"
                    className={styles.gridTitle}
                    text={beat.heading}
                    active={activeIndex === i + 1}
                  />
                  <motion.p
                    className={styles.gridBody}
                    custom={0.1}
                    variants={staggerItem}
                    initial="hidden"
                    animate={activeIndex === i + 1 ? "visible" : "hidden"}
                  >
                    {beat.body}
                  </motion.p>
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
