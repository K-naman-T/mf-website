import Link from "next/link";
import type { HomeContent, HomeTile } from "@/lib/cms/types";
import { MetafloorShortLogo } from "@/components/brand/MetafloorShortLogo";
import { SectionReveal } from "@/components/motion/transitions/SectionReveal";

function Icon({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <span className="mf-home-star">★</span>;
  return <img src={src} alt={alt} className="mf-home-icon" />;
}

function Arrow() {
  return <span aria-hidden="true" className="mf-arrow">↗</span>;
}

function Tile({ item, delay = 0 }: { item: HomeTile; delay?: number }) {
  const body = (
    <SectionReveal as="article" className="mf-home-tile" delay={delay} distance={16} scale={0.992}>
      <div className="mf-tile-media">
        <Icon src={item.icon} alt="" />
      </div>
      <div className="mf-tile-copy">
        {item.eyebrow ? <p className="mf-home-eyebrow">{item.eyebrow}</p> : null}
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <Arrow />
    </SectionReveal>
  );

  return item.href ? <Link href={item.href}>{body}</Link> : body;
}

export function HomeSections({ content }: { content: HomeContent }) {
  return (
    <>
      <section className="mf-home-screen mf-problem-screen">
        <SectionReveal className="mf-problem-icon-cell" distance={18}>
          <Icon src={content.problem.icon} alt="" />
        </SectionReveal>
        <SectionReveal className="mf-problem-copy" delay={0.04} distance={18}>
          <p className="mf-home-eyebrow">★ {content.problem.eyebrow}</p>
          <h2>{content.problem.title}</h2>
        </SectionReveal>
        <SectionReveal as="p" className="mf-problem-description" delay={0.08} distance={14}>
          {content.problem.description}
        </SectionReveal>
      </section>

      <section className="mf-home-screen mf-capabilities-screen">
        <SectionReveal className="mf-screen-heading" distance={18}>
          <p className="mf-home-eyebrow">{content.homeSections.capabilitiesEyebrow}</p>
          <h2>{content.homeSections.capabilitiesTitle}</h2>
        </SectionReveal>
        <div className="mf-home-tile-grid mf-home-tile-grid-four">
          {content.capabilities.map((item, index) => (
            <Tile item={item} delay={0.06 + index * 0.045} key={item.title} />
          ))}
        </div>
      </section>

      <section className="mf-home-screen mf-work-screen">
        <SectionReveal className="mf-screen-heading mf-work-heading" distance={18}>
          <p className="mf-home-eyebrow">{content.homeSections.workEyebrow}</p>
          <h2>{content.homeSections.workTitle}</h2>
        </SectionReveal>
        <div className="mf-home-tile-grid mf-home-tile-grid-three">
          {content.work.map((item, index) => (
            <Tile item={item} delay={0.06 + index * 0.055} key={item.title} />
          ))}
        </div>
      </section>

      <section className="mf-home-screen mf-process-screen">
        <SectionReveal className="mf-process-intro" distance={18}>
          <p className="mf-home-eyebrow">★ {content.process.eyebrow}</p>
          <h2>{content.process.title}</h2>
          <p>{content.process.description}</p>
        </SectionReveal>
        <div className="mf-process-grid">
          {content.process.steps.map((step, index) => (
            <SectionReveal as="article" className="mf-process-card" delay={0.06 + index * 0.05} distance={16} scale={0.992} key={step.number}>
              <div className="mf-card-topline">
                <span>{step.number}</span>
                <span>★</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </SectionReveal>
          ))}
        </div>
        <SectionReveal className="mf-process-cta" distance={16}>
          <h3>{content.process.cta}</h3>
          <Link href="/#contact" className="mf-button mf-button-primary">{content.homeSections.primaryCtaLabel}</Link>
          <Link href="/services" className="mf-button mf-button-secondary">{content.homeSections.secondaryCtaLabel}</Link>
        </SectionReveal>
      </section>

      <section className="mf-home-screen mf-contact-strip-screen" id="contact">
        <SectionReveal className="mf-footer-terminal-copy" distance={18}>
          <p className="mf-home-eyebrow">CONTACT</p>
          <h2>{content.footer.headline}</h2>
          <p>{content.footer.description}</p>
        </SectionReveal>
        <SectionReveal className="mf-footer-terminal-action" delay={0.05} distance={18}>
          <MetafloorShortLogo theme="dark" className="mf-footer-logo" />
          <p>{content.footer.body}</p>
          <a href={`mailto:${content.contact.email}`} className="mf-footer-email">
            {content.contact.email} <Arrow />
          </a>
          <nav aria-label="Footer navigation" className="mf-footer-terminal-links">
            {content.footer.columns.flatMap((column) => column.links).map((link) => (
              <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
            ))}
          </nav>
        </SectionReveal>
        <SectionReveal className="mf-footer-bottom-rail" delay={0.08} distance={12}>
          <div className="mf-footer-bottom-meta">
            <span>{content.footer.copyright}</span>
            <strong>{content.contact.website}</strong>
          </div>
          <nav className="mf-footer-bottom-links" aria-label="Footer legal links">
            {content.footer.bottomLinks.map((link) => (
              <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
            ))}
          </nav>
        </SectionReveal>
      </section>
    </>
  );
}
