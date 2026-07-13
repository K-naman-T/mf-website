# OddFromYou Motion Snippets

Single-file handoff containing the core motion snippets for the OddFromYou website.

## Install
```bash
npm install framer-motion
```

## Suggested asset filenames
```txt
/public/assets/ofy-short.svg
/public/assets/ofy-oo.svg
/public/assets/ofy-star.svg
/public/assets/icon-agentic-workflow.svg
/public/assets/icon-private-ai-pipeline.svg
/public/assets/icon-industrial-vision.svg
/public/assets/icon-conversational-ai.svg
```

---

## lib/motionTokens.ts
```ts
export const motionTokens = {
  duration: {
    micro: 0.12,
    fast: 0.18,
    medium: 0.24,
    slow: 0.6,
    loop: 6,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    smooth: [0.4, 0, 0.2, 1] as const,
    signal: [0.45, 0.05, 0.55, 0.95] as const,
  },
  delay: {
    staggerTight: 0.05,
    staggerMedium: 0.1,
  },
  color: {
    red: "#E31B23",
    black: "#050505",
    white: "#F5F5F5",
  },
};

export const siteAnimation = {
  ooBlinkRepeatMs: 10000,
  heroAmbientSeconds: 6,
};
```

---

## styles/ofy-motion.css
```css
.ofy-liquid-border {
  position: relative;
  overflow: hidden;
}

.ofy-liquid-border::before {
  content: "";
  position: absolute;
  inset: 0;
  border: 1px solid currentColor;
  opacity: 0.45;
  pointer-events: none;
}

.ofy-focus-ring:focus-visible {
  outline: 2px solid #E31B23;
  outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .ofy-reduce-motion,
  .ofy-reduce-motion * {
    animation: none !important;
    transition: none !important;
    scroll-behavior: auto !important;
  }
}
```

---

## components/OOBlinkMark.tsx
```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";

type Props = {
  className?: string;
  size?: number;
  title?: string;
};

export default function OOBlinkMark({
  className = "",
  size = 88,
  title = "OddFromYou OO mark",
}: Props) {
  const reduce = useReducedMotion();

  const eyeTransition = {
    duration: reduce ? 0.01 : 0.9,
    ease: motionTokens.ease.signal,
    repeat: reduce ? 0 : Infinity,
    repeatDelay: reduce ? 0 : 10,
  } as const;

  const starTransition = {
    duration: reduce ? 0.01 : 0.9,
    ease: motionTokens.ease.signal,
    repeat: reduce ? 0 : Infinity,
    repeatDelay: reduce ? 0 : 10,
  } as const;

  return (
    <div
      className={className}
      style={{ width: size, height: size * 0.48 }}
      aria-label={title}
      role="img"
    >
      <svg viewBox="0 0 176 84" width="100%" height="100%" fill="none">
        <motion.g
          animate={
            reduce
              ? {}
              : {
                  scaleY: [1, 1, 0.82, 1],
                  y: [0, 0, 2, 0],
                }
          }
          transition={eyeTransition}
          style={{ originX: "25%", originY: "50%" }}
        >
          <ellipse cx="42" cy="42" rx="38" ry="32" fill="#050505" />
          <path
            d="M42 18l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z"
            fill="#F5F5F5"
          />
        </motion.g>

        <motion.g
          animate={
            reduce
              ? {}
              : {
                  scaleY: [1, 1, 0.82, 1],
                  y: [0, 0, 2, 0],
                }
          }
          transition={{ ...eyeTransition, delay: 0.06 }}
          style={{ originX: "75%", originY: "50%" }}
        >
          <ellipse cx="134" cy="42" rx="38" ry="32" fill="#050505" />
          <path
            d="M134 18l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2 6-12z"
            fill="#F5F5F5"
          />
        </motion.g>

        <motion.text
          x="165"
          y="16"
          fontSize="12"
          fontWeight="700"
          fill="#050505"
          animate={reduce ? {} : { opacity: [1, 1, 0.8, 1] }}
          transition={starTransition}
        >
          TM
        </motion.text>
      </svg>
    </div>
  );
}
```

---

