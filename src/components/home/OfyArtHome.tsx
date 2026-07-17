"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { WordReveal } from "@/components/motion/text/WordReveal";
import { motion } from "motion/react";
import { LogoIntro } from "@/components/animations/LogoIntro";
import { SeamlessBackgrounds, type BgImage } from "./SeamlessBackgrounds";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import type { HomeContent, ServiceSection } from "@/lib/cms/types";
import { QUERIES, VIEWPORT } from "@/lib/config";
import styles from "./ofy-art-home.module.css";

const BG_IMAGES_RED: BgImage[] = [
  { desktop: "/assets/ofy-brand/new-backgrounds/red/design-taste.png", mobile: "/assets/ofy-brand/new-backgrounds/red/design-taste-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/red/hero.png", mobile: "/assets/ofy-brand/new-backgrounds/red/hero-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/red/design-engineering.png", mobile: "/assets/ofy-brand/new-backgrounds/red/design-engineering-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/red/product-shape.png", mobile: "/assets/ofy-brand/new-backgrounds/red/product-shape-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/red/ai-systems.png", mobile: "/assets/ofy-brand/new-backgrounds/red/ai-systems-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/red/contact.png", mobile: "/assets/ofy-brand/new-backgrounds/red/contact-mobile.png" },
];

const BG_IMAGES_DARK: BgImage[] = [
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/design-taste.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/design-taste-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/hero.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/hero-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/design-engineering.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/design-engineering-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/product-shape.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/product-shape-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/ai-systems.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/ai-systems-mobile.png" },
  { desktop: "/assets/ofy-brand/new-backgrounds/dark/contact.png", mobile: "/assets/ofy-brand/new-backgrounds/dark/contact-mobile.png" },
];

const iconRowVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const iconItemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  visible: (delay: number) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] as const } }),
};

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

const contactFadeVariants = {
  hidden: { opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] as const } },
  visible: { opacity: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
};

const contactChildFade = {
  hidden: { opacity: 0 },
  visible: (delay: number) => ({ opacity: 1, transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] as const } }),
};

const sectionClasses = [
  styles.tasteComposition,
  styles.serviceEngineering,
  styles.serviceProduct,
  styles.serviceAi,
];

const sectionIds = ["work", "practice-2", "practice-3", "practice-4"];

interface OfyArtHomeProps {
  content: HomeContent;
}

