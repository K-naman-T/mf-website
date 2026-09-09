"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Footer } from "@/components/layout/Footer";
import { AppNavbar } from "@/components/layout/AppNavbar";
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
      <AppNavbar
        content={navigation}
        hidden={headerHidden}
      />

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
