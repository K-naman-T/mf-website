# OddFromYou Motion Snippets

This package contains production-oriented React/Next.js snippets for the OddFromYou website motion layer.

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
- `styles/ofy-motion.css`
- `example-page.tsx`

## Important
Use your exact SVG assets.
Do not redraw the full wordmark; use only the short OO mark.
The snippets assume you will replace the placeholders in `/public/assets` with your real files.

## Suggested asset filenames
- `/public/assets/ofy-short.svg`
- `/public/assets/ofy-oo.svg`
- `/public/assets/ofy-star.svg`

## Install
```bash
npm install framer-motion
```

## Notes
- All components include reduced-motion fallbacks.
- Timings are intentionally restrained and production-safe.
- Color defaults are tuned for the OddFromYou red/black palette.