export default function OfyArtHome({ content }: OfyArtHomeProps) {
  const scrollToTop = useCallback(() => pageRef.current?.scrollTo({ top: 0, behavior: "smooth" }), []);
  const [headerHidden, setHeaderHidden] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLightHeader = theme === "red" && isMobile && (activeIndex === 2 || activeIndex === 4 || activeIndex === 5);
  const pageRef = useRef<HTMLDivElement>(null);

  const navLinks = process.env.NODE_ENV === "production"
    ? content.navigation.links.filter((l) => l.label !== "Work" && l.label !== "Manifesto")
    : content.navigation.links;
  const contactVideoRef = useRef<HTMLVideoElement>(null);
  const reducedMotion = useReducedMotion();
  const activeIndexRef = useRef(0);
  const scrubPrevXRef = useRef(-1);
  const scrubLatestRef = useRef(0);
  const scrubSeekingRef = useRef(false);

  useContactVideoScrub(contactVideoRef, reducedMotion);

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
          const clamped = Math.min(idx, 5);
          setActiveIndex(clamped);
          activeIndexRef.current = clamped;
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
    if (activeIndex === 5) {
      scrubPrevXRef.current = -1;
      scrubLatestRef.current = 0;
      scrubSeekingRef.current = false;
    }
  }, [activeIndex]);

  useEffect(() => {
    const mq = window.matchMedia(QUERIES.mobile);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  function useContactVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>, reduced: boolean | null) {
    useEffect(() => {
      const video = videoRef.current;
      if (!video) return;

      const isDesktop = () => window.innerWidth >= VIEWPORT.desktop;
      const THRESHOLD = 1 / 48;

      const onPointerMove = (e: PointerEvent) => {
        if (!isDesktop() || reduced || activeIndexRef.current !== 5) return;
        if (!video.duration || !isFinite(video.duration)) return;
        if (scrubPrevXRef.current < 0) { scrubPrevXRef.current = e.clientX; return; }
        const delta = e.clientX - scrubPrevXRef.current;
        scrubPrevXRef.current = e.clientX;
        scrubLatestRef.current = Math.max(0, Math.min(scrubLatestRef.current + (delta / window.innerWidth) * 0.8 * video.duration, video.duration));
        if (!scrubSeekingRef.current) {
          scrubSeekingRef.current = true;
          video.currentTime = scrubLatestRef.current;
        }
      };

      const onSeeked = () => {
        scrubSeekingRef.current = false;
        const diff = Math.abs(video.currentTime - scrubLatestRef.current);
        if (diff > THRESHOLD) {
          scrubSeekingRef.current = true;
          video.currentTime = scrubLatestRef.current;
        }
      };

      const onMobilePlay = () => {
        if (!isDesktop()) {
          video.autoplay = true;
          video.play().catch(() => {});
        } else {
          video.autoplay = false;
          video.pause();
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      video.addEventListener("seeked", onSeeked);
      onMobilePlay();
      window.addEventListener("resize", onMobilePlay);

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        video.removeEventListener("seeked", onSeeked);
        window.removeEventListener("resize", onMobilePlay);
      };
    }, [videoRef, reduced]);
  }

  function renderServiceIcons(service: ServiceSection, isVisible: boolean) {
    return service.icons.map((icon) => (
      <motion.div
        key={icon.iconId}
        className={styles.iconItem}
        variants={iconItemVariants}
      >
        <img
          className={styles.iconImg}
          src={icon.path}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
        />
        <small className={styles.iconLabel}>{icon.label}</small>
      </motion.div>
    ));
  }

  function renderServiceSection(service: ServiceSection, index: number) {
    const isVisible = activeIndex === index + 1;
    const sectionClass = sectionClasses[index];
    const sectionId = sectionIds[index];

    if (index === 0) {
      const [firstIcon, ...restIcons] = service.icons;
      return (
        <section
          key={service.title}
          id={sectionId}
          className={`${styles.scene} ${sectionClass}`}
        >
          <motion.div
            className={`${styles.serviceContent} ${isVisible ? styles.activeContent : ""}`}
            variants={sectionContentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className={styles.contentGrid}>
              <WordReveal
                as="h2"
                className={styles.gridTitle}
                text={service.title}
                active={isVisible}
              />
              <motion.p
                className={styles.gridBody}
                custom={0.1}
                variants={staggerItem}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                {service.body}
              </motion.p>
              <motion.div
                className={styles.tasteIcons}
                variants={iconRowVariants}
                initial="hidden"
                animate={isVisible ? "show" : "hidden"}
              >
                <div className={styles.tasteIconTop}>
                  <motion.div className={styles.iconItem} variants={iconItemVariants}>
                    <img className={styles.iconImg} src={firstIcon.path} alt="" aria-hidden="true" width={18} height={18} />
                    <small className={styles.iconLabel}>{firstIcon.label}</small>
                  </motion.div>
                </div>
                <div className={styles.tasteIconBottom}>
                  {restIcons.map((icon) => (
                    <motion.div key={icon.iconId} className={styles.iconItem} variants={iconItemVariants}>
                      <img className={styles.iconImg} src={icon.path} alt="" aria-hidden="true" width={18} height={18} />
                      <small className={styles.iconLabel}>{icon.label}</small>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      );
    }

    if (index === 1) {
      return (
        <section
          key={service.title}
          id={sectionId}
          className={`${styles.scene} ${sectionClass}`}
        >
          <motion.div
            className={`${styles.serviceContent} ${isVisible ? styles.activeContent : ""}`}
            variants={sectionContentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className={styles.contentGrid}>
              <WordReveal
                as="h2"
                className={styles.gridTitle}
                text={service.title}
                active={isVisible}
              />
              <div className={styles.engineeringSplit}>
                <motion.p
                  className={`${styles.gridBody} ${styles.engineeringText}`}
                  custom={0.1}
                  variants={staggerItem}
                  initial="hidden"
                  animate={isVisible ? "visible" : "hidden"}
                >
                  {service.body}
                </motion.p>
                <motion.div
                  className={styles.engineeringRail}
                  variants={iconRowVariants}
                  initial="hidden"
                  animate={isVisible ? "show" : "hidden"}
                >
                  {renderServiceIcons(service, isVisible)}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </section>
      );
    }

    if (index === 2) {
      return (
        <section
          key={service.title}
          id={sectionId}
          className={`${styles.scene} ${sectionClass}`}
        >
          <motion.div
            className={`${styles.serviceContent} ${isVisible ? styles.activeContent : ""}`}
            variants={sectionContentVariants}
            initial="hidden"
            animate={isVisible ? "visible" : "hidden"}
          >
            <div className={styles.contentGrid}>
              <WordReveal
                as="h2"
                className={`${styles.gridTitle} ${styles.productText}`}
                text={service.title}
                active={isVisible}
              />
              <motion.p
                className={`${styles.gridBody} ${styles.productText}`}
                custom={0.1}
                variants={staggerItem}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                {service.body}
              </motion.p>
              <motion.div
                className={styles.productBracket}
                variants={iconRowVariants}
                initial="hidden"
                animate={isVisible ? "show" : "hidden"}
              >
                {renderServiceIcons(service, isVisible)}
              </motion.div>
            </div>
          </motion.div>
        </section>
      );
    }

    return (
      <section
        key={service.title}
        id={sectionId}
        className={`${styles.scene} ${sectionClass}`}
      >
        <motion.div
          className={`${styles.serviceContent} ${isVisible ? styles.activeContent : ""}`}
          variants={sectionContentVariants}
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
        >
          <div className={styles.contentGrid}>
            <WordReveal
              as="h2"
              className={styles.gridTitle}
              text={service.title}
              active={isVisible}
            />
            <div className={styles.aiSplit}>
              <motion.div
                className={styles.aiRail}
                variants={iconRowVariants}
                initial="hidden"
                animate={isVisible ? "show" : "hidden"}
              >
                {renderServiceIcons(service, isVisible)}
              </motion.div>
              <motion.p
                className={`${styles.gridBody} ${styles.aiText}`}
                custom={0.1}
                variants={staggerItem}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                {service.body}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      <LogoIntro />
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
              <a className={`${styles.headerBrand} mf-nav-brand`} href="#top">
                <div className="mf-nav-oo-wrapper">
                  <img
                    className={styles.headerLogo}
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
              </a>
              <nav className={styles.headerNav}>
                {navLinks.map((link) => (
                  <a key={link.href} className={styles.headerLink} href={link.href}>
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
            <div className={styles.headerRight}>
              <button
              className={styles.headerThemeToggle}
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
              <a className={styles.headerCta} href={content.navigation.cta.href}>
                <span className={styles.ctaFull}>{content.navigation.cta.label}</span>
                {content.navigation.cta.shortLabel && (
                  <span className={styles.ctaShort}>{content.navigation.cta.shortLabel}</span>
                )}
              </a>
          </div>
          </div>
        </header>

        {/* Mobile Oo trigger */}
        <button
          type="button"
          className={styles.mobileTrigger}
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open menu"
        >
          <img
            src="/brand/ofy-short-logo.svg"
            alt="OddFromYou"
            className={styles.mobileTriggerLogo}
          />
        </button>

        {/* Mobile full-screen overlay */}
        <motion.div
          className={styles.mobileOverlay}
          initial={{ clipPath: "circle(0% at 50% 24px)" }}
          animate={mobileMenuOpen ? { clipPath: "circle(150% at 50% 24px)" } : { clipPath: "circle(0% at 50% 24px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          aria-hidden={!mobileMenuOpen}
          inert={mobileMenuOpen ? undefined : true}
        >
          <button
            type="button"
            className={styles.mobileOverlayClose}
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
          <nav className={styles.mobileOverlayNav}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={styles.mobileOverlayLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <a
              href={content.navigation.cta.href}
              className={styles.mobileOverlayCta}
              onClick={() => setMobileMenuOpen(false)}
            >
              {content.navigation.cta.label}
            </a>
          </nav>
        </motion.div>

        <SeamlessBackgrounds images={(theme === "red" ? BG_IMAGES_RED : BG_IMAGES_DARK).slice(0, -1)} activeIndex={activeIndex} />

        <section id="top" className={`${styles.scene} ${styles.hero}`}>
          <motion.div
            className={`${styles.heroContent} ${activeIndex === 0 ? styles.activeContent : ""}`}
            variants={sectionContentVariants}
            initial="hidden"
            animate={activeIndex === 0 ? "visible" : "hidden"}
          >
            <div className={styles.heroGrid}>
              <WordReveal
                as="h1"
                className={styles.gridTitle}
                text={content.hero.heading}
                active={activeIndex === 0}
              />
              <motion.p
                className={`${styles.gridBody} ${styles.heroBodyShift}`}
                custom={0.1}
                variants={staggerItem}
                initial="hidden"
                animate={activeIndex === 0 ? "visible" : "hidden"}
              >
                {content.hero.body}
              </motion.p>
            </div>
          </motion.div>
        </section>

        {content.services.map((service, index) => renderServiceSection(service, index))}

        <section
          id="contact"
          className={`${styles.scene} ${styles.contact}`}
          style={{ position: "relative" }}
        >
          <motion.video
            ref={contactVideoRef}
            className={styles.contactFigure}
            src="/video/contact-figure-scrub.mp4"
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={activeIndex === 5 ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
          <motion.div
            className={`${styles.contactContent} ${activeIndex === 5 ? styles.activeContent : ""} ${styles.contactComposition}`}
            variants={contactFadeVariants}
            initial="hidden"
            animate={activeIndex === 5 ? "visible" : "hidden"}
          >
            <div className={styles.contactGrid}>
              <motion.h2
                className={styles.gridTitle}
                variants={contactChildFade}
                initial="hidden"
                animate={activeIndex === 5 ? "visible" : "hidden"}
                custom={0}
              >
                {content.contact.heading ?? "Bring the unsolved part."}
              </motion.h2>
              <motion.a
                className={styles.contactEmail}
                href={`mailto:${content.contact.email}`}
                custom={0.1}
                variants={contactChildFade}
                initial="hidden"
                animate={activeIndex === 5 ? "visible" : "hidden"}
              >
                {content.contact.email}
              </motion.a>
              <motion.button
                className={styles.contactButton}
                type="button"
                onClick={scrollToTop}
                custom={0.2}
                variants={contactChildFade}
                initial="hidden"
                animate={activeIndex === 5 ? "visible" : "hidden"}
              >
                {content.contact.buttonText ?? "Back to top"}
              </motion.button>
            </div>
          </motion.div>
          <Footer />
        </section>
      </motion.main>
    </>
  );
}
