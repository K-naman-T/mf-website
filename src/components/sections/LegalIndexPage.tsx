import Link from "next/link";
import { SectionReveal } from "@/components/motion/transitions/SectionReveal";
import type { LegalIndex } from "@/lib/cms/types";

export function LegalIndexPage({ content }: { content: LegalIndex }) {
  return (
    <div className="mf-page mf-page-theme mf-legal-page">
      <main className="mf-cms-main">
        <section className="mf-page-hero">
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

        <SectionReveal as="section" className="mf-cms-section" distance={22}>
          <div className="mf-legal-grid">
            {content.documents.map((document, index) => (
              <Link href={`/legal/${document.slug}`} className="mf-legal-card" key={document.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h2>{document.title}</h2>
                <p>{document.description}</p>
              </Link>
            ))}
          </div>
        </SectionReveal>
      </main>
    </div>
  );
}
