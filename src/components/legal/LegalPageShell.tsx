"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Footer } from "@/components/layout/Footer";
import { AppNavbar } from "@/components/layout/AppNavbar";
import type { Navigation } from "@/lib/cms/types";
import styles from "./legal.module.css";

export function LegalPageShell({ navigation, children }: { navigation: Navigation; children: ReactNode }) {
  const [headerHidden, setHeaderHidden] = useState(false);
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

      {children}

      <Footer />
    </div>
  );
}
