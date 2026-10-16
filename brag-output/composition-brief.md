# Hyperframes Composition Brief: oddfromyou

## Objective
Create a short launch-style brag video for oddfromyou.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `/home/knamant/mf-website`
- Primary files read: PRODUCT.md, MF_DESIGN.md, src/content/home.md, src/content/manifesto.md, src/components/home/OfyArtHome.tsx, src/app/globals.css, public/brand, public/assets/ofy-brand
- Product name: oddfromyou
- Tagline / strongest claim: if it could have come from anyone, it is not for us.
- Key UI or visual moment to recreate: Oo bicolor mark; live hero builders plate; four work columns (PREDICTION / VOICE / INDUSTRIAL / CUSTOM)
- Copy that must appear verbatim:
  - we are a team of builders with design & engineering taste.
  - what we build
  - PREDICTION / VOICE / INDUSTRIAL / CUSTOM
  - if it could have come from anyone, it is not for us.
  - bring us the part that doesn't fit.
  - oddfromyou.com

## Creative Direction
- Tone preset: polished
- Creative direction: quiet-premium industrial product film; bold, exacting, irreverent; never generic SaaS
- Interpretation: four long holds, slow 0.7s crossfades, Teko uppercase, pure red/black/white. Motion hits then holds. No glass, no gradients, no rounded cards, no SaaS language.
- Angle: A quiet industrial film of a studio that refuses sameness. The Oo mark is the punctuation. The four practices are the work. The last line is the filter.
- Hook: Black. Red O, then white O. The mark, not the name.
- Outro / punchline: manifesto line, then mark + oddfromyou.com
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Soft shadows, glass, pastel, rounded UI

## Visual Identity
- Background: `#000000` and `#FF0000`
- Text: `#FFFFFF` on black; `#000000` on red
- Accent: `#FF0000`
- Display font: Teko (local @font-face)
- Body font: Inter (bundled)
- Visual references from the project:
  - `public/brand/ofy-short-logo.svg` (Oo mark)
  - `public/assets/ofy-brand/new-backgrounds/red/hero.png`
  - `public/assets/ofy-brand/work/red/{prediction,voice,industrial,custom}.png`

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The mark — 5.0s — black; red O then white O; hold
2. Builders — 5.0s — full-bleed red; live hero illustration; headline
3. What we build — 6.0s — four live work plates sequential, then hold
4. The filter — 5.0s — manifesto line; mark; URL

## Audio
- Audio role: cinematic support
- Audio arc: low bed throughout; three quiet physical cues; fade under the URL
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`
- Music treatment: volume 0.28; fade in 0.4s; fade out last 1.2s
- Music cue guidance: bundled preset `/home/knamant/.config/opencode/skills/brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`. Strong locks: 8.74s unused if it rushes copy; 10.93 first plate; 13.11 last plate; 17.47 manifesto. Sequential practices on 10.93 / 11.46 / 12.02 / 12.55 then hold.
- Audio-reactive treatment: subtle; red glow and mark presence breathe with RMS/bass. No waveform.
- Audio-coupled moments:
  - Scene 1 red O land — drop
  - Scene 3 first plate — soft impact
  - Scene 4 manifesto settle — bong
- SFX selection guidance: polished, 3 cues, low HF risk. Prefer `interface/drop_001`, `impact/impactSoft_medium_001`, `interface/bong_001`.
- SFX analysis guidance: `/home/knamant/.config/opencode/skills/brag/assets/sfx/sfx-analysis.md`
- Exact SFX choice: Hyperframes should choose filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any Hyperframes-selected SFX into `brag-output/composition/assets/`

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills. /brag is its own workflow: do not enter the hyperframes entry-point intent interview.

Requirements:
- Show at least one real UI, copy, or visual element from the source project.
- Keep all text readable in the final render.
- Keep the video within 15-25 seconds.
- Include the planned music/SFX layer.
- Treat music cue metadata as optional timing hints.
- Major reveals may move toward nearby strong cues within about ±0.15s.
- Use local assets.
- Run `hyperframes check` before render.
- Seek-safe paused GSAP timeline, `data-*` timing, no Math.random, no tween on `.clip`.
