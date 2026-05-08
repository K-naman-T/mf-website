"use client";

import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { SectionReveal } from "@/components/motion/transitions/SectionReveal";
import { PageOrnament } from "@/components/sections/PageOrnament";
import type { PageContent } from "@/lib/cms/types";

interface CmsPageProps {
  content: PageContent;
  ctaLabel: string;
  ctaHref: string;
}

export function CmsPage({ content, ctaLabel, ctaHref }: CmsPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={isDark ? "mf-page mf-page-dark" : "mf-page mf-page-red"}>
      <main className="mf-cms-main">
        <section className="mf-page-hero">
          <PageOrnament ornament={content.hero.ornament} />
          <SectionReveal as="div" className="mf-page-hero-copy" distance={18}>
            <p className="mf-page-eyebrow">★ {content.hero.eyebrow}</p>
            <h1 className="mf-page-title">
              {content.hero.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
          </SectionReveal>
          <SectionReveal as="p" className="mf-page-intro" delay={0.06} distance={12}>
            {content.hero.intro}
          </SectionReveal>
        </section>

        {content.sections.map((section, sectionIndex) => (
          <SectionReveal as="section" className="mf-cms-section" delay={sectionIndex * 0.04} distance={22} key={`${section.title}-${sectionIndex}`}>
            <PageOrnament ornament={section.ornament} />
            <div className="mf-section-heading">
              {section.eyebrow ? <p className="mf-page-eyebrow">★ {section.eyebrow}</p> : null}
              <h2>{section.title}</h2>
              {section.body ? <p>{section.body}</p> : null}
            </div>

            {section.cards?.length ? (
              <div className="mf-card-grid">
                {section.cards.map((card, cardIndex) => (
                  <SectionReveal as="article" className="mf-page-card" delay={0.08 + cardIndex * 0.055} distance={16} scale={0.992} key={`${card.number}-${card.title}`}>
                    <div className="mf-card-topline">
                      {card.number ? <span>{card.number}</span> : <span />}
                      <span>★</span>
                    </div>
                    <h3>{card.title}</h3>
                    <p>{card.description}</p>
                    {card.tags?.length ? (
                      <div className="mf-card-tags">
                        {card.tags.map((tag) => (
                          <span key={tag}>{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </SectionReveal>
                ))}
              </div>
            ) : null}
          </SectionReveal>
        ))}

        <SectionReveal as="section" className="mf-page-cta" distance={18}>
          <h2>{content.cta.title}</h2>
          <Link href={ctaHref} className="mf-button mf-button-primary">
            {ctaLabel}
          </Link>
        </SectionReveal>
      </main>
    </div>
  );
}