## components/LogoReveal.tsx
```tsx
"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";

type Props = {
  src?: string;
  alt?: string;
  className?: string;
};

export default function LogoReveal({
  src = "/assets/ofy-short.svg",
  alt = "OddFromYou",
  className = "",
}: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
      animate={reduce ? {} : { opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduce ? 0.01 : 0.8,
        ease: motionTokens.ease.standard,
      }}
    >
      <motion.div
        initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
        animate={reduce ? {} : { clipPath: "inset(0 0% 0 0)" }}
        transition={{
          duration: reduce ? 0.01 : 0.9,
          ease: motionTokens.ease.standard,
        }}
      >
        <Image src={src} alt={alt} width={640} height={380} priority />
      </motion.div>
    </motion.div>
  );
}
```

---

## components/CTAButton.tsx
```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export default function CTAButton({
  children,
  variant = "primary",
  className = "",
  ...props
}: Props) {
  const reduce = useReducedMotion();

  const styles = {
    primary: "bg-black text-white border border-black",
    secondary: "bg-transparent text-black border border-black",
    ghost: "bg-transparent text-black border border-transparent",
  }[variant];

  return (
    <motion.button
      whileHover={
        reduce
          ? {}
          : {
              x: 0,
              backgroundColor: variant === "primary" ? "#050505" : "#E31B23",
              color: variant === "primary" ? "#F5F5F5" : "#050505",
            }
      }
      whileTap={reduce ? {} : { scale: 0.985 }}
      transition={{ duration: reduce ? 0.01 : 0.18, ease: motionTokens.ease.standard }}
      className={`ofy-focus-ring inline-flex items-center gap-3 px-5 py-3 text-sm font-bold uppercase tracking-wide ${styles} ${className}`}
      {...props}
    >
      <span>{children}</span>
      <motion.span
        aria-hidden
        whileHover={reduce ? {} : { x: 10 }}
        transition={{ duration: reduce ? 0.01 : 0.18, ease: motionTokens.ease.standard }}
      >
        ↗
      </motion.span>
    </motion.button>
  );
}
```

---

## components/ServiceCard.tsx
```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";
import Image from "next/image";

type Props = {
  title: string;
  body: string;
  iconSrc: string;
};

export default function ServiceCard({ title, body, iconSrc }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={
        reduce
          ? {}
          : {
              y: -2,
              borderColor: "#050505",
              backgroundColor: "rgba(227,27,35,0.04)",
            }
      }
      transition={{ duration: reduce ? 0.01 : 0.22, ease: motionTokens.ease.standard }}
      className="group relative border border-black/70 p-5"
    >
      <motion.div
        whileHover={reduce ? {} : { scale: 1.04, rotate: -2 }}
        transition={{ duration: reduce ? 0.01 : 0.22, ease: motionTokens.ease.standard }}
        className="mb-4"
      >
        <Image src={iconSrc} alt="" width={56} height={56} aria-hidden />
      </motion.div>

      <motion.h3
        whileHover={reduce ? {} : { x: 2 }}
        transition={{ duration: reduce ? 0.01 : 0.18 }}
        className="mb-2 text-3xl font-black uppercase leading-none"
      >
        {title}
      </motion.h3>

      <p className="max-w-sm text-sm leading-6 text-black/85">{body}</p>

      <motion.span
        aria-hidden
        whileHover={reduce ? {} : { x: 10 }}
        transition={{ duration: reduce ? 0.01 : 0.18 }}
        className="absolute bottom-4 right-4 text-2xl"
      >
        ↗
      </motion.span>
    </motion.article>
  );
}
```

---

## components/HeroMoltenAmbient.tsx
```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";

type Props = {
  className?: string;
};

export default function HeroMoltenAmbient({ className = "" }: Props) {
  const reduce = useReducedMotion();

  const float = reduce
    ? {}
    : {
        x: [0, 10, -6, 0],
        y: [0, -8, 6, 0],
        scale: [1, 1.03, 0.98, 1],
      };

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`} aria-hidden>
      <motion.div
        animate={float}
        transition={{ duration: reduce ? 0.01 : 6, repeat: reduce ? 0 : Infinity, ease: "linear" }}
        className="absolute -right-10 top-0 h-[36rem] w-[36rem] rounded-[35%] bg-black"
        style={{
          clipPath:
            "path('M77 20C120 -11 197 2 241 41C281 77 282 131 279 183C277 236 269 295 225 329C179 364 98 373 50 344C2 314 -13 247 11 192C34 139 35 61 77 20Z')",
          opacity: 0.96,
        }}
      />
      <motion.div
        animate={reduce ? {} : { x: [0, -14, 0], y: [0, 10, 0], scale: [1, 0.97, 1] }}
        transition={{ duration: reduce ? 0.01 : 5.2, repeat: reduce ? 0 : Infinity, ease: "linear" }}
        className="absolute bottom-[-8rem] left-[35%] h-[22rem] w-[22rem] rounded-[42%] bg-black"
      />
      <motion.div
        animate={reduce ? {} : { y: [0, 12, 0] }}
        transition={{ duration: reduce ? 0.01 : 4.4, repeat: reduce ? 0 : Infinity, ease: "linear" }}
        className="absolute left-[8%] top-[18%] h-24 w-24 rounded-full bg-black"
      />
    </div>
  );
}
```

---

## components/SectionReveal.tsx
```tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";
import React from "react";

