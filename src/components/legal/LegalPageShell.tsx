"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import type { Navigation } from "@/lib/cms/types";
import { QUERIES, VIEWPORT } from "@/lib/config";
import homeStyles from "@/components/home/ofy-art-home.module.css";
import styles from "./legal.module.css";

export function LegalPageShell({ navigation, children }: { navigation: Navigation; children: ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const isLightHeader = theme === "red" && isMobile;
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(QUERIES.mobile);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const el = pageRef.current;
    if (!el) return;
    let lastScrollY = el.scrollTop;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = el.scrollTop;
          if (currentY > 120 && currentY > lastScrollY) setHeaderHidden(true);
          else if (currentY < lastScrollY || currentY < 120) setHeaderHidden(false);
          lastScrollY = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div ref={pageRef} className={styles.page}>
      <header className={`${homeStyles.homeHeader}${headerHidden ? ` ${homeStyles.homeHeaderHidden}` : ""}${isLightHeader ? ` ${homeStyles.headerLightForeground}` : ""}`}>
        <div className={homeStyles.headerInner}>
          <div className={homeStyles.headerLeft}>
            <Link className={`${homeStyles.headerBrand} mf-nav-brand`} href="/">
              <div className="mf-nav-oo-wrapper">
                <img className={homeStyles.headerLogo} src="/brand/ofy-short-logo.svg" alt="OddFromYou" />
                <span id="mf-nav-o-target-1" className="mf-nav-o-target mf-nav-o-target-left" />
                <span id="mf-nav-o-target-2" className="mf-nav-o-target mf-nav-o-target-right" />
              </div>
            </Link>
            <nav className={homeStyles.headerNav}>
              {navigation.links.map((link) => (
                <a key={link.href} className={homeStyles.headerLink} href={link.href === "#work" ? "/#work" : link.href}>
                  {link.label}
                </a>
              ))}
            </nav>
          </div>
          <div className={homeStyles.headerRight}>
            <button className={homeStyles.headerThemeToggle} onClick={toggleTheme}
              aria-label={`Switch to ${theme === "red" ? "dark" : "red"} theme`} type="button"
            >
              {theme === "red" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>
            <Link className={homeStyles.headerCta} href="/#contact">
              <span className={homeStyles.ctaFull}>Let&apos;s talk</span>
              <span className={homeStyles.ctaShort}>Talk</span>
            </Link>
          </div>
        </div>
      </header>

      <div className={styles.bg} aria-hidden="true">
        <picture className={styles.bgDark}>
          <source media={`(max-width: ${VIEWPORT.tablet}px)`} srcSet="/assets/ofy-brand/new-backgrounds/dark/design-taste-mobile.png" />
          <img src="/assets/ofy-brand/new-backgrounds/dark/design-taste.png" alt="" />
        </picture>
        <picture className={styles.bgRed}>
          <source media={`(max-width: ${VIEWPORT.tablet}px)`} srcSet="/assets/ofy-brand/new-backgrounds/red/design-taste-mobile.png" />
          <img src="/assets/ofy-brand/new-backgrounds/red/design-taste.png" alt="" />
        </picture>
      </div>

      {children}

      <Footer />
    </div>
  );
}
