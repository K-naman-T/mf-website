import Link from "next/link";
import type { HomeContent, HomeTile } from "@/lib/cms/types";

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

      <section className="mf-home-screen mf-capabilities-screen" data-theme="dark">
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

      <section className="mf-home-screen mf-work-screen" data-theme="dark">
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
        <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
        <span>{content.contact.website}</span>
        <strong>{content.contact.tagline}</strong>
        <Arrow />
      </section>
    </>
  );
}
