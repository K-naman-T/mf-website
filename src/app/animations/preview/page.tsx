import { OoBlink, LogoReveal, CtaHover, LoaderMark, MoltenAmbient } from "@/components/animations";
import {
  LiquidInk,
  InkSplatter,
  SignalPulse,
  OOVisualizer,
  GlitchText,
  DirectionalFillButton,
} from "@/components/motion";
import Link from "next/link";
import styles from "./preview.module.css";

export const metadata = {
  title: "Animation Preview — Metafloor",
};

const animationList = [
  {
    id: "liquid-ink",
    name: "Liquid Ink",
    description: "Perlin-noise-driven organic ink blobs. Subtle, slow, material. Metafloor's signature background.",
    component: (
      <div className={styles.liquidInkDemo}>
        <LiquidInk intensity={0.9} speed={0.8} />
        <div className={styles.liquidInkLabel}>METAFLOOR</div>
      </div>
    ),
  },
  {
    id: "ink-splatter",
    name: "Ink Splatter",
    description: "Gravity-affected ink particles that spawn, drift, and fade. Dark theme accent.",
    component: (
      <div className={styles.splatterDemo}>
        <InkSplatter density={6} />
      </div>
    ),
  },
  {
    id: "signal-pulse",
    name: "Signal Pulse",
    description: "Grid of sinusoidal dots pulsing in phase-offset rhythms. Brutalist grid energy.",
    component: (
      <div className={styles.splatterDemo}>
        <SignalPulse density={10} speed={1.2} />
      </div>
    ),
  },
  {
    id: "oo-visualizer",
    name: "OO Visualizer",
    description: "Metafloor mark — concentric OO pairs that breathe and squeeze. Canvas-drawn, brand-native.",
    component: (
      <div className={styles.centerDemo}>
        <OOVisualizer size={140} speed={1} />
      </div>
    ),
  },
  {
    id: "glitch-text",
    name: "Glitch Text",
    description: "RGB-split text shadow flicker. Rare, intentional — not decorative noise. Low probability trigger.",
    component: (
        <div className={styles.centerDemo}>
        <GlitchText className={styles.glitchDemo}>METAFLOOR</GlitchText>
      </div>
    ),
  },
  {
    id: "molten-ambient",
    name: "Molten Ambient",
    description: "Orbital red blobs with dot satellites. Canvas animation.",
    component: <MoltenAmbient speed={1} intensity={0.3} />,
  },
  {
    id: "oo-blink",
    name: "OO Signal Blink",
    description: "Five OO circles compress vertically and reopen. Idle repeat every 10s.",
    component: <OoBlink size={48} repeatDelayMs={10000} />,
  },
  {
    id: "cta-hover",
    name: "CTA Hover",
    description: "Arrow shifts right 5px, shimmer sweeps on hover.",
    component: <CtaHover href="#">Get In Touch</CtaHover>,
  },
  {
    id: "directional-fill-button",
    name: "Directional Fill",
    description: "Fill sweeps from left on hover. Primary and secondary variants.",
    component: (
      <div className={styles.buttonDemo}>
        <DirectionalFillButton variant="primary">Primary CTA</DirectionalFillButton>
        <DirectionalFillButton variant="secondary">Secondary</DirectionalFillButton>
      </div>
    ),
  },
  {
    id: "loader-mark",
    name: "Loader Mark",
    description: "Five OO circles draw in sequentially, under 1.2s.",
    component: <LoaderMark duration={1200} size={60} />,
  },
  {
    id: "logo-reveal",
    name: "Logo Reveal",
    description: "Logo fades in with blur-to-clear, 0.8s cubic-bezier.",
    component: <LogoReveal duration={800} />,
  },
];

export default function AnimationPreview() {
  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <Link href="/" className={styles.back}>← Back to site</Link>
        <h1 className={styles.title}>Animation Preview</h1>
        <p className={styles.subtitle}>
          Custom motion components — offbeat, deliberate, brand-native
        </p>
      </header>

      <section className={styles.grid}>
        {animationList.map((anim) => (
          <div key={anim.id} className={styles.card}>
            <div className={styles.preview}>
              {anim.component}
            </div>
            <div className={styles.info}>
              <h2 className={styles.name}>{anim.name}</h2>
              <p className={styles.description}>{anim.description}</p>
            </div>
          </div>
        ))}
      </section>

      <section className={styles.cta}>
        <h2 className={styles.ctaTitle}>Reduced Motion</h2>
        <p className={styles.ctaText}>
          Enable &quot;Reduce motion&quot; in OS settings and refresh to test fallbacks.
          Continuous canvas animations disable; glitch and OO effects simplify.
        </p>
        <CtaHover href="/">Book a Call</CtaHover>
      </section>
    </main>
  );
}
