# Metafloor Animation Component Library

## Purpose

Build a reusable motion system that makes Metafloor feel premium, industrial, and alive without interrupting native scrolling or turning the site into decorative noise.

The library must support:

- Section transitions that feel like panels shifting into place.
- Animated gradients and red/black background materials based on the mockups.
- Controlled hover/tap micro-interactions.
- Route/page entry motion that never wraps or transforms the full app shell.
- Reduced-motion fallbacks.
- CMS-driven usage where practical.

## Non-Negotiables

- Never add custom wheel handlers for normal page scrolling.
- Never call `event.preventDefault()` on `wheel`, `touchmove`, or scroll events for the main site.
- Never wrap the full app in a transformed GSAP container.
- Never animate `height`, `width`, `top`, `left`, or layout-affecting properties.
- Animate only `transform`, `opacity`, `clip-path`, CSS variables, and canvas internals.
- Keep mobile scroll native.
- Respect `prefers-reduced-motion` in every animated component.
- Components must be isolated client leaves when they need runtime animation.
- Static layout remains server-rendered.

## Current Motion Stack

Available dependencies:

- `gsap`: use for isolated section choreography, SVG/path motion, and scroll-triggered reveals.
- `lottie-react` and `@lottiefiles/dotlottie-*`: use only for authored animation assets, loaders, or flagship icon scenes.
- `@theatre/core` and `@theatre/studio`: reserve for prototyping cinematic sequences, not production runtime unless explicitly needed.

Existing components:

- `MoltenAmbient`: canvas-based ambient red glow. Needs brand-color tuning before production use.
- `OoBlink`: small logo/mark animation.
- `LoaderMark`: loading-state brand mark.
- `LogoReveal`: logo entrance animation.
- `CtaHover`: CTA shimmer/arrow hover.
- `ServiceHover`: service card hover shell.

## Color And Material Direction

The current website uses pure `#FF0000`. The mockups read less like pure screen red and more like a printed/hot red field with slight depth. Use a calibrated red material instead of flat pure red for motion surfaces.

Recommended tokens:

- `--mf-red-core: #F01820`
- `--mf-red-hot: #FF1A1A`
- `--mf-red-shadow: #C9151B`
- `--mf-black: #050505`
- `--mf-ink: #0A0A0A`

Use `#FF0000` only for sharp accents if needed. Section backgrounds should use the material red stack:

```css
background:
  radial-gradient(circle at 18% 12%, rgba(255, 70, 70, 0.18), transparent 34%),
  radial-gradient(circle at 82% 78%, rgba(120, 0, 0, 0.16), transparent 42%),
  linear-gradient(135deg, var(--mf-red-hot), var(--mf-red-core) 45%, var(--mf-red-shadow));
```

This should be subtle. The page must still look like a red/black brutalist site, not a gradient SaaS page.

## Library Structure

Create the library under:

```txt
src/components/motion/
  core/
  backgrounds/
  transitions/
  interactions/
  brand/
  index.ts
```

### `core/`

Shared primitives and utilities.

Planned components:

- `MotionProvider`: central reduced-motion and viewport capability context.
- `useReducedMotion`: tiny hook around `matchMedia('(prefers-reduced-motion: reduce)')`.
- `useInViewOnce`: IntersectionObserver helper for one-time reveals, no scroll hijacking.
- `useGsapContext`: scoped GSAP setup/cleanup helper for leaf components.

Rules:

- No global scroll manipulation.
- No listeners that block wheel/touch events.
- Cleanup all GSAP contexts and animation frames.

### `backgrounds/`

Reusable red/black background materials.

Planned components:

- `RedField`: calibrated red background using static layered gradients.
- `GradientField`: slow CSS-variable gradient drift for large hero/section surfaces.
- `MoltenField`: improved replacement for `MoltenAmbient`, canvas-based and clipped to its parent.
- `InkMass`: static or slowly morphing black organic shape inspired by mockup blobs.
- `SignalGrid`: subtle brutalist dot/grid field for empty zones and process/footer areas.
- `NoiseLayer`: fixed-site noise/grain layer, optional and extremely low opacity.

Usage:

- `RedField` becomes the default red section background.
- `InkMass` is used sparingly in hero, process CTA, and capabilities page.
- `MoltenField` is dark-theme only or small-area only, not full page.

Avoid:

- Blobby corner patches that look like browser bugs.
- Continuous noisy movement across every section.
- Neon glow.

### `transitions/`

Motion for page entry and section arrival.

Planned components:

