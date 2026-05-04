"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { useTheme } from "@/components/ThemeProvider";
import type { HomeContent, PageContent } from "@/lib/cms/types";

interface CmsPageProps {
  content: PageContent;
  home: HomeContent;
}

export function CmsPage({ content, home }: CmsPageProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={isDark ? "mf-page mf-page-dark" : "mf-page mf-page-red"}>
      <Navbar content={home.navigation} />
      <main className="mf-cms-main">
        <section className="mf-page-hero">
          <div className="mf-page-hero-copy">
            <p className="mf-page-eyebrow">★ {content.hero.eyebrow}</p>
            <h1 className="mf-page-title">
              {content.hero.title.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </h1>
          </div>
          <p className="mf-page-intro">{content.hero.intro}</p>
        </section>

        {content.sections.map((section, sectionIndex) => (
          <section className="mf-cms-section" key={`${section.title}-${sectionIndex}`}>
            <div className="mf-section-heading">
              {section.eyebrow ? <p className="mf-page-eyebrow">★ {section.eyebrow}</p> : null}
              <h2>{section.title}</h2>
              {section.body ? <p>{section.body}</p> : null}
            </div>

            {section.cards?.length ? (
              <div className="mf-card-grid">
                {section.cards.map((card) => (
                  <article className="mf-page-card" key={`${card.number}-${card.title}`}>
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
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        ))}

        <section className="mf-page-cta">
          <h2>READY WHEN IT NEEDS TO SHIP.</h2>
          <Link href="/contact" className="mf-button mf-button-primary">
            INITIATE A SIGNAL
          </Link>
        </section>
      </main>
    </div>
  );
}
