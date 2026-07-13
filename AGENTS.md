# oddfromyou (mf-website) — Project Context

Odd From You (stylised **oddfromyou** / **Oo**) is a brand identity, web design, and development studio. The website is a high-impact, motion-heavy portfolio/landing page.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Animation:** GSAP 3.12, Motion (Framer Motion v12), Lottie (`@lottiefiles/dotlottie-react`, `lottie-react`), Theatre.js (`@theatre/core`, `@theatre/studio`)
- **Deployment:** Vercel (with custom build step `scripts/fix-next-css-manifest.mjs`)

## Brand DNA

- **Colors:** Black (`#000000`), Red (`#FF0000`), White (`#FFFFFF`), greys (`#333`, `#888`, `#A0A0A0`)
- **Typography:** Teko (display/headings), Inter (body/labels), Bebas Neue, Anton, Osazy
- **Logo:** "Oo" mark — two circles, one red, one white. Represents the "odd" from "from" — the punctuation mark in the brand name.
- **Tone:** Bold, minimal, high-contrast, motion-forward, slightly irreverent

## Architecture

```
src/
├── app/           # Next.js App Router pages
├── components/
│   ├── animations/   # Logo intro, loader, service hover, CTA hover
│   ├── brand/        # LogoMark, OOGlow
│   ├── layout/       # Navbar, CookieNotice
│   ├── motion/       # Animation primitives
│   │   ├── backgrounds/  # NoiseGrain, RedField, SignalPulse
│   │   ├── core/         # IntroDoneContext, OOPositionContext, useReducedMotion
│   │   ├── interactions/ # MagneticButton, TiltCard, TextScramble, BorderTrail, etc.
│   │   ├── text/         # TextShimmer, Marquee, GlitchText
│   │   └── transitions/  # PageMorph, PageTransition, SectionReveal
│   └── sections/    # HeroSection, HomeSections, CmsPage, etc.
├── lib/           # Utilities, types
└── styles/        # Global CSS
```

## Common Commands

```bash
npm run dev        # Next.js dev server
npm run build      # Production build + CSS manifest fix
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npx playwright test # E2E tests
```

## Key Conventions

- All components use `@/` path alias (maps to `src/`)
- Animation components in `components/motion/` are reusable primitives
- Section components in `components/sections/` are page-level containers
- Brand assets in `components/brand/`
- Lottie animation files in `public/`
- No global CSS reset — Tailwind preflight handles it

## Current Focus

Website is being redesigned with watercolor-themed screen transitions, new logo assets, and a story-driven narrative flow. The brand is moving toward a more artistic, manuscript-like visual language while keeping the bold red/black identity.
