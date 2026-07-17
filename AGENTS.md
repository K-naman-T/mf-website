# oddfromyou (mf-website) — Project Context

Odd From You (stylised **oddfromyou** / **Oo**) is a brand identity, web design, and development studio. The website is a high-impact, motion-heavy portfolio/landing page.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/postcss`)
- **Animation:** GSAP 3.12 (LogoIntro), Motion (Framer Motion v12). Motion primitives under `src/components/motion/` are a design-system shelf — partially adopted on live pages.
- **Deployment:** Vercel (with custom build step `scripts/fix-next-css-manifest.mjs`)

## Brand DNA

- **Colors:** Black (`#000000`), Red (`#FF0000` / oxide material reds), White (`#FFFFFF`), greys (`#333`, `#888`, `#A0A0A0`)
- **Typography:** Teko (display/headings), Inter (body/labels), Bebas Neue, Anton, Osazy
- **Logo:** "Oo" mark — two circles, one red, one white. Represents the "odd" from "from" — the punctuation mark in the brand name.
- **Tone:** Bold, minimal, high-contrast, motion-forward, slightly irreverent

## Live routes

- `/` — `OfyArtHome` (full-viewport scenes + seamless backgrounds)
- `/manifesto` — manifesto beats
- `/legal`, `/legal/[slug]` — legal index + documents
- `/animations/*` — internal labs only (disallowed in robots)

## Architecture

```
src/
├── app/              # App Router pages (thin server shells)
├── components/
│   ├── animations/   # LogoIntro (live); other modules are library/shelf
│   ├── brand/        # LogoMark, FullLogo, OOGlow, OfyAssetKit
│   ├── home/         # OfyArtHome, SeamlessBackgrounds
│   ├── layout/       # Footer, CookieNotice, Navbar (hidden on product routes)
│   ├── legal/        # Legal shells
│   ├── manifesto/    # ManifestoPage
│   └── motion/       # Reusable motion primitives (adopt gradually)
├── content/          # home.md, manifesto.md (CMS frontmatter)
└── lib/              # cms loader, seo, utils
```

Content also lives at repo-root `content/` (`icons.json`, `legal/*`). Design sources live under `assets/`, `mockups/`, `public/assets/ofy-brand/`.

## Common Commands

```bash
npm run dev        # Next.js dev server
npm run build      # Production build + CSS manifest fix
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
```

## Key Conventions

- All components use `@/` path alias (maps to `src/`)
- Animation components in `components/motion/` are reusable primitives (not all wired on home yet)
- Live page chrome uses in-page headers on home/manifesto/legal, not the global Navbar
- Brand assets for runtime: `public/brand/`, `public/assets/ofy-brand/new-backgrounds/`, `public/assets/ofy-brand/manifesto/`
- No global CSS reset — Tailwind preflight handles it

## Current Focus

Website is being redesigned with ink/watercolor-themed screen transitions, new logo assets, and a story-driven narrative flow. Keep the bold red/black identity; motion should hit hard, not soft SaaS.