export default function SectionReveal({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={reduce ? {} : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: reduce ? 0.01 : 0.6,
        ease: motionTokens.ease.standard,
      }}
    >
      {children}
    </motion.div>
  );
}
```

---

## components/ContactSuccess.tsx
```tsx
"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { motionTokens } from "../lib/motionTokens";

type Props = {
  sent: boolean;
};

export default function ContactSuccess({ sent }: Props) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {sent && (
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.95, y: 12 }}
          animate={reduce ? {} : { opacity: 1, scale: 1, y: 0 }}
          exit={reduce ? {} : { opacity: 0, scale: 0.98 }}
          transition={{ duration: reduce ? 0.01 : 0.5, ease: motionTokens.ease.standard }}
          className="border border-black bg-[#E31B23] p-6 text-black"
        >
          <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full border border-black bg-black text-white">
            ✓
          </div>
          <h3 className="mb-2 text-3xl font-black uppercase">Message sent.</h3>
          <p className="text-sm">Thanks. We’ll be in touch soon.</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## example-page.tsx
```tsx
"use client";

import LogoReveal from "./components/LogoReveal";
import OOBlinkMark from "./components/OOBlinkMark";
import CTAButton from "./components/CTAButton";
import ServiceCard from "./components/ServiceCard";
import HeroMoltenAmbient from "./components/HeroMoltenAmbient";
import SectionReveal from "./components/SectionReveal";

export default function ExamplePage() {
  return (
    <main className="min-h-screen bg-[#E31B23] text-black">
      <section className="relative border-b border-black">
        <HeroMoltenAmbient />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-8">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <OOBlinkMark />
            </div>
            <nav className="hidden gap-8 text-sm font-bold uppercase md:flex">
              <a href="#">Work</a>
              <a href="#">Services</a>
              <a href="#">Process</a>
              <a href="#">About</a>
              <a href="#">Contact</a>
            </nav>
            <CTAButton>Initiate a Signal</CTAButton>
          </div>

          <div className="grid gap-10 md:grid-cols-2">
            <div className="max-w-2xl">
              <h1 className="mb-6 text-6xl font-black uppercase leading-[0.9] md:text-8xl">
                AI that actually works. Not just in demos.
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-8">
                OddFromYou builds the deterministic layer underneath probabilistic engines.
              </p>
              <div className="flex gap-4">
                <CTAButton>Book a Call</CTAButton>
                <CTAButton variant="secondary">View Work</CTAButton>
              </div>
            </div>
            <div className="flex items-center justify-center py-8">
              <LogoReveal className="max-w-2xl" />
            </div>
          </div>
        </div>
      </section>

      <SectionReveal>
        <section className="mx-auto grid max-w-7xl gap-0 border-b border-black md:grid-cols-4">
          <ServiceCard
            title="Agentic Workflow Systems"
            body="Autonomous systems that plan, act, and adapt."
            iconSrc="/assets/icon-agentic-workflow.svg"
          />
          <ServiceCard
            title="Private AI Pipelines"
            body="Secure, modular pipelines for ingestion, reasoning, and action."
            iconSrc="/assets/icon-private-ai-pipeline.svg"
          />
          <ServiceCard
            title="Industrial Vision"
            body="Robust CV systems that perform in the real world."
            iconSrc="/assets/icon-industrial-vision.svg"
          />
          <ServiceCard
            title="Multimodal Conversational AI"
            body="Voice, text, and image understood in context."
            iconSrc="/assets/icon-conversational-ai.svg"
          />
        </section>
      </SectionReveal>
    </main>
  );
}
```
