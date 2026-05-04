---
name: Metafloor
version: "2.0"
description: Sovereign AI foundry — deterministic production systems. Bold industrial design system with dual Red Mode (vibrant red backgrounds) and Stealth Mode (pure black with red accents). High-contrast, unapologetic, built-to-run aesthetic.
colors:
  brand-red: "#FF0000"
  bg-red: "#FF0000"
  bg-dark: "#000000"
  bg-surface-dark: "#0A0A0A"
  text-on-red: "#000000"
  text-on-dark: "#FFFFFF"
  text-secondary: "#888888"
  text-secondary-dark: "#A0A0A0"
  button-primary-red: "#000000"
  button-primary-dark: "#FF0000"
  border-subtle: "#333333"
  border-strong: "#000000"
  grid-line: "#000000"
typography:
  display:
    fontFamily: "'Teko', 'Bebas Neue', 'Anton', 'Osazy', system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 10vw, 8rem)"
    fontWeight: 400
    lineHeight: 0.9
    letterSpacing: "-0.01em"
    textTransform: "uppercase"
  heading-1:
    fontFamily: "'Teko', 'Bebas Neue', 'Anton', system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "0em"
    textTransform: "uppercase"
  heading-2:
    fontFamily: "'Teko', 'Bebas Neue', 'Anton', system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.0
    textTransform: "uppercase"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  body-small:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    letterSpacing: "0.12em"
    textTransform: "uppercase"
  logo-display:
    fontFamily: "'Teko', 'Bebas Neue', system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    letterSpacing: "0.15em"
    textTransform: "uppercase"
rounded:
  none: "0px"
  sm: "2px"
  md: "4px"
  lg: "8px"
  xl: "12px"
  browser: "8px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "64px"
  3xl: "96px"
  section: "120px"
  section-mobile: "80px"
components:
  button-primary:
    backgroundColor: "{colors.button-primary-dark}"
    textColor: "{colors.text-on-dark}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    paddingX: "28px"
    paddingY: "14px"
    border: "none"
    transition: "all 0.1s ease"
  button-primary-red-mode:
    backgroundColor: "{colors.button-primary-red}"
    textColor: "{colors.text-on-red}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    paddingX: "28px"
    paddingY: "14px"
    border: "none"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.brand-red}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    paddingX: "28px"
    paddingY: "14px"
    border: "2px solid {colors.brand-red}"
  button-secondary-red-mode:
    backgroundColor: "transparent"
    textColor: "{colors.text-on-red}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    paddingX: "28px"
    paddingY: "14px"
    border: "2px solid {colors.text-on-red}"
  nav-link:
    typography: "{typography.label}"
    color: "{colors.text-on-dark}"
    hoverColor: "{colors.brand-red}"
  panel-bordered:
    backgroundColor: "transparent"
    border: "1px solid {colors.border-subtle}"
    rounded: "{rounded.none}"
    padding: "28px"
  panel-dark:
    backgroundColor: "{colors.bg-surface-dark}"
    border: "1px solid {colors.border-subtle}"
    rounded: "{rounded.none}"
    padding: "28px"
  grid-cell:
    backgroundColor: "transparent"
    border: "1px solid {colors.border-strong}"
    rounded: "{rounded.none}"
    padding: "24px"
  browser-chrome:
    borderRadius: "{rounded.browser}"
    backgroundColor: "{colors.bg-surface-dark}"
    border: "1px solid {colors.border-subtle}"
    overflow: "hidden"
layout:
  maxWidth: "1400px"
  containerPadding: "24px"
  gridGap: "0px"
  gridGutter: "1px"
  sectionPaddingY: "120px"
  sectionPaddingYMobile: "80px"
elevation:
  none: "none"
  card: "none"
  subtle-border: "0 0 0 1px {colors.border-subtle}"
shapes:
  star-blob: "organic, irregular, hand-drawn feel with 5-7 pointed stars embedded. Used in icons, hero graphic, and decorative elements. High contrast black or red fills."
  liquid-blob: "amorphous organic black shapes with soft edges, used as background decoration in hero sections and as floating elements. Can contain embedded star motifs. In Red Mode: black shapes on red. In Stealth Mode: red shapes on black."
---

