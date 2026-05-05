import Link from "next/link";
import type { HomeContent, HomeTile } from "@/lib/cms/types";
import { MetafloorShortLogo } from "@/components/brand/MetafloorShortLogo";

function Icon({ src, alt }: { src?: string; alt: string }) {
  if (!src) return <span className="mf-home-star">★</span>;
  return <img src={src} alt={alt} className="mf-home-icon" />;
}

function Arrow() {
  return <span aria-hidden="true" className="mf-arrow">↗</span>;
}

function Tile({ item }: { item: HomeTile }) {
  const body = (
    <article className="mf-home-tile">
      <div className="mf-tile-media">
        <Icon src={item.icon} alt="" />
      </div>
      <div className="mf-tile-copy">
        {item.eyebrow ? <p className="mf-home-eyebrow">{item.eyebrow}</p> : null}
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
      <Arrow />
    </article>
  );

  return item.href ? <Link href={item.href}>{body}</Link> : body;
}

export function HomeSections({ content }: { content: HomeContent }) {
  return (
    <>
      <section className="mf-home-screen mf-problem-screen">
        <div className="mf-problem-icon-cell">
          <Icon src={content.problem.icon} alt="" />
        </div>
        <div className="mf-problem-copy">
          <p className="mf-home-eyebrow">★ {content.problem.eyebrow}</p>
          <h2>{content.problem.title}</h2>
        </div>
        <p className="mf-problem-description">{content.problem.description}</p>
      </section>

      <section className="mf-home-screen mf-capabilities-screen">
        <div className="mf-screen-heading">
          <p className="mf-home-eyebrow">SYSTEMS</p>
          <h2>WHAT WE BUILD</h2>
        </div>
        <div className="mf-home-tile-grid mf-home-tile-grid-four">
          {content.capabilities.map((item) => (
            <Tile item={item} key={item.title} />
          ))}
        </div>
      </section>

      <section className="mf-home-screen mf-work-screen">
        <div className="mf-screen-heading mf-work-heading">
          <p className="mf-home-eyebrow">SELECTED WORK</p>
          <h2>OUTCOMES, NOT DECORATION.</h2>
        </div>
        <div className="mf-home-tile-grid mf-home-tile-grid-three">
          {content.work.map((item) => (
            <Tile item={item} key={item.title} />
          ))}
        </div>
      </section>

      <section className="mf-home-screen mf-process-screen">
        <div className="mf-process-intro">
          <p className="mf-home-eyebrow">★ {content.process.eyebrow}</p>
          <h2>{content.process.title}</h2>
          <p>{content.process.description}</p>
        </div>
        <div className="mf-process-grid">
          {content.process.steps.map((step) => (
            <article className="mf-process-card" key={step.number}>
              <div className="mf-card-topline">
                <span>{step.number}</span>
                <span>★</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
        <div className="mf-process-cta">
          <h3>{content.process.cta}</h3>
          <Link href="/contact" className="mf-button mf-button-primary">BOOK A CALL</Link>
          <Link href="/process" className="mf-button mf-button-secondary">SEE THE PROCESS</Link>
        </div>
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
        <div className="mf-footer-brand-panel">
          <MetafloorShortLogo theme="dark" className="mf-footer-logo" />
          <p>We design, engineer, and launch systems that scale; products, platforms, and experiences built to perform.</p>
          <Link href="/contact" className="mf-footer-outline-cta">
            Initiate a signal <Arrow />
          </Link>
        </div>
        <nav className="mf-footer-columns" aria-label="Footer navigation">
          <div>
            <h3>Work</h3>
            <Link href="/work">Selected Work</Link>
            <Link href="/work">Case Studies</Link>
            <Link href="/work">Industries</Link>
          </div>
          <div>
            <h3>Services</h3>
            <Link href="/capabilities">Product Design</Link>
            <Link href="/capabilities">Backend Systems</Link>
            <Link href="/capabilities">AI Integration</Link>
            <Link href="/capabilities">Launch Support</Link>
          </div>
          <div>
            <h3>Process</h3>
            <Link href="/process">Strategy</Link>
            <Link href="/design">Design</Link>
            <Link href="/process">Engineering</Link>
            <Link href="/process">Launch</Link>
          </div>
        </nav>
        <div className="mf-footer-contact-panel">
          <h2>Let’s build together.</h2>
          <p>Have a project in mind or a production system that needs rescuing?</p>
          <nav aria-label="Company footer links" className="mf-footer-company-links">
            <Link href="/about">About</Link>
            <Link href="/design">Product Studio</Link>
            <Link href="/contact">Contact</Link>
          </nav>
          <a href={`mailto:${content.contact.email}`} className="mf-footer-email">
            {content.contact.email} <Arrow />
          </a>
        </div>
        <div className="mf-footer-bottom-rail">
          <span>© 2026 Metafloor, Inc.</span>
          <strong>{content.contact.tagline}</strong>
          <Link href="/process">Process</Link>
          <Link href="/contact">Contact</Link>
          <span className="mf-footer-status"><i /> Systems operational</span>
        </div>
      </section>
    </>
  );
}
