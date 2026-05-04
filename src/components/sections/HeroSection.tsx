"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import type { Hero } from "@/lib/cms/types";

interface HeroSectionProps {
  content: Hero;
}

export function HeroSection({ content }: HeroSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={isDark ? "mf-hero mf-hero-dark" : "mf-hero mf-hero-red"}>
      <div className="mf-hero-grid">
        <div className="mf-hero-copy">
          <div className="mf-hero-rule" />
          <p className="mf-hero-eyebrow">
                {content.eyebrow}
          </p>

          <h1 className="mf-hero-title">
            {content.headline_line1}
            <br />
            {content.headline_line2}
            <br />
            {content.headline_line3}
          </h1>

          <p className="mf-hero-subheadline">
            {content.subheadline}
          </p>

          <div className="mf-hero-actions">
            <Link href="/work" className="mf-button mf-button-primary">
              {content.cta_primary}
            </Link>
            <Link href="/contact" className="mf-button mf-button-secondary">
              {content.cta_secondary}
            </Link>
          </div>
        </div>

        <div className="mf-hero-visual" aria-hidden="true">
          <img
            src="/brand/metafloor-full-logo.svg"
            alt=""
            className="mf-hero-logo"
          />
        </div>
      </div>
    </section>
  );
}