# DESIGN.md — Metafloor v2.0

**Sovereign AI Foundry • Deterministic Production Systems**

## Overview / Visual Theme & Atmosphere

Metafloor builds the deterministic layer underneath probabilistic AI engines. We ship systems that run in production 24/7 — dirty data, Hinglish users, no GPU babysitting.

The design language is **industrial, provocative, high-contrast, and zero-fluff**. It rejects polished SaaS gradients, rounded pastel UIs, and demo-ware aesthetics. Instead: raw red energy + black seriousness. Think brutalist tech manifesto meets modern developer tooling.

**Core Vibe:**
- Bold, condensed uppercase headlines that fill the viewport width at mobile
- Maximum contrast (red/black/white only — no grays except secondary text)
- Flat, no shadows or blurs
- Structural black grid lines visible throughout the layout
- Custom "star-blob" and "liquid-blob" motifs as decorative/hero elements
- Browser chrome/window shell motifs on selected pages
- Typography that feels compressed, engineered, and commanding

**Primary Visual Language: Red Mode**
Red Mode is the primary visual language. Use it for home page hero, problem section, and feature bands. Stealth/Dark Mode is secondary — derived, not equal.

**Two Modes:**

1. **Red Mode** (primary — vibrant, urgent, factory-floor energy)
   - Full-bleed `#FF0000` background
   - Black text, black borders, black grid lines
   - Black liquid blobs + floating star elements as hero decoration
   - Used for: home hero, problem section, primary CTA bands

2. **Stealth Mode** (secondary — dark, focused, ops-center)
   - Pure `#000000` background
   - White primary text + `#FF0000` accents for CTAs and highlights
   - `#0A0A0A` surface panels for cards/secondary sections
   - Red liquid blobs + white star elements as hero decoration
   - Used for: alternate page themes, about, dark-mode sections

**Never do:**
- Soft shadows, glassmorphism, neumorphism, or gradients
- Pastel colors, low contrast, or rounded corners on UI elements (outer shell excepted)
- Generic AI illustrations or stock photos
- Weak CTAs or apologetic microcopy
- Using gray except `#888888` for secondary text or `#333333` for subtle borders in dark mode

## Colors

**Semantic Roles (exact hex — non-negotiable)**

| Role                    | Token                  | Hex       | When to Use |
|-------------------------|------------------------|-----------|-------------|
| Brand Red (Primary)     | `brand-red`            | `#FF0000` | CTAs, accents, Red Mode backgrounds, stars in dark mode |
| Red Mode Background     | `bg-red`               | `#FF0000` | Hero, problem section, feature bands |
| Stealth Mode Background | `bg-dark`              | `#000000` | Main dark theme, nav, footer |
| Surface (cards in dark) | `bg-surface-dark`      | `#0A0A0A` | Feature cards, secondary panels |
| Text on Red             | `text-on-red`          | `#000000` | All text and borders in Red Mode |
| Text Primary (dark)     | `text-on-dark`         | `#FFFFFF` | Headlines & body in Stealth Mode |
| Text Secondary          | `text-secondary`       | `#888888` | Descriptions, captions (both modes) |
| Button Primary (Stealth)| `button-primary-dark`  | `#FF0000` | Main CTAs in dark mode |
| Button Primary (Red)    | `button-primary-red`   | `#000000` | Main CTAs in red mode |
| Subtle Border (dark)    | `border-subtle`        | `#333333` | Card borders, dividers in dark mode |
| Strong Border           | `border-strong`        | `#000000` | Grid lines, panel borders in red mode |

