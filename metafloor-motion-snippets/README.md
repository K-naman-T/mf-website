# Metafloor Motion Snippets

This package contains production-oriented React/Next.js snippets for the Metafloor website motion layer.

## Stack
- React / Next.js
- Tailwind CSS
- Framer Motion

## Included
- `components/OOBlinkMark.tsx`
- `components/LogoReveal.tsx`
- `components/CTAButton.tsx`
- `components/ServiceCard.tsx`
- `components/HeroMoltenAmbient.tsx`
- `components/SectionReveal.tsx`
- `components/ContactSuccess.tsx`
- `lib/motionTokens.ts`
- `styles/metafloor-motion.css`
- `example-page.tsx`

## Important
Use your exact SVG assets.
Do not redraw the full logo or OO mark in code.
The snippets assume you will replace the placeholders in `/public/assets` with your real files.

## Suggested asset filenames
- `/public/assets/metafloor-full.svg`
- `/public/assets/metafloor-oo.svg`
- `/public/assets/metafloor-star.svg`

## Install
```bash
npm install framer-motion
```

## Notes
- All components include reduced-motion fallbacks.
- Timings are intentionally restrained and production-safe.
- Color defaults are tuned for the Metafloor red/black palette.
