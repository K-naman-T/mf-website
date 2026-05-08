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
          <Link href="/contact" className="mf-button mf-button-primary">{content.homeSections.primaryCtaLabel}</Link>
          <Link href="/process" className="mf-button mf-button-secondary">{content.homeSections.secondaryCtaLabel}</Link>
        </SectionReveal>
      </section>

      <section className="mf-home-screen mf-contact-strip-screen">
        <div className="mf-footer-ink-corner" aria-hidden="true">
          <svg viewBox="0 0 690 560" focusable="false">
            <defs>
              <radialGradient id="mf-footer-ink-main" cx="30%" cy="25%" r="85%">
                <stop offset="0" stopColor="#3a3535" />
                <stop offset="0.28" stopColor="#100e0e" />
                <stop offset="0.68" stopColor="#050404" />
                <stop offset="1" stopColor="#000000" />
              </radialGradient>
              <radialGradient id="mf-footer-ink-shine" cx="24%" cy="18%" r="62%">
                <stop offset="0" stopColor="rgba(255,255,255,0.38)" />
                <stop offset="0.15" stopColor="rgba(255,255,255,0.14)" />
                <stop offset="0.5" stopColor="rgba(255,255,255,0.04)" />
                <stop offset="1" stopColor="rgba(255,255,255,0)" />
              </radialGradient>
              <filter id="mf-footer-ink-soft" x="-8%" y="-8%" width="116%" height="116%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" />
              </filter>
            </defs>
            <path className="mf-footer-ink-body" d="M690 80C640 44 572 36 524 64C480 90 510 148 468 168C424 190 370 156 322 182C274 208 302 266 252 296C196 330 110 290 66 344C22 398 66 474 138 484C194 492 248 466 302 482C362 500 400 556 488 560H690V80Z" />
            <path className="mf-footer-ink-bridge" d="M130 370C162 320 224 308 268 344C312 380 368 368 406 326C448 280 516 268 560 314C612 368 574 450 506 468C458 482 422 460 378 480C320 506 246 476 214 418C194 382 162 392 130 370Z" />
            <path className="mf-footer-ink-lobe" d="M440 200C402 168 418 112 466 102C522 90 582 134 568 196C554 258 488 242 440 200Z" />
            <circle className="mf-footer-ink-dot" cx="178" cy="450" r="42" />
            <circle className="mf-footer-ink-dot" cx="636" cy="182" r="30" />
            <circle className="mf-footer-ink-dot" cx="88" cy="270" r="24" />
            <circle className="mf-footer-ink-hole" cx="528" cy="426" r="58" />
            <circle className="mf-footer-ink-hole" cx="658" cy="368" r="26" />
            <circle className="mf-footer-ink-hole" cx="438" cy="198" r="22" />
            <path className="mf-footer-ink-highlight" d="M490 88C444 120 468 174 420 208C378 240 326 212 284 248C262 268 256 296 260 324C228 280 238 228 278 196C324 158 380 186 428 148C462 120 458 82 490 88Z" />
            <path className="mf-footer-ink-highlight mf-footer-ink-highlight-low" d="M92 364C142 370 186 354 232 384C278 414 320 424 370 400C324 460 246 468 192 430C158 408 128 396 90 402C84 390 86 374 92 364Z" />
          </svg>
        </div>
        <SectionReveal className="mf-footer-brand-panel" distance={18}>
          <MetafloorShortLogo theme="dark" className="mf-footer-logo" />
          <p>{content.footer.description}</p>
          <Link href="/contact" className="mf-footer-outline-cta">
            {content.footer.ctaLabel} <Arrow />
          </Link>
        </SectionReveal>
        <SectionReveal as="nav" className="mf-footer-columns" aria-label="Footer navigation" delay={0.04} distance={18}>
          {content.footer.columns.map((column) => (
            <div key={column.title}>
              <h3>{column.title}</h3>
              {column.links.map((link) => (
                <Link href={link.href} key={`${column.title}-${link.href}-${link.label}`}>{link.label}</Link>
              ))}
            </div>
          ))}
        </SectionReveal>
        <SectionReveal className="mf-footer-contact-panel" delay={0.08} distance={18}>
          <h2>{content.footer.headline}</h2>
          <p>{content.footer.body}</p>
          <nav aria-label="Company footer links" className="mf-footer-company-links">
            {content.footer.companyLinks.map((link) => (
              <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
            ))}
          </nav>
          <a href={`mailto:${content.contact.email}`} className="mf-footer-email">
            {content.contact.email} <Arrow />
          </a>
        </SectionReveal>
        <SectionReveal className="mf-footer-bottom-rail" delay={0.1} distance={12}>
          <span>{content.footer.copyright}</span>
          <strong>{content.contact.tagline}</strong>
          {content.footer.bottomLinks.map((link) => (
            <Link href={link.href} key={`${link.href}-${link.label}`}>{link.label}</Link>
          ))}
          <span className="mf-footer-status"><i /> {content.footer.status}</span>
        </SectionReveal>
      </section>
    </>
  );
}