- `PageEntry`: route-level entry using opacity and y only, applied to page content, not the app shell.
- `SectionReveal`: wraps a section and reveals once with clip-path/y transform.
- `PanelShift`: creates a premium panel-settle effect when sections enter viewport using IntersectionObserver plus GSAP timeline.
- `BorderDraw`: animates grid/border lines into place for cards and section dividers.
- `TextBlockReveal`: reveals headline lines independently using masks.

Implementation rule:

- Use normal document scroll.
- Use `ScrollTrigger` only for passive observation, never for pinning/hijacking initially.
- Desktop and mobile must share layout behavior; mobile motion should be shorter or disabled.

Recommended section transition:

```txt
section enters viewport
  -> border line draws from left to right
  -> heading mask rises 16px into place
  -> body/card cells stagger by 60ms
  -> no looping after completion
```

### `interactions/`

Hover/focus/tap interactions for controls and cards.

Planned components:

- `MagneticButton`: pointer-follow button movement using refs and GSAP quick setters, not React state.
- `DirectionalFillButton`: black/red fill enters from pointer side.
- `CardPressure`: card slightly compresses on hover/tap with border emphasis.
- `CursorScanLine`: local scan line inside cards, only on hover.
- `IconNudge`: tiny icon translation/rotation on hover, no constant icon loops.

Use these for:

- CTAs.
- Navigation theme toggle.
- Capability/work cards.
- Process cards.

Avoid:

- Pulsing icons by default.
- Ring animations around icons.
- Flicker unless specifically used for an error state.

### `brand/`

Metafloor-specific logo and loader animations.

Planned components:

- `LogoRevealMark`: refined existing `LogoReveal` for the full/short marks.
- `OoBlinkMark`: keep as a small nav or loader accent, not always visible.
- `LoaderMark`: use for page loading states or suspense fallback.
- `StarField`: small deterministic star/dot array for empty states and process sections.

Guideline:

- Brand mark animation should be short, rare, and precise.
- Use it on first page load, loaders, or animation preview only.

## Component API Pattern

Use explicit, composable props:

```tsx
<SectionReveal variant="panel" delay={0.08} once>
  <section>...</section>
</SectionReveal>

<RedField intensity="mockup" grain="subtle">
  <HeroSection />
</RedField>

<InkMass corner="top-right" scale="large" motion="slow" />
```

Motion prop values:

- `none`
- `subtle`
- `standard`
- `expressive`

Default is `standard` on desktop and `subtle` on mobile.

## CMS Integration

CMS should not define raw animation classes. It should choose from safe presets.

Suggested schema additions later:

```json
{
  "background": "red-field",
  "accent": "ink-mass-top-right",
  "reveal": "panel-shift"
}
```

Allowed background presets:

- `red-field`
- `red-field-deep`
- `dark-field`
- `ink-mass`
- `signal-grid`

Allowed reveal presets:

- `none`
- `panel-shift`
- `line-draw`
- `text-mask`

## Rollout Plan

### Phase 1: Foundations

- Add `src/components/motion/core/useReducedMotion.ts`.
- Add `src/components/motion/backgrounds/RedField.tsx`.
- Add calibrated red CSS variables.
- Replace flat red section backgrounds with `RedField` or shared CSS material.
- Verify screenshots against mockups.

### Phase 2: Section Transitions

- Add `SectionReveal` using IntersectionObserver plus GSAP scoped to the section.
- Apply to hero copy, page hero, CMS sections, capability tiles, and process cards.
- No app-level wrapper.
- No scroll blocking.

### Phase 3: Interactions

- Refactor `CtaHover` into `MagneticButton` and `DirectionalFillButton`.
- Add `CardPressure` for capability/work cards.
- Add `BorderDraw` for process cards.

### Phase 4: Background Accents

- Add `InkMass` as SVG, not random CSS blobs.
- Place it only where the mockups use black masses.
- Add `SignalGrid` to large empty bottom/right areas.

### Phase 5: Preview And QA

- Expand `/animations/preview` into a component gallery.
- Include reduced-motion preview notes.
- Capture desktop/tablet/mobile screenshots for each phase.

## Acceptance Criteria

- Native scroll remains untouched.
- Only one browser scrollbar exists.
- No wheel/touch event prevention.
- Animations are section-local and cleanup correctly.
- Reduced-motion mode disables non-essential motion.
- Background red visually matches mockups better than pure `#FF0000`.
- No component creates horizontal overflow on mobile.
- Build and typecheck pass after every phase.

## First Build Target

Start with these three components:

- `RedField`: solves the current orangish/flat color mismatch and creates mockup-like red depth.
- `SectionReveal`: gives premium section entrance without scroll hijacking.
- `DirectionalFillButton`: improves CTA feedback without noisy decorative motion.

Do not build icon animation first. The current SVGs are flattened and will look cheap unless redrawn or authored as Lottie/Rive assets.