**WCAG:** Red on black (#FF0000 on #000000) = 5.6:1 contrast. Acceptable but document intentionally. White on black = 21:1. All other combinations meet WCAG AA 4.5:1+.

## Typography

**Display Font Stack:** Teko → Bebas Neue → Anton → system-ui fallback.
This is non-negotiable for all display/heading contexts. Inter is body/nav/label only.

**Hierarchy (strict — do not deviate):**

- **Display / Hero Headline:** `font-weight: 400`, `text-transform: uppercase`, `line-height: 0.9`. Ultra-condensed. Fills viewport width on mobile. Massive commanding treatment: "CUT THE SLOP", "EVERYONE SELLS AI. NOBODY SHIPS IT."
- **H1:** `font-weight: 400`, uppercase, tight line-height.
- **H2 / Section Titles:** `font-weight: 400`, uppercase, `line-height: 1.0`.
- **Body:** `font-weight: 400`, Inter, generous line-height for technical copy.
- **Labels / Buttons / Nav:** `font-weight: 600`, `letter-spacing: 0.12em`, uppercase. Inter only.
- **Logo / Wordmark:** Teko or condensed, uppercase. "METAFLOOR™" treatment.

**Key Rules:**
- Display headlines on mobile: use `font-size: clamp(3rem, 15vw, 8rem)` to fill screen width
- Headlines never wrap awkwardly — use `text-wrap: balance` or manual breaks
- Red Mode: black text at full weight
- Stealth Mode: white text with red emphasis on key words ("ACTUALLY", "NOT JUST IN DEMOS")
- Never use Inter for display headings

## Layout & Spacing

**Brutalist Grid System:**
The layout is a visible black grid. Gutters are `1px` black lines. This creates the newspaper/poster feel.

**Principles:**
- Full-bleed sections (no max-width container on hero, problem, and CTA bands)
- Generous vertical rhythm: `120px` section padding desktop, `80px` mobile
- Visible structural grid lines: `1px solid #000000` in red mode, `1px solid #333333` in dark mode
- Horizontal rhythm: `0px` gap (grid lines create the visual separation)
- Max content width: `1400px` centered with `24px` side padding
- 4-column grid desktop → 2-column tablet → 1-column mobile
- Feature/grid cells: full black border, no border-radius

**Browser Chrome Motif:**
On Work page: browser window shell with red top bar, traffic-light dots (red/yellow/green), address bar showing "metafloor.ai". This is a structural element, not decoration.

**Responsive Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

## Icon System

36 star-blob icons in `brand/` folder. Each is an organic irregular shape with an embedded 5-7 pointed star. Usage:

- Section markers: `09-monitoring-eye.svg`, `21-process-hierarchy.svg`
- Feature indicators: icons used within grid cells
- Hero decoration: embedded in liquid blob shapes
- Nav/Logo: two-star mark in navbar wordmark

**Never modify icon fills.** They are exported in black. Apply fill color via CSS/SVG `fill` attribute when placing.

## Liquid Blob Animations

**Purpose:** Create organic, flowing black (red mode) or red (stealth mode) amorphous shapes in hero sections. These are not decorative CSS — they are animated SVG paths or clip-path blobs.

**Technical Approach:**
1. **SVG Path Morphing (GSAP):** Define 2-3 blob path shapes per animated element. GSAP morphs between them on a loop with `ease: "sine.inOut"`, duration `4-8s`, infinite repeat.
2. **Clip-path Animation (CSS + GSAP):** Use `clip-path: polygon()` keyframes with waypoints defined as percentages. Less smooth but better browser compat.
3. **Canvas/WebGL (advanced):** For complex Perlin-noise-driven fluid sim, use a lightweight canvas layer behind content. See: `react-canvas-fluid` or custom WebGL shader blob.
4. **Fallback:** If complex animation not feasible, use CSS `@keyframes` with gentle scale/translate pulses on a single blob SVG shape.

**When to use:**
- Hero section: 2-3 blob layers behind the headline, slow continuous morph
- Problem section: single large blob behind the manifesto text
- Page transitions: brief blob fill that wipes across screen
- CTA bands: subtle blob pulse on hover

**Rules:**
- Blob colors: `#000000` in red mode, `#FF0000` in stealth mode
- z-index: always below text content
- Opacity: `0.7-0.9` (semi-opaque to let the background color show through slightly)
- No blob on: feature cards, nav, footer, form elements

## Components

### Buttons
- **Primary (Stealth Mode):** Red `#FF0000` bg, white text, no border, uppercase label, `0px` radius.
- **Primary (Red Mode):** Black bg, black text, same sharp style.
- **Secondary:** Transparent bg, 2px red border, red text. Hover: solid red fill + white text.
- **All:** `28px` h-padding, `14px` v-padding, `0.1s` ease transition. No scale lifts.

### Navigation
- Top bar: Logo left (two-star mark + "METAFLOOR™"), links (WORK, ABOUT, CONTACT), right: "INITIATE A SIGNAL" primary button.
- Red Mode: black text on red bg.
- Stealth Mode: white text, red button.
- Mobile: hamburger → full-screen overlay with same color logic.

### Grid Cells / Panels
- Full `1px solid #000000` border (red mode) or `1px solid #333333` (dark mode)
- `0px` border-radius on internal cells
- `8px` border-radius on outer browser shell only
- `24px` internal padding
- Star-blob icon top-left inside cell

### Browser Chrome Shell
- `8px` border-radius on outer container
- Red (`#FF0000`) or dark (`#0A0A0A`) top bar
- Traffic-light dots: `12px` circles, red `#FF0000`, yellow `#FFD700`, green `#00FF00` in a row
- Address bar: `32px` height, shows "metafloor.ai" in label font
- Content area: scrollable with black border

### Hero Graphic
- Red Mode: black liquid blob + floating black star shapes on red bg
- Stealth Mode: red liquid blob + floating red star shapes on black bg
- Blob morphs continuously, slow ease cycles
- Text left, blob right on desktop. Stacks below text on mobile.

### Problem / Manifesto Section
- Full-bleed red (or black in dark mode)
- Left: large star-blob icon + "THE PROBLEM" label
- Right: massive headline "EVERYONE SELLS AI. NOBODY SHIPS IT." + supporting paragraphs
- Bottom: metric question in bold
- Full black borders between left/right on desktop, stacked on mobile

### Footer
- Minimal: email, website, "BUILT TO RUN. NOT BUILT TO PITCH." tagline
- Top border: `1px solid #333333`
- Black background, white text, same red button logic

## Do's and Don'ts

**DO:**
- Use exact `#FF0000` and `#000000` everywhere
- Use Teko/Bebas Neue for all display headings, not Inter
- Maintain 0px radius on all interactive UI elements
- Use visible structural grid lines (1px black borders)
- Support instant Red ↔ Stealth mode toggle
- Animate liquid blobs with GSAP morph loops
- Use browser chrome motif on Work/selected work pages
- Test at 375px (mobile), 768px (tablet), 1280px+ (desktop)

**DON'T:**
- Use Inter for display headings or section titles
- Use blue, green, purple, or any color outside the defined palette
- Use soft shadows, blur effects, or gradients on UI elements
- Add rounded corners (beyond outer browser shell) to grid cells
- Use generic "Learn more" copy — always specific ("VIEW OUR WORK", "INITIATE A SIGNAL")
- Let text hierarchy collapse on mobile — display headline stays massive
- Use `border-radius` on feature cards or buttons

## Security Requirements

- No secrets, API keys, or credentials in source code
- No inline scripts; use CSP headers
- Sanitize all user inputs in contact form
- Use `rel="noopener noreferrer"` on all external links
- Validate all form fields server-side
- Use HTTPS for all external resource loads
- No inline SVG with dynamic user content (XSS risk)

## Testing Protocol

After each page, section, or major component is complete:
1. Take a full-viewport screenshot at `1280px` desktop
2. Take a full-viewport screenshot at `768px` tablet
3. Take a full-viewport screenshot at `375px` mobile
4. Compare against mockup visually
5. Check for: contrast issues, overflow, text wrapping, interactive target sizes (min 44px)
6. Run `npm run build` after each page to catch type errors
7. Run lighthouse audit: Performance > 90, Accessibility > 90, Best Practices > 90, SEO > 90

## Pages

1. **Home** (`/`) — Red mode primary. Hero, services grid (4 cells), problem band, footer.
2. **Design** (`/design`) — Hero with "Design. Engineering. Outcomes." headline, browser chrome layout, blob hero graphic.
3. **Process** (`/process`) — "How We Work" + 4 process steps + CTA band + footer.
4. **Capabilities** (`/capabilities`) — "Capabilities" hero + 4 capability cards with tags.
5. **Work** (`/work`) — Browser chrome with project cards + outcome rows.
6. **About** (`/about`) — Dark mode, manifesto text, minimal.
7. **Contact** — Contact form, minimal dark theme.

---

*End of DESIGN.md — Metafloor v2.0*
