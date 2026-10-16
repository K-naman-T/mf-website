# OFY work plates — generation briefs + slot-in pipeline

*JV · 2026-09-16 · for the home-page work columns (PREDICTION / VOICE / INDUSTRIAL / CUSTOM)*

## What a plate is
One ink symbol per category that stands for **every project in that category** — never a project mockup, never a screenshot. Locked set: **clock-hand** (Prediction) · **off-hook handset** (Voice) · **calipers** (Industrial) · **casting mold** (Custom).

## House spec (match exactly — current set on site)
- 720 × 1280 PNG, portrait
- Strictly 2 colors: `#FF0000` + `#000000`
- red theme = black ink on red field · dark theme = red ink on black field — **ONE master per category**; the pipeline emits both (theme variants are color maps of the same 1-bit mask)
- Ordered (Bayer 8×8) dither
- Subject inside the central ~70% (columns crop via `object-fit: cover` — keep generous margins)
- No text · no numbers · no logos · no watermark · no faces

## Generate (Grok Imagine — one image per category, portrait)

Append this style tail to every prompt:

> — stark black ink drawing: heavy pen-and-ink hatching and solid blacks, woodcut/engraving feel, plain white background; 1-bit high contrast; no grayscale gradients; no color; no text; no letters; no watermark; no border; single subject; generous empty margins; centered composition; portrait orientation.

1. **PREDICTION — the dial and the hand that sets it**
   > A large circular dial seen straight on, radial tick marks like an old gauge, one long tapered needle just being placed at its center by fingertips — the exact moment a reading is set. No numerals.

   *Generic for any prediction / ranking / forecast / routing project: the moment a call is made.*

2. **VOICE — off-hook handset**
   > A classic telephone handset caught mid-lift off its cradle, its cord sweeping in one clean arc — the moment a line goes live. No tangle, no pile of cord.

   *The off-hook state = a conversation is live — covers STT, IVR, agents, call tooling.*

3. **INDUSTRIAL — calipers**
   > A machinist's vernier calipers clamped around a machined cylinder, jaws reading the diameter — the layer under the model: precision that still holds on Monday.

   *Alternate if keeping closer to the current file: heavy tongs gripping a rough lump of raw ore.*

4. **CUSTOM — casting mold**
   > Two halves of a foundry casting mold opening around a fresh casting, sprue still attached — made to shape, no two alike.

   *Alternate if keeping closer to the current file: a heavy lock-and-latch hardware assembly.*

## Slot-in (one command per plate)
```bash
python3 scripts/ofy_plate_pipeline.py assets/ofy-plate-raws/<slug>.png --slug <slug> --out public/assets/ofy-brand/work
python3 scripts/ofy_plate_pipeline.py --verify public/assets/ofy-brand/work/dark/<slug>.png
```
- Handles any input size/format: autocontrast → denoise (median) → cover-crop 720×1280 → paper/ink clamp → Bayer dither → writes **both** theme variants.
- If the raw came out light-on-dark, add `--invert`. Optional `--ink 0.28` forces target coverage.
- Output lands directly in `public/assets/ofy-brand/work/{red,dark}/<slug>.png` — no code changes needed to swap plates.
- Round-trip validated 2026-09-16: handset sim → 20.0% ink, exactly 2 colors, clean plate (demo: `demo_v3.png`, rated 9/10 red / 8/10 dark by an independent visual pass).

## Acceptance checklist (per plate, before deploy)
- [ ] `--verify` → exactly 2 colors: (255,0,0) + (0,0,0)
- [ ] reads at 180×320 thumbnail size
- [ ] no text / watermark; subject survives the column crop in both themes
- [ ] the symbol still means the CATEGORY with zero project context

## Files
- Pipeline: `scripts/ofy_plate_pipeline.py` (repo)
- Raws: drop into `assets/ofy-plate-raws/` (create dir; not shipped)
- Output: `public/assets/ofy-brand/work/red/<slug>.png` + `.../dark/<slug>.png`
